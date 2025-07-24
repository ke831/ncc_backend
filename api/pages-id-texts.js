const { getPageTextAndLinksOnly } = require('../services/notion');

module.exports = async (req, res) => {
  // CORS 헤더 추가
  res.setHeader('Access-Control-Allow-Origin', 'https://ncc-front.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 동적 파라미터(id)는 vercel.json에서 정규식 매핑 시 req.query[0]에 들어감
  const id = req.query[0];
  console.log('pages-id-texts.js: id =', id);
  console.log("req.url:", req.url);
  console.log("req.query:", req.query);
  console.log('NOTION_TOKEN:', process.env.NOTION_TOKEN ? process.env.NOTION_TOKEN.slice(0, 4) + '...' : 'undefined');
  console.log('NOTION_DATABASE_ID:', process.env.NOTION_DATABASE_ID ? process.env.NOTION_DATABASE_ID.slice(0, 4) + '...' : 'undefined');

  if (!id) {
    res.status(400).json({ error: 'Missing id parameter' });
    return;
  }

  try {
    const content = await getPageTextAndLinksOnly(id);
    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};