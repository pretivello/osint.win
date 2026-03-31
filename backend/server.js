const http = require("http");

const server = http.createServer((req, res) => {
    if (req.url === "/") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Server attivo");
    }

    else if (req.url.startsWith("/whois")) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
            message: "WHOIS simulato (funziona)"
        }));
    }

    else {
        res.writeHead(404);
        res.end("Not found");
    }
});

server.listen(3000, () => {
    console.log("Server attivo su http://localhost:3000");
});