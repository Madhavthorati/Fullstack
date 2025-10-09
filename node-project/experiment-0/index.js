// ...existing code...
const http = require('http');



function handler3 (req, res)  {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({data:'Hello, World!\n'}));
}
const handler1 = function (req, res)  {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, World!\n');
}

const handler2 =(req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, World!\n');
}
const server= http.createServer(handler3);
const PORT = 3000;

server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}/`);
});
// ...existing code...