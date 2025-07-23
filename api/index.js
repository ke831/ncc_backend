require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const serverless = require('serverless-http');

const {
  getPages,
  getPagesSummary,
  getPageDetails,
  getPageTextAndLinksOnly,
  getSimplePageDetails
} = require('../services/notion'); // ← 경로 주의!

const app = express();
app.use(bodyParser.json());

console.log(process.env.CORS_ORIGIN);
console.log(process.env.NOTION_TOKEN);
console.log(process.env.NOTION_DATABASE_ID);

// ✅ CORS 설정
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : [];
app.use(cors({
  origin: function(origin, callback) {
    console.log('CORS 요청 Origin:', origin); // ← 이 줄 추가!
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ✅ 전체 페이지 조회
app.get('/pages', async (req, res) => {
  try {
    const pages = await getPages();
    res.json(pages);
  } catch (error) {
    console.error('페이지 가져오기 오류:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ✅ 페이지 요약 조회
app.get('/pages/summary', async (req, res) => {
  try {
    const summaries = await getPagesSummary();
    res.json(summaries);
  } catch (error) {
    console.error('요약 리스트 오류:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Notion raw 전체 상세 정보
app.get('/pages/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const page = await getPageDetails(id);
    res.json(page);
  } catch (error) {
    console.error('상세 페이지 오류:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ✅ 본문 텍스트/링크만 추출
app.get('/pages/:id/texts', async (req, res) => {
  const { id } = req.params;
  try {
    const content = await getPageTextAndLinksOnly(id);
    res.json(content);
  } catch (error) {
    console.error('텍스트/링크 추출 오류:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ✅ 간단 상세 정보 반환 (/details)
app.get('/pages/:id/details', async (req, res) => {
  const { id } = req.params;
  try {
    const detail = await getSimplePageDetails(id);
    res.json(detail);
  } catch (error) {
    console.error('간단 상세 정보 오류:', error.message);
    res.status(500).json({ error: error.message });
  }
});


module.exports = serverless(app);