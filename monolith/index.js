/*
// Setup
*/
const http = require("http");
const { createHmac } = require("node:crypto");

const host = process.env.HOST;
const port = process.env.PORT;
const publicUrl = process.env.PUBLIC_URL;
const hostUrl = `http://${host}:${port}`;

/*
// Endpoints
*/
const home = () => {
    return `
    <!DOCTYPE html>
    <html>
        <h1>
            Willkommen zur Steuererklaerung
        </h1>
        <p>
            Lade deine Datei hoch, um deine Steuererklaerungs-ID zu bekommen:
        </p>
        <form id="uploadForm" enctype="multipart/form-data">
            <input type="file" id="fileInput" accept=".json" required>
            <button type="submit">Hochladen</button>
        </form>

        <script>
            document.getElementById('uploadForm').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const fileInput = document.getElementById('fileInput');
                const file = fileInput.files[0];
    
                const formData = new FormData();
                formData.append('file', file);
    
                fetch('http://${publicUrl}/upload', {
                    method: 'POST',
                    body: file,
                })
                .then(response => response.json())
                .then(data => {
                    alert('Upload erfolgreich: ' + JSON.stringify(data));
                    window.location.href = "http://${publicUrl}/result?result=" + data;
                })
                .catch(error => {
                    console.error('Fehler beim Hochladen:', error);
                    alert('Fehler beim Hochladen');
                });
            });
        </script>
    </html>
    `;
}

const result = (hash) => {
    return `
    <html>
        <p>Deine ID ist: ${hash}</p>
    </html>
    `;
}

/*
// Methods
*/
const calcTaxes = (bills) => {
    // Every name is encrypted
    const bills_namesEncrypted = bills.map((b) => {
        encName = createHmac("sha256", b.name).digest('hex');
        return {
            name: encName,
            price: b.price
        };
    });

    // Bills are sorted
    let n = bills_namesEncrypted.length;
    let swapped;
    
    do {
        swapped = false;
        for (let i = 0; i < n - 1; i++) {
            if (bills_namesEncrypted[i].price > bills_namesEncrypted[i + 1].price) {
                [bills_namesEncrypted[i], bills_namesEncrypted[i + 1]] = [bills_namesEncrypted[i + 1], bills_namesEncrypted[i]];
                swapped = true;
            }
        }
        n--;
    } while (swapped);

    // Every object is encrypted
    const bills_hashArray = bills_namesEncrypted.map((b) => (createHmac("sha256", JSON.stringify(b)).digest('hex')));

    // Array object is hashed
    const bills_hash = createHmac("sha256", JSON.stringify(bills_hashArray)).digest('hex');

    return bills_hash;
}

/*
// Node magic
// ...This is so ugly
*/
const requestListener = (req, res) => {
    res.setHeader("Content-Type", "text/html");

    // CORS-stuff I copied from chatgpt
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url.startsWith("/result")) {
        res.writeHead(200);
        const url = new URL(req.url, `http://${req.headers.host}`);
        const params = new URLSearchParams(url.search);
        const uploadedBills = params.get("result");
        const encryptedBills = uploadedBills;
        res.end(result(encryptedBills));
        return;
    }
    switch (req.url) {
        case "/home":
            res.writeHead(200);
            res.end(home());
            break;
        case "/upload":
            let body = '';
            let jsonData;
            req.on('data', (chunk) => {
                body += chunk;
                jsonData = JSON.parse(body);
                res.setHeader("Content-Type", "application/json");
                res.writeHead(200);
                res.end(JSON.stringify(calcTaxes(jsonData)));
                body = "";
            });
            break;
        default:
            res.setHeader("Content-Type", "application/json");
            res.writeHead(404);
            res.end(JSON.stringify({error:"Resource not found"}));
            break;
    }
}

const server = http.createServer(requestListener);

server.listen(port, host, () => {
    console.log(`Server is listening on http://${host}:${port}`);
})