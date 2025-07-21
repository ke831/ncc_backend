// index.js (수정된 코드)
require('dotenv').config(); // ✨ 이 줄이 반드시 가장 위에 있어야 합니다!

const express = require('express');
const bodyParser = require('body-parser');
const { getPages, createPage } = require('./services/notion');

// 👇 환경 변수 로드 확인을 위한 console.log 추가
console.log('--- 환경 변수 디버깅 시작 ---');
console.log('NOTION_TOKEN (process.env):', process.env.NOTION_TOKEN ? '성공적으로 로드됨' : '로드 안 됨 또는 undefined');
console.log('NOTION_DATABASE_ID (process.env):', process.env.NOTION_DATABASE_ID ? '성공적으로 로드됨' : '로드 안 됨 또는 undefined');
console.log('--------------------------');
// 👆 디버깅 라인 끝

const app = express();
app.use(bodyParser.json());

app.get('/pages', async (req, res) => {
  try {
    const pages = await getPages();
    res.json(pages);
  } catch (error) {
    console.error('페이지 가져오기 오류:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/pages', async (req, res) => {
  // tags가 아니라 description, eventDate, imageUrl이 누락되었을 수 있습니다.
  // services/notion.js의 createPage 시그니처와 req.body가 일치하는지 확인하세요.
  const { title, description, eventDate, imageUrl } = req.body; 
  try {
    const result = await createPage(title, description, eventDate, imageUrl); // 수정된 인자
    res.json(result);
  } catch (error) {
    console.error('페이지 생성 오류:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});