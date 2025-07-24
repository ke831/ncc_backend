const { getPagesSummary } = require('../services/notion');

module.exports = async (req, res) => {
  // CORS 헤더 추가 (필요하다면)
  res.setHeader('Access-Control-Allow-Origin', 'https://ncc-front.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const topic = req.query.topic;
  console.log('summary.js: topic =', topic); 

  if (!topic) {
    res.status(400).json({ error: 'Missing topic parameter' });
    return;
  }

  try {
    const summaries = await getPagesSummary(topic);
    res.status(200).json(summaries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};