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

// ✅ 최신순 전체 페이지 가져오기
async function getPages() {
  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [{ property: 'event_date', direction: 'descending' }],
    page_size: 10,
  });
  return response.results;
}

// ✅ 요약 정보 가져오기 (title, event_date, pageId)
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

// ✅ 단일 페이지 상세 정보
async function getPageDetails(pageId) {
  return await notion.pages.retrieve({ page_id: pageId });
}

// ✅ 본문 텍스트 또는 URL만 추출 (둘 중 하나만 있어도 해당 값만 반환)
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

module.exports = {
  createPage,
  getPages,
  getPagesSummary,
  getPageDetails,
  getPageTextAndLinksOnly
};