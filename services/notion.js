const { Client } = require("@notionhq/client");

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  notionVersion: '2022-06-28',
});

function getDatabaseId(topic) {
  switch (topic) {
    case 'news':
      return process.env.NOTION_DATABASE_ID_NEWS;
    case 'weekly-bulletin':
      return process.env.NOTION_DATABASE_ID_EVENTS;
    default:
      throw new Error('Unknown topic');
  }
}




function logEnvAndEntry(fnName, args) {
  console.log(`[notion.js] 함수 진입: ${fnName}`);
  if (args) console.log(`[notion.js] 인자:`, args);
  console.log('[notion.js] NOTION_TOKEN:', process.env.NOTION_TOKEN ? process.env.NOTION_TOKEN.slice(0,4) + '...' : undefined);
}
function logTime(label, start) {
  const end = Date.now();
  console.log(`[notion.js] ${label} - 경과(ms):`, end - start);
}

async function createPage(title, description, eventDate, imageUrl) {
  logEnvAndEntry('createPage', { title, description, eventDate, imageUrl });
  const t0 = Date.now();
  try {
    const payload = {
      parent: { database_id: databaseId },
      properties: {
        title: { title: [{ text: { content: title } }] },
        description: { rich_text: [{ text: { content: description } }] },
        event_date: { date: { start: eventDate } },
        image: {
          files: [{
            name: "업로드 이미지",
            type: "external",
            external: { url: imageUrl }
          }]
        }
      }
    };
    console.log('[notion.js] createPage payload:', JSON.stringify(payload));
    const result = await notion.pages.create(payload);
    logTime('createPage Notion API', t0);
    console.log('[notion.js] createPage 전체 결과:', result);
    return result;
  } catch (e) {
    console.error('[notion.js] createPage 에러:', e);
    throw e;
  }
}

// ✅ 전체 페이지 최신순 조회
async function getPages() {
  logEnvAndEntry('getPages');
  const t0 = Date.now();
  try {
    const query = {
      database_id: databaseId,
      sorts: [{ property: 'event_date', direction: 'descending' }],
      page_size: 10,
    };
    console.log('[notion.js] getPages query:', query);
    const response = await notion.databases.query(query);
    logTime('getPages Notion API', t0);
    console.log('[notion.js] getPages 전체 결과:', response);
    return response.results;
  } catch (e) {
    console.error('[notion.js] getPages 에러:', e);
    throw e;
  }
}

// ✅ 요약 정보 조회
async function getPagesSummary(topic) {
  const databaseId = getDatabaseId(topic);
  console.log('[notion.js] getPagesSummary databaseId:', databaseId);
  logEnvAndEntry('getPagesSummary');
  const t0 = Date.now();
  try {
    const query = {
      database_id: databaseId,
      sorts: [{ property: 'event_date', direction: 'descending' }],
      page_size: 10,
    };
    console.log('[notion.js] getPagesSummary query:', query);
    const response = await notion.databases.query(query);
    logTime('getPagesSummary Notion API', t0);
    const summaries = response.results.map((page, idx) => {
      const title = page.properties.title?.title[0]?.text?.content || '';
      const eventDate = page.properties.event_date?.date?.start || null;
      const summary = { pageId: page.id, title, eventDate };
      console.log(`[notion.js] getPagesSummary map[${idx}]:`, summary);
      return summary;
    });
    console.log('[notion.js] getPagesSummary 전체 결과:', summaries);
    return summaries;
  } catch (e) {
    console.error('[notion.js] getPagesSummary 에러:', e);
    throw e;
  }
}

// ✅ 단일 페이지 원본 조회
async function getPageDetails(topic, pageId) {
  const databaseId = getDatabaseId(topic);
  logEnvAndEntry('getPageDetails', { pageId });
  const t0 = Date.now();
  try {
    const result = await notion.pages.retrieve({ page_id: pageId });
    logTime('getPageDetails Notion API', t0);
    console.log('[notion.js] getPageDetails 전체 결과:', result);
    return result;
  } catch (e) {
    console.error('[notion.js] getPageDetails 에러:', e);
    throw e;
  }
}

// 텍스트 및 링크 추출
async function getPageTextAndLinksOnly(topic, pageId) {
  const databaseId = getDatabaseId(topic);
  logEnvAndEntry('getPageTextAndLinksOnly', { pageId });
  const t0 = Date.now();
  try {
    const response = await notion.blocks.children.list({ block_id: pageId });
    logTime('getPageTextAndLinksOnly Notion API', t0);
    console.log('[notion.js] getPageTextAndLinksOnly blocks:', response.results);
    const items = [];
    for (const [i, block] of response.results.entries()) {
      const item = {};

      // 텍스트 및 하이퍼링크
      const richTextArray = block[block.type]?.rich_text;
      if (Array.isArray(richTextArray)) {
        const texts = richTextArray.map(rt => rt.text?.content).filter(Boolean);
        const links = richTextArray.map(rt => rt.text?.link?.url).filter(Boolean);
        if (texts.length > 0) item.texts = texts;
        if (links.length > 0) item.links = links;
      }

      // 이미지 블록
      if (block.type === 'image') {
        const imageData = block.image;
        const imageUrl = imageData?.type === 'external'
          ? imageData.external.url
          : imageData?.type === 'file'
          ? imageData.file.url
          : null;
        if (imageUrl) item.image = imageUrl;
      }

      // 임베디드 블록
      if (block.type === 'embed') {
        const embedUrl = block.embed?.url;
        if (embedUrl) item.embed = embedUrl;
      }

      // 비디오 블록
      if (block.type === 'video') {
        const videoData = block.video;
        const videoUrl = videoData?.type === 'external'
          ? videoData.external.url
          : videoData?.type === 'file'
          ? videoData.file.url
          : null;
        if (videoUrl) item.video = videoUrl;
      }

      // 파일 블록
      if (block.type === 'file') {
        const fileData = block.file;
        const fileUrl = fileData?.type === 'external'
          ? fileData.external.url
          : fileData?.type === 'file'
          ? fileData.file.url
          : null;
        if (fileUrl) item.file = fileUrl;
      }

      // 유효한 데이터가 있을 경우에만 배열에 추가
      if (Object.keys(item).length > 0) {
        items.push(item);
        console.log(`[notion.js] getPageTextAndLinksOnly items[${i}]:`, item);
      }
    }
    console.log('[notion.js] getPageTextAndLinksOnly 전체 결과:', items);
    return items;
  } catch (e) {
    console.error('[notion.js] getPageTextAndLinksOnly 에러:', e);
    throw e;
  }
}
// ✅ 간단 상세 정보 (텍스트 제외, 이미지 파일 처리 포함)
async function getSimplePageDetails(topic, pageId) {
  const databaseId = getDatabaseId(topic);
  console.log('topic:', topic);
  console.log('databaseId:', databaseId);
  logEnvAndEntry('getSimplePageDetails', { pageId });
  const t0 = Date.now();
  try {
    const detail = await getPageDetails(pageId);
    logTime('getSimplePageDetails getPageDetails', t0);
    const title = detail.properties.title?.title[0]?.text?.content || '';
    const description = detail.properties.description?.rich_text[0]?.text?.content || '';
    const eventDate = detail.properties.event_date?.date?.start || null;

    const imageFile = detail.properties.image?.files?.[0];
    let image = null;

    if (imageFile?.type === 'external') {
      image = imageFile.external.url;
    } else if (imageFile?.type === 'file') {
      image = imageFile.file.url;
    }

    const result = { title, description, eventDate, image };
    console.log('[notion.js] getSimplePageDetails 전체 결과:', result);
    return result;
  } catch (e) {
    console.error('[notion.js] getSimplePageDetails 에러:', e);
    throw e;
  }
}

module.exports = {
  getPages,
  getPagesSummary,
  getPageDetails,
  getPageTextAndLinksOnly,
  getSimplePageDetails
};