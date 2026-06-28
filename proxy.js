const http = require('http');
const https = require('https');

const TARGET_HOST = 'api.beruniy-talim.uz';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
};

http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, CORS_HEADERS);
    res.end();
    return;
  }

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
}).listen(3001, () => console.log('Proxy ishga tushdi: http://localhost:3001'));
