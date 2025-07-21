const { Client } = require("@notionhq/client");

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  notionVersion: '2022-06-28',
});

const databaseId = process.env.NOTION_DATABASE_ID;

// ✅ 새 페이지 생성
async function createPage(title, description, eventDate, imageUrl) {
  return await notion.pages.create({
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
  });
}

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

// ✅ 본문 텍스트 및 링크만 추출
async function getPageTextAndLinksOnly(pageId) {
  const response = await notion.blocks.children.list({ block_id: pageId });
  const items = [];

  for (const block of response.results) {
    const richTextArray = block[block.type]?.rich_text;
    if (Array.isArray(richTextArray)) {
      for (const rt of richTextArray) {
        const item = {};
        if (rt.text?.content) item.text = rt.text.content;
        if (rt.text?.link?.url) item.url = rt.text.link.url;
        if (Object.keys(item).length > 0) {
          items.push(item);
        }
      }
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
  createPage,
  getPages,
  getPagesSummary,
  getPageDetails,
  getPageTextAndLinksOnly,
  getSimplePageDetails
};