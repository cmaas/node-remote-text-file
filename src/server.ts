import { TextDb } from './textdb';
import { createServer, IncomingMessage, Server, ServerResponse } from 'http';

function helloHandler(req: IncomingMessage, res: ServerResponse, textDb: TextDb): void {
    const userDb = textDb.create();
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(userDb));
}

function dataHandler(req: IncomingMessage, res: ServerResponse, textDb: TextDb, append: boolean): void {
    if (req.method === 'GET') {
        if (req.headers.accept.indexOf('application/json') >= 0) {
            res.setHeader('Content-Type', 'application/json');
        }
        const key = req.url.split('/').pop();
        const data = textDb.getData(key);
        res.end(data);
        return;
    }
    else if (req.method === 'POST') {
        const key = req.url.split('/').pop();
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        });
        req.on('end', () => {
            if (append) {
                textDb.appendData(key, data);
            } else {
                textDb.setData(key, data);
            }
            res.end();
        });
        return;
    }
}

export function startServer(textDb: TextDb, port = 8080): Server {
    const server = createServer((req, res) => {
        // CORS: allow AJAX requests
        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
            'Access-Control-Max-Age': 2592000, // 30 days
        };
        if (req.method === 'OPTIONS') {
            res.writeHead(204, headers);
            res.end();
            return;
        }

        // write CORS rules for all other requests
        Object.keys(headers).forEach(key => {
            res.setHeader(key, headers[key]);
        });

        if (req.url === '/api/hello' && req.method === 'GET') {
            helloHandler(req, res, textDb);
            return;
        }
        else if (req.url.indexOf('/api/data/append/') === 0) {
            dataHandler(req, res, textDb, true);
            return;
        }
        else if (req.url.indexOf('/api/data/') === 0) {
            dataHandler(req, res, textDb, false);
            return;
        }
        res.statusCode = 404;
        res.end('Page not found');
    })
        .listen(port);
    console.log('Server ready, listening on http://localhost:' + port);
    return server;
}

export function stopServer(server: Server): void {
    server.close();
}