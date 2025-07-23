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

// 요청 처리 시작 로그
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} 요청 시작`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} 요청 처리 완료 - ${res.statusCode} 응답 - 처리 시간: ${duration}ms`);
  });

  next();
});

// ✅ CORS 설정
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : [];
app.use(cors({
  origin: function (origin, callback) {
    console.log(`[${new Date().toISOString()}] CORS 요청 Origin: ${origin}`);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      console.log(`[${new Date().toISOString()}] CORS 승인 Origin: ${origin}`);
    } else {
      callback(new Error('Not allowed by CORS'));
      console.log(`[${new Date().toISOString()}] CORS 거부 Origin: ${origin}`);
    }
  },
  credentials: true,
}));

// ✅ 전체 페이지 조회
app.get('/pages', async (req, res) => {
  console.log(`[${new Date().toISOString()}] /pages 요청 시작`);
  try {
    const pages = await getPages();
    console.log(`[${new Date().toISOString()}] /pages 응답 데이터:`, JSON.stringify(pages));
    res.json(pages);
    console.log(`[${new Date().toISOString()}] /pages 요청 완료`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] /pages 에러:`, error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ 페이지 요약 조회
app.get('/pages/summary', async (req, res) => {
  console.log(`[${new Date().toISOString()}] /pages/summary 요청 시작`);
  try {
    const summaries = await getPagesSummary();
    console.log(`[${new Date().toISOString()}] /pages/summary 응답 데이터:`, JSON.stringify(summaries));
    res.json(summaries);
    console.log(`[${new Date().toISOString()}] /pages/summary 요청 완료`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] /pages/summary 에러:`, error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Notion raw 전체 상세 정보
app.get('/pages/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`[${new Date().toISOString()}] /pages/${id} 요청 시작`);
  try {
    const page = await getPageDetails(id);
    console.log(`[${new Date().toISOString()}] /pages/${id} 응답 데이터:`, JSON.stringify(page));
    res.json(page);
    console.log(`[${new Date().toISOString()}] /pages/${id} 요청 완료`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] /pages/${id} 에러:`, error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ 본문 텍스트/링크만 추출
app.get('/pages/:id/texts', async (req, res) => {
  const { id } = req.params;
  console.log(`[${new Date().toISOString()}] /pages/${id}/texts 요청 시작`);
  try {
    const content = await getPageTextAndLinksOnly(id);
    console.log(`[${new Date().toISOString()}] /pages/${id}/texts 응답 데이터:`, JSON.stringify(content));
    res.json(content);
    console.log(`[${new Date().toISOString()}] /pages/${id}/texts 요청 완료`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] /pages/${id}/texts 에러:`, error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ 간단 상세 정보 반환
app.get('/pages/:id/details', async (req, res) => {
  const { id } = req.params;
  console.log(`[${new Date().toISOString()}] /pages/${id}/details 요청 시작`);
  try {
    const detail = await getSimplePageDetails(id);
    console.log(`[${new Date().toISOString()}] /pages/${id}/details 응답 데이터:`, JSON.stringify(detail));
    res.json(detail);
    console.log(`[${new Date().toISOString()}] /pages/${id}/details 요청 완료`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] /pages/${id}/details 에러:`, error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = serverless(app);