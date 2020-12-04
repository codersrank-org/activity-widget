const http = require('http');
const url = require('url');

const api = require('./index');

const server = http.createServer(async (req, res) => {
  // eslint-disable-next-line
  const query = url.parse(req.url, true).query;
  const context = {};
  const request = { query, url: req.url };
  await api(context, request);

  res.setHeader('Content-Type', context.res.headers['content-type']);
  res.end(context.res.body);
});

server.listen(3000, () => {
  // eslint-disable-next-line
  console.log('Listening on http://localhost:3000/');
});
