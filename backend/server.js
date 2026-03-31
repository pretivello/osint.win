const express = require("express");
const cors = require("cors");
const axios = require("axios");
const whois = require("whois");

const app = express();
app.use(cors());

// TEST
app.get("/", (req, res) => {
    res.send("Backend OSINT attivo");
});

// WHOIS
app.get("/whois", (req, res) => {
    const domain = req.query.domain;

    whois.lookup(domain, (err, data) => {
        if (err) return res.json({ error: "Errore WHOIS" });
        res.json({ result: data });
    });
});

// IP LOOKUP
app.get("/ip", async (req, res) => {
    const ip = req.query.ip;

    try {
        const response = await axios.get(`https://ipapi.co/${ip}/json/`);
        res.json(response.data);
    } catch {
        res.json({ error: "Errore IP lookup" });
    }
});

app.listen(3000, () => {
    console.log("Server attivo su http://localhost:3000");
});