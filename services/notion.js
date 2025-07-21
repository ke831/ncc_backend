// services/notion.js
const { Client } = require("@notionhq/client");

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  // 여기에 Notion-Version을 추가합니다.
  notionVersion: '2022-06-28', // 이 줄을 추가해주세요.
});
const databaseId = process.env.NOTION_DATABASE_ID;

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

async function getPages() {
  const response = await notion.databases.query({ database_id: databaseId });
  return response.results;
}

module.exports = { createPage, getPages };