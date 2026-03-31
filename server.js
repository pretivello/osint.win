const express = require("express");
const axios = require("axios");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// =======================
// ROOT
// =======================

app.get("/", (req, res) => {
    res.send("OSINT Backend attivo 🚀");
});

// =======================
// WHOIS (via RDAP)
// =======================

app.get("/whois", async (req, res) => {
    const domain = req.query.domain;

    if (!domain) {
        return res.status(400).json({ error: "Dominio mancante" });
    }

    try {
        const response = await axios.get(`https://rdap.org/domain/${domain}`);
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: "Errore WHOIS" });
    }
});

// =======================
// USERNAME CHECK (BASE)
// =======================

app.get("/username", async (req, res) => {
    const username = req.query.username;

    if (!username) {
        return res.status(400).json({ error: "Username mancante" });
    }

    const sites = [
        `https://www.instagram.com/${username}`,
        `https://github.com/${username}`,
        `https://twitter.com/${username}`
    ];

    const results = [];

    for (let url of sites) {
        try {
            const response = await axios.get(url);
            results.push({ url, status: response.status });
        } catch (err) {
            results.push({ url, status: "non trovato" });
        }
    }

    res.json(results);
});

// =======================
// PORT CHECK (FAKE LIMITATO)
// =======================

app.get("/port", async (req, res) => {
    const host = req.query.host;

    if (!host) {
        return res.status(400).json({ error: "Host mancante" });
    }

    const ports = [80, 443, 8080];
    const results = [];

    for (let port of ports) {
        try {
            await axios.get(`http://${host}:${port}`, { timeout: 2000 });
            results.push({ port, open: true });
        } catch {
            results.push({ port, open: false });
        }
    }

    res.json(results);
});

// =======================

app.listen(PORT, () => {
    console.log(`Server attivo su http://localhost:${PORT}`);
});