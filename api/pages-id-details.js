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