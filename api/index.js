module.exports = async (req, res) => {
  // CORS 헤더 추가 (필요하다면)
  res.setHeader('Access-Control-Allow-Origin', 'https://ncc-front.vercel.app/');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
};


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
