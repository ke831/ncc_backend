const { Client } = require("@notionhq/client");

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  notionVersion: '2022-06-28',
});

const databaseId = process.env.NOTION_DATABASE_ID;

// ✅ 전체 페이지 최신순 조회
async function getPages() {
  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [{ property: 'event_date', direction: 'descending' }],
    page_size: 10,
  });
  return response.results;
}

// ✅ 요약 정보 조회
async function getPagesSummary() {
  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [{ property: 'event_date', direction: 'descending' }],
    page_size: 10,
  });

  return response.results.map((page) => {
    const title = page.properties.title?.title[0]?.text?.content || '';
    const eventDate = page.properties.event_date?.date?.start || null;
    return { pageId: page.id, title, eventDate };
  });
}

// ✅ 단일 페이지 원본 조회
async function getPageDetails(pageId) {
  return await notion.pages.retrieve({ page_id: pageId });
}

// 텍스트 및 링크 추출
async function getPageTextAndLinksOnly(pageId) {
  const response = await notion.blocks.children.list({ block_id: pageId });
  const items = [];

  for (const block of response.results) {
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
    }
  }

  return items;
}
// ✅ 간단 상세 정보 (텍스트 제외, 이미지 파일 처리 포함)
async function getSimplePageDetails(pageId) {
  const detail = await getPageDetails(pageId);

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

  return { title, description, eventDate, image };
}

module.exports = {
  getPages,
  getPagesSummary,
  getPageDetails,
  getPageTextAndLinksOnly,
  getSimplePageDetails
};