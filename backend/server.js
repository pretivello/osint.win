import express from 'express';
import cors from 'cors';
import whois from 'whois-json';
import portscanner from 'portscanner';
import fetch from 'node-fetch';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// =======================
// WHOIS
// =======================
app.get('/whois', async (req, res) => {
    const domain = req.query.domain;
    if(!domain) return res.status(400).json({error: "Inserisci un dominio"});

    try {
        const data = await whois(domain);
        res.json(data);
    } catch(err) {
        res.status(500).json({error: err.message});
    }
});

// =======================
// USERNAME SCAN
// =======================
// Esempio: controllo se username esiste su GitHub
app.get('/username', async (req, res) => {
    const username = req.query.username;
    if(!username) return res.status(400).json({error: "Inserisci un username"});

    try {
        const github = await fetch(`https://api.github.com/users/${username}`);
        const ghData = await github.json();
        res.json({
            github: ghData.login ? "Esiste" : "Non trovato",
            githubData: ghData
        });
    } catch(err) {
        res.status(500).json({error: err.message});
    }
});

// =======================
// PORT SCAN
// =======================
app.get('/port', async (req, res) => {
    const host = req.query.port;
    if(!host) return res.status(400).json({error: "Inserisci un host"});

    const portsToCheck = [21,22,80,443,8080]; // puoi estendere
    const results = {};

    for(const port of portsToCheck){
        try {
            const status = await portscanner.checkPortStatus(port, host);
            results[port] = status;
        } catch(err){
            results[port] = "errore";
        }
    }

    res.json(results);
});

app.listen(PORT, () => console.log(`Server OSINT in esecuzione su http://localhost:${PORT}`));