const http = require('http');
const https = require('https');

const TARGET_HOST = 'api.beruniy-talim.uz';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const PORT = process.env.PORT || 3001;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
};

const SYSTEM_PROMPT =
  "Siz Beruniy Talim onlayn ta'lim platformasining AI yordamchisiz. " +
  "O'quvchilarga kurslar, darslar, dasturlash, matematika va boshqa fanlar bo'yicha yordam bering. " +
  "Qisqa, aniq va foydali javoblar bering. Asosan o'zbek tilida javob bering.";

function callOpenAI(messages, callback) {
  const body = JSON.stringify({
    model: 'gpt-4o-mini',
    max_tokens: 1024,
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
  });

  const options = {
    hostname: 'api.openai.com',
    port: 443,
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        callback(null, parsed);
      } catch (e) {
        callback(e);
      }
    });
  });

  req.on('error', callback);
  req.write(body);
  req.end();
}

http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, CORS_HEADERS);
    res.end();
    return;
  }

  // AI chat endpoint
  if (req.url === '/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      let messages;
      try {
        messages = JSON.parse(body).messages;
      } catch {
        res.writeHead(400, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
        return;
      }

      if (!OPENAI_API_KEY) {
        res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          reply: "AI yordamchi sozlanmagan. OPENAI_API_KEY environment variable sozlang.",
        }));
        return;
      }

      callOpenAI(messages, (err, result) => {
        if (err) {
          res.writeHead(502, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ reply: 'AI bilan aloqada xatolik yuz berdi.' }));
          return;
        }
        const reply = result?.choices?.[0]?.message?.content || 'Javob olishda xatolik.';
        res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ reply }));
      });
    });
    return;
  }

  // Proxy everything else to backend
  const options = {
    hostname: TARGET_HOST,
    port: 443,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: TARGET_HOST },
  };

  const proxy = https.request(options, (proxyRes) => {
    const headers = { ...proxyRes.headers };
    delete headers['access-control-allow-origin'];
    delete headers['access-control-allow-headers'];
    delete headers['access-control-allow-methods'];
    res.writeHead(proxyRes.statusCode, { ...headers, ...CORS_HEADERS });
    proxyRes.pipe(res);
  });

  proxy.on('error', (err) => {
    console.error('Proxy error:', err.message);
    res.writeHead(502, CORS_HEADERS);
    res.end(JSON.stringify({ error: err.message }));
  });

  req.pipe(proxy);
}).listen(PORT, () => {
  console.log(`Proxy ishga tushdi: http://localhost:${PORT}`);
  if (!OPENAI_API_KEY) {
    console.log('ESLATMA: OPENAI_API_KEY sozlanmagan. AI chat ishlamaydi.');
  } else {
    console.log('OpenAI API ulandi. AI chat tayyor!');
  }
});
