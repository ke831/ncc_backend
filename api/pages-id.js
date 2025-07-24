const { getPagesSummary } = require('../services/notion');

module.exports = async (req, res) => {
  // CORS 헤더 추가
  res.setHeader('Access-Control-Allow-Origin', 'https://ncc-front.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const pageId = req.query[0];

  try {
    const summaries = await getPageDetails(pageId);
    res.status(200).json(summaries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};  