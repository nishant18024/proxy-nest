const express = require('express');
const cors = require('cors');
const axios = require('axios');
const https = require('https');
const fs = require('fs');

const createProxyServer = ({
  port = process.env.PORT || 8485,
  sslOptions = {},
  corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 200,
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true
  },
  allowedReferers = [],
  targetUrl // Target URL must be provided
}) => {
  const app = express();

  // Middleware to handle CORS
  app.use(cors(corsOptions));

  // Middleware to check the Referer header
  const refererCheck = (req, res, next) => {
    const referer = req.headers.referer || '';
    const isAllowed = allowedReferers.some(url => referer.startsWith(url));

    if (!isAllowed) {
      return res.status(403).json({ error: 'Access Denied' });
    }

    next();
  };

  // Apply the referer check middleware globally
  app.use(refererCheck);

  // Middleware to handle JSON request bodies
  app.use(express.json());

  // Handle API requests
  app.use('/api/*', async (req, res) => {
    try {
      const url = `${targetUrl}${req.originalUrl}`;
      console.log(`Proxying request to: ${url}`);

      const response = await axios({
        method: req.method,
        url: url,
        data: req.body,
        headers: {
          'Authorization': req.headers.authorization,
        }
      });

      res.status(response.status).json(response.data);
    } catch (error) {
      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(500).json({ error: 'An error occurred' });
      }
    }
  });

  // Start the server with SSL
  https.createServer(sslOptions, app).listen(port, '0.0.0.0', () => {
    console.log(`Proxy server running on https://localhost:${port}`);
  });
};

// Export the createProxyServer function
module.exports = createProxyServer;
