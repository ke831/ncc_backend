const { getPagesSummary } = require('../services/notion');

module.exports = async (req, res) => {
  // CORS 헤더 추가 (필요하다면)
  res.setHeader('Access-Control-Allow-Origin', 'https://saechuncheon.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 실제 API 로직
  try {
    const summaries = await getPagesSummary();
    res.status(200).json(summaries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
