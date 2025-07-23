console.log('서버 시작 - 주요 환경변수');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);
console.log('NOTION_TOKEN:', process.env.NOTION_TOKEN ? process.env.NOTION_TOKEN.slice(0,4) + '...' : undefined);

app.use((req, res, next) => {
  console.log('--- 요청 시작 ---');
  console.log('요청 URL:', req.originalUrl);
  console.log('요청 메서드:', req.method);
  console.log('요청 헤더:', req.headers);
  console.log('요청 쿼리:', req.query);
  console.log('요청 파라미터:', req.params);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);
  console.log('NOTION_TOKEN:', process.env.NOTION_TOKEN ? process.env.NOTION_TOKEN.slice(0,4) + '...' : undefined);
  next();
});

app.use(cors({
  origin: function(origin, callback) {
    console.log('CORS 요청 Origin:', origin);
    if (!origin || allowedOrigins.includes(origin)) {
      console.log('CORS 허용됨:', origin);
      callback(null, true);
    } else {
      console.log('CORS 거부됨:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.get('/pages', async (req, res) => {
  console.log('라우트: /pages 진입');
  try {
    console.log('getPages 함수 호출');
    const pages = await getPages();
    console.log('getPages 결과(일부):', Array.isArray(pages) ? pages.slice(0,1) : pages);
    res.json(pages);
    console.log('라우트: /pages 응답 반환 완료');
  } catch (error) {
    console.error('페이지 가져오기 오류:', error.message);
    res.status(500).json({ error: error.message });
    console.error('라우트: /pages 에러 응답 반환');
  }
});

app.get('/pages/summary', async (req, res) => {
  console.log('라우트: /pages/summary 진입');
  try {
    console.log('getPagesSummary 함수 호출');
    const summaries = await getPagesSummary();
    console.log('getPagesSummary 결과(일부):', Array.isArray(summaries) ? summaries.slice(0,1) : summaries);
    res.json(summaries);
    console.log('라우트: /pages/summary 응답 반환 완료');
  } catch (error) {
    console.error('요약 리스트 오류:', error.message);
    res.status(500).json({ error: error.message });
    console.error('라우트: /pages/summary 에러 응답 반환');
  }
});

app.get('/pages/:id', async (req, res) => {
  const { id } = req.params;
  console.log('라우트: /pages/:id 진입, id:', id);
  try {
    console.log('getPageDetails 함수 호출');
    const page = await getPageDetails(id);
    console.log('getPageDetails 결과(일부):', page && typeof page === 'object' ? Object.keys(page).slice(0,3).reduce((acc, k) => { acc[k]=page[k]; return acc; }, {}) : page);
    res.json(page);
    console.log('라우트: /pages/:id 응답 반환 완료');
  } catch (error) {
    console.error('상세 페이지 오류:', error.message);
    res.status(500).json({ error: error.message });
    console.error('라우트: /pages/:id 에러 응답 반환');
  }
});

app.get('/pages/:id/texts', async (req, res) => {
  const { id } = req.params;
  console.log('라우트: /pages/:id/texts 진입, id:', id);
  try {
    console.log('getPageTextAndLinksOnly 함수 호출');
    const content = await getPageTextAndLinksOnly(id);
    console.log('getPageTextAndLinksOnly 결과(일부):', Array.isArray(content) ? content.slice(0,1) : content);
    res.json(content);
    console.log('라우트: /pages/:id/texts 응답 반환 완료');
  } catch (error) {
    console.error('텍스트/링크 추출 오류:', error.message);
    res.status(500).json({ error: error.message });
    console.error('라우트: /pages/:id/texts 에러 응답 반환');
  }
});

app.get('/pages/:id/details', async (req, res) => {
  const { id } = req.params;
  console.log('라우트: /pages/:id/details 진입, id:', id);
  try {
    console.log('getSimplePageDetails 함수 호출');
    const detail = await getSimplePageDetails(id);
    console.log('getSimplePageDetails 결과(일부):', detail && typeof detail === 'object' ? Object.keys(detail).slice(0,3).reduce((acc, k) => { acc[k]=detail[k]; return acc; }, {}) : detail);
    res.json(detail);
    console.log('라우트: /pages/:id/details 응답 반환 완료');
  } catch (error) {
    console.error('간단 상세 정보 오류:', error.message);
    res.status(500).json({ error: error.message });
    console.error('라우트: /pages/:id/details 에러 응답 반환');
  }
});

app.post('/pages', async (req, res) => {
  const { title, description, eventDate, imageUrl } = req.body;
  console.log('라우트: POST /pages 진입');
  console.log('요청 body:', req.body);
  try {
    console.log('createPage 함수 호출');
    const result = await createPage(title, description, eventDate, imageUrl);
    console.log('createPage 결과(일부):', result && typeof result === 'object' ? Object.keys(result).slice(0,3).reduce((acc, k) => { acc[k]=result[k]; return acc; }, {}) : result);
    res.json(result);
    console.log('라우트: POST /pages 응답 반환 완료');
  } catch (error) {
    console.error('페이지 생성 오류:', error.message);
    res.status(500).json({ error: error.message });
    console.error('라우트: POST /pages 에러 응답 반환');
  }
}); 