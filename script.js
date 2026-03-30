// --- USERNAME SCAN ---
const sites = {
    "Instagram": "https://www.instagram.com/",
    "TikTok": "https://www.tiktok.com/@",
    "GitHub": "https://github.com/",
    "Reddit": "https://www.reddit.com/user/",
    "Twitter (X)": "https://x.com/",
    "Twitch": "https://www.twitch.tv/",
    "Pinterest": "https://www.pinterest.com/",
    "Steam": "https://steamcommunity.com/id/"
};

async function scan() {
    const username = document.getElementById("usernameInput").value.trim();
    const resultsDiv = document.getElementById("results");

    if (!username) {
        resultsDiv.innerHTML = "<p>Inserisci un username valido.</p>";
        return;
    }

    resultsDiv.innerHTML = "<p>⏳ Scansione...</p>";
    let output = "";

    for (const [name, url] of Object.entries(sites)) {
        const fullUrl = url + username;
        try {
            const response = await fetch(fullUrl, { method: "GET" });
            if (response.status === 200) {
                output += `<div class="result-item">🟢 ${name}: <a href="${fullUrl}" target="_blank">${fullUrl}</a></div>`;
            } else {
                output += `<div class="result-item">🔴 ${name}: non trovato</div>`;
            }
        } catch {
            output += `<div class="result-item">⚠️ ${name}: errore</div>`;
        }
    }

    resultsDiv.innerHTML = output;
}

// --- DOMINIO (placeholder) ---
async function scanDomain() {
    const domain = document.getElementById("domainInput").value.trim();
    const div = document.getElementById("domain-results");

    if (!domain) {
        div.innerHTML = "<p>Inserisci un dominio valido.</p>";
        return;
    }

    div.innerHTML = `<div class="result-item">Dominio: ${domain}<br>(Qui puoi aggiungere WHOIS/API esterne)</div>`;
}

// --- IP LOOKUP (API pubblica semplice) ---
async function lookupIP() {
    const ip = document.getElementById("ipInput").value.trim();
    const div = document.getElementById("ip-results");

    if (!ip) {
        div.innerHTML = "<p>Inserisci un IP valido.</p>";
        return;
    }

    div.innerHTML = "<p>⏳ Ricerca IP...</p>";

    try {
        const res = await fetch(`https://ipapi.co/${ip}/json/`);
        const data = await res.json();

        div.innerHTML = `
            <div class="result-item">
                <strong>IP:</strong> ${data.ip || ip}<br>
                <strong>Paese:</strong> ${data.country_name || "N/D"}<br>
                <strong>Città:</strong> ${data.city || "N/D"}<br>
                <strong>ISP:</strong> ${data.org || "N/D"}<br>
            </div>
        `;
    } catch (e) {
        div.innerHTML = "<p>Errore nella richiesta IP.</p>";
    }
}

// --- DNS LOOKUP (Google DNS API) ---
async function lookupDNS() {
    const domain = document.getElementById("dnsInput").value.trim();
    const div = document.getElementById("dns-results");

    if (!domain) {
        div.innerHTML = "<p>Inserisci un dominio valido.</p>";
        return;
    }

    div.innerHTML = "<p>⏳ Ricerca DNS...</p>";

    try {
        const res = await fetch(`https://dns.google/resolve?name=${domain}`);
        const data = await res.json();

        if (!data.Answer) {
            div.innerHTML = "<p>Nessuna risposta DNS.</p>";
            return;
        }

        let output = "<div class='result-item'><strong>Risposte DNS:</strong><br>";
        data.Answer.forEach(a => {
            output += `${a.type} → ${a.data}<br>`;
        });
        output += "</div>";

        div.innerHTML = output;
    } catch (e) {
        div.innerHTML = "<p>Errore nella richiesta DNS.</p>";
    }
}

// --- EXIF ---
function analyzeImage() {
    const fileInput = document.getElementById("imageInput");
    const resultsDiv = document.getElementById("image-results");

    if (!fileInput.files.length) {
        resultsDiv.innerHTML = "<p>Carica un'immagine.</p>";
        return;
    }

    const file = fileInput.files[0];
    resultsDiv.innerHTML = "<p>⏳ Analisi EXIF...</p>";

    const reader = new FileReader();
    reader.onload = function(e) {
        const view = new DataView(e.target.result);

        try {
            const exif = EXIF.readFromBinaryFile(view);
            if (!exif) {
                resultsDiv.innerHTML = "<p>Nessun EXIF trovato.</p>";
                return;
            }

            let output = "<div class='result-item'><strong>Metadata EXIF:</strong><br>";

            for (let tag in exif) {
                output += `<strong>${tag}:</strong> ${exif[tag]}<br>`;
            }

            output += "</div>";
            resultsDiv.innerHTML = output;

        } catch (error) {
            resultsDiv.innerHTML = "<p>Errore nella lettura EXIF.</p>";
        }
    };

    reader.readAsArrayBuffer(fileInput.files[0]);
}

// --- UNSHORT (molto semplice, solo fetch HEAD/GET) ---
async function unshortURL() {
    const url = document.getElementById("unshortInput").value.trim();
    const div = document.getElementById("unshort-results");

    if (!url) {
        div.innerHTML = "<p>Inserisci un URL.</p>";
        return;
    }

    div.innerHTML = "<p>⏳ Espansione URL...</p>";

    try {
        const res = await fetch(url, { method: "GET", redirect: "follow" });
        div.innerHTML = `
            <div class="result-item">
                <strong>URL finale (potenziale):</strong><br>
                ${res.url}
            </div>
        `;
    } catch (e) {
        div.innerHTML = "<p>Errore nell'espansione URL.</p>";
    }
}

// --- HASH (SHA-256) ---
async function calcHash() {
    const text = document.getElementById("hashInput").value;
    const div = document.getElementById("hash-results");

    if (!text) {
        div.innerHTML = "<p>Inserisci del testo.</p>";
        return;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    div.innerHTML = `
        <div class="result-item">
            <strong>SHA-256:</strong><br>
            <code>${hashHex}</code>
        </div>
    `;
}

// --- HEADERS (best effort, dipende da CORS) ---
async function analyzeHeaders() {
    const url = document.getElementById("headersInput").value.trim();
    const div = document.getElementById("headers-results");

    if (!url) {
        div.innerHTML = "<p>Inserisci un URL.</p>";
        return;
    }

    div.innerHTML = "<p>⏳ Richiesta...</p>";

    try {
        const res = await fetch(url, { method: "GET" });
        let output = "<div class='result-item'><strong>Headers (visibili lato client):</strong><br>";

        res.headers.forEach((value, key) => {
            output += `<strong>${key}:</strong> ${value}<br>`;
        });

        output += "</div>";
        div.innerHTML = output;
    } catch (e) {
        div.innerHTML = "<p>Errore nella richiesta o blocco CORS.</p>";
    }
}

