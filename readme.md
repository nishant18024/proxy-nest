const createProxyServer = require('proxy-nest');

createProxyServer({
  port: 8485,
  sslOptions: {
    key: fs.readFileSync('path/to/private.key', 'utf8'),
    cert: fs.readFileSync('path/to/certificate.crt', 'utf8'),
    ca: [fs.readFileSync('path/to/ca_bundle.crt', 'utf8')]
  },
  corsOptions: {
    origin: ['https://example.com', 'http://localhost:4200'],
    methods: 'GET,POST',
  },
  allowedReferers: [
    'https://api.example.com',
    'http://localhost:4200',
    'https://uat.example.com',
    'https://example.com'
  ],
  targetUrl: 'https://devapi.nishant.com' // Custom target URL (mandatory)
});
