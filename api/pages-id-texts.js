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