const https = require('https');
const http = require('http');
const fs = require('fs');
const url = require('url');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const username = 'apitest';
const password = 'test123';
const tokenUrl = 'https://efatura.etrsoft.com/fmi/data/v1/databases/testdb/sessions';
const dataUrl = 'https://efatura.etrsoft.com/fmi/data/v1/databases/testdb/layouts/testdb/records/1';

let token = "";
let data = "";

function getToken() {
    const options = {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(username + ":" + password).toString('base64'),
            'Content-Type': 'application/json'
        }
    };

    const req = https.request(tokenUrl, options, res => {
        let data = '';

        res.on('data', chunk => {
            data += chunk;
        });

        res.on('end', () => {
            token = JSON.parse(data).response.token;
            console.log("Token: " + token);
            getData();
        });
    });

    req.on('error', error => {
        console.error(error);
    });

    req.write(JSON.stringify({}));
    req.end();
}

function getData() {
    const options = {
        method: 'PATCH',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    };

    const req = https.request(dataUrl, options, res => {
        let responseData = '';

        res.on('data', chunk => {
            responseData += chunk;
        });

        res.on('end', () => {
            responseData = JSON.parse(responseData).response.scriptResult;
            console.log("Data: " + responseData);
            data = JSON.parse(responseData);
        });
    });

    req.on('error', error => {
        console.error(error);
    });

    req.write(JSON.stringify({
        "fieldData": {},
        "script": "getData"
    }));
    req.end();
}

http.createServer(function (req, res) {
    const q = url.parse(req.url, true);
    if (q.pathname === "/") {
        fs.readFile("index.html", function (err, data) {
            if (err) {
                res.writeHead(404, {'Content-Type': 'text/html'});
                return res.end("404 Not Found");
            }
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(data);
            return res.end();
        });
    } else if (q.pathname === "/data") {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(JSON.stringify(data));
        return res.end();
    }
}).listen(8080);

getToken();

