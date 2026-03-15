const http = require("http");
const handler = require("serve-handler");

const PORT = Number(process.env.PORT || 3456);

const server = http.createServer((request, response) => {
  return handler(request, response, {
    public: __dirname,
    cleanUrls: true,
    trailingSlash: false,
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
