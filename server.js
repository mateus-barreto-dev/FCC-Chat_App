import http from 'http';
import fs from 'fs';
import { WebSocketServer } from 'ws';
const server = http.createServer((req,res) => {
    fs.readFile("./public/index.html", (err, data) => {
        if (err){
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            return res.end('Error loading index.html');
        }
        res.writeHead(200, {
            'Content-Type': 'text/html',
        });
        res.end(data);
    });
});
const PORT = 3001;
const wss = new WebSocketServer({server});

function broadcast(data){
    const data_string = JSON.stringify(data);
    wss.clients.forEach((client) => {
        if(client.readyState === 1){
            client.send(data_string);
        }
    });
}

wss.on("connection", (socket, req) => {
    const username = new URL(req.url, "http://localhost").searchParams.get("username");
    broadcast({ type: "system", text: `${username} joined` });

    socket.on("message", (data) => {
        const { username, text } = JSON.parse(data);
        broadcast({type: "chat", username, text});
    });

    socket.on("close", () => {
         broadcast({type: "system", text: `${username} left`});
    });


});



server.listen(PORT, () => {
    console.log("Chat server running at http://localhost:3001");
});
