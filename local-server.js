import http from "http";
import handler from "./api/registerIp.js";
import "dotenv/config";

const server = http.createServer((req, res) => {
  if (req.url === "/api/registerIp") {
    handler(req, res);
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(3000, () => {
  console.log("🟢 Local server running at http://localhost:3000");
});
