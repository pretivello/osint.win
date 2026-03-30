// --- STATS ---
const stats = {
    usernameScans: 0,
    domainScans: 0,
    ipLookups: 0,
    dnsLookups: 0,
    whoisLookups: 0,
    asnLookups: 0,
    reverseLookups: 0,
    emailAnalyses: 0,
    portScans: 0,
    exifAnalyses: 0,
    fileMetaAnalyses: 0,
    unshorts: 0,
    hashCalcs: 0,
    headerAnalyses: 0,
    footprints: 0,
    reportsGenerated: 0
};

function updateStats() {
    const div = document.getElementById("stats-results");
    if (!div) return;
    div.innerHTML = `
        <div class="result-item">
            <strong>Stats:</strong><br>
            Username scans: ${stats.usernameScans}<br>
            Domain scans: ${stats.domainScans}<br>
            IP lookups: ${stats.ipLookups}<br>
            DNS lookups: ${stats.dnsLookups}<br>
            WHOIS lookups: ${stats.whoisLookups}<br>
            ASN lookups: ${stats.asnLookups}<br>
            Reverse DNS: ${stats.reverseLookups}<br>
            Email analyses: ${stats.emailAnalyses}<br>
            Port scans: ${stats.portScans}<br>
            EXIF analyses: ${stats.exifAnalyses}<br>
            File metadata: ${stats.fileMetaAnalyses}<br>
            Unshort: ${stats.unshorts}<br>
            Hash calcs: ${stats.hashCalcs}<br>
            Header analyses: ${stats.headerAnalyses}<br>
            Footprints: ${stats.footprints}<br>
            Reports: ${stats.reportsGenerated}<br>
        </div>
    `;
}

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

    stats.usernameScans++;
    updateStats();

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

// --- DOMINIO ---
async function scanDomain() {
    const domain = document.getElementById("domainInput").value.trim();
    const div = document.getElementById("domain-results");

    if (!domain) {
        div.innerHTML = "<p>Inserisci un dominio valido.</p>";
        return;
    }

    stats.domainScans++;
    updateStats();

    div.innerHTML = `<div class="result-item">Dominio: ${domain}<br>(Qui puoi aggiungere logica extra lato server)</div>`;
}

// --- IP LOOKUP ---
async function lookupIP() {
    const ip = document.getElementById("ipInput").value.trim();
    const div = document.getElementById("ip-results");

    if (!ip) {
        div.innerHTML = "<p>Inserisci un IP valido.</p>";
        return;
    }

    stats.ipLookups++;
    updateStats();

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

// --- DNS LOOKUP ---
async function lookupDNS() {
    const domain = document.getElementById("dnsInput").value.trim();
    const div = document.getElementById("dns-results");

    if (!domain) {
        div.innerHTML = "<p>Inserisci un dominio valido.</p>";
        return;
    }

    stats.dnsLookups++;
    updateStats();

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

// --- WHOIS (via RDAP, best effort) ---
async function lookupWHOIS() {
    const domain = document.getElementById("whoisInput").value.trim();
    const div = document.getElementById("whois-results");

    if (!domain) {
        div.innerHTML = "<p>Inserisci un dominio valido.</p>";
        return;
    }

    stats.whoisLookups++;
    updateStats();

    div.innerHTML = "<p>⏳ WHOIS (RDAP) in corso...</p>";

    try {
        const res = await fetch(`https://rdap.org/domain/${domain}`);
        const data = await res.json();

        const registrar = data.registrar ? data.registrar.name || data.registrar : "N/D";
        const status = data.status ? data.status.join(", ") : "N/D";
        const events = data.events || [];
        const created = (events.find(e => e.eventAction === "registration") || {}).eventDate || "N/D";
        const expires = (events.find(e => e.eventAction === "expiration") || {}).eventDate || "N/D";

        div.innerHTML = `
            <div class="result-item">
                <strong>Dominio:</strong> ${domain}<br>
                <strong>Registrar:</strong> ${registrar}<br>
                <strong>Creato il:</strong> ${created}<br>
                <strong>Scadenza:</strong> ${expires}<br>
                <strong>Status:</strong> ${status}<br>
                <em>Dati via RDAP (se disponibili, soggetti a CORS).</em>
            </div>
        `;
    } catch (e) {
        div.innerHTML = `
            <div class="result-item">
                <strong>Dominio:</strong> ${domain}<br>
                <em>Impossibile recuperare WHOIS via browser (CORS / limitazioni). Per WHOIS completo serve backend.</em>
            </div>
        `;
    }
}

// --- ASN LOOKUP ---
async function lookupASN() {
    const ip = document.getElementById("asnInput").value.trim();
    const div = document.getElementById("asn-results");

    if (!ip) {
        div.innerHTML = "<p>Inserisci un IP valido.</p>";
        return;
    }

    stats.asnLookups++;
    updateStats();

    div.innerHTML = "<p>⏳ ASN Lookup...</p>";

    try {
        const res = await fetch(`https://ipapi.co/${ip}/json/`);
        const data = await res.json();

        div.innerHTML = `
            <div class="result-item">
                <strong>IP:</strong> ${data.ip || ip}<br>
                <strong>ASN:</strong> ${data.asn || "N/D"}<br>
                <strong>Org:</strong> ${data.org || "N/D"}<br>
                <strong>Paese:</strong> ${data.country_name || "N/D"}<br>
            </div>
        `;
    } catch (e) {
        div.innerHTML = "<p>Errore nella richiesta ASN.</p>";
    }
}

// --- REVERSE DNS (PTR via DNS Google) ---
async function lookupReverseDNS() {
    const ip = document.getElementById("reverseInput").value.trim();
    const div = document.getElementById("reverse-results");

    if (!ip) {
        div.innerHTML = "<p>Inserisci un IP valido.</p>";
        return;
    }

    stats.reverseLookups++;
    updateStats();

    div.innerHTML = "<p>⏳ Reverse DNS...</p>";

    const parts = ip.split(".").map(p => p.trim()).filter(Boolean);
    if (parts.length !== 4) {
        div.innerHTML = "<p>IP non valido.</p>";
        return;
    }

    const ptrName = `${parts.reverse().join(".")}.in-addr.arpa`;

    try {
        const res = await fetch(`https://dns.google/resolve?name=${ptrName}&type=PTR`);
        const data = await res.json();

        if (!data.Answer) {
            div.innerHTML = `
                <div class="result-item">
                    <strong>IP:</strong> ${ip}<br>
                    <strong>PTR:</strong> Nessun record PTR trovato.<br>
                </div>
            `;
            return;
        }

        const ptrs = data.Answer.map(a => a.data).join("<br>");

        div.innerHTML = `
            <div class="result-item">
                <strong>IP:</strong> ${ip}<br>
                <strong>PTR:</strong><br>${ptrs}
            </div>
        `;
    } catch (e) {
        div.innerHTML = "<p>Errore nella richiesta Reverse DNS.</p>";
    }
}

// --- EMAIL OSINT AVANZATO ---
async function analyzeEmail() {
    const email = document.getElementById("emailInput").value.trim();
    const div = document.getElementById("email-results");

    if (!email) {
        div.innerHTML = "<p>Inserisci un'email.</p>";
        return;
    }

    stats.emailAnalyses++;
    updateStats();

    div.innerHTML = "<p>⏳ Analisi email in corso...</p>";

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid = regex.test(email);
    const domain = email.split("@")[1] || "N/D";

    async function dnsQuery(type) {
        try {
            const res = await fetch(`https://dns.google/resolve?name=${domain}&type=${type}`);
            return await res.json();
        } catch {
            return null;
        }
    }

    const mxData = await dnsQuery("MX");
    let mxRecords = [];
    if (mxData && mxData.Answer) {
        mxRecords = mxData.Answer.map(a => a.data);
    }

    const txtData = await dnsQuery("TXT");
    let txtRecords = [];
    let spf = "Nessun record SPF.";
    let dmarc = "Nessun record DMARC.";

    if (txtData && txtData.Answer) {
        txtRecords = txtData.Answer.map(a => a.data.replace(/"/g, ""));
        spf = txtRecords.find(t => t.startsWith("v=spf1")) || "Nessun record SPF.";
        dmarc = txtRecords.find(t => t.includes("v=DMARC1")) || "Nessun record DMARC.";
    }

    let reverseMX = "N/D";
    if (mxRecords.length > 0) {
        reverseMX = mxRecords[0].split(" ")[1] || mxRecords[0];
    }

    const disposableList = [
        "tempmail", "10minutemail", "guerrillamail", "mailinator",
        "trashmail", "yopmail", "dispostable", "fakeinbox"
    ];
    const isDisposable = disposableList.some(d => domain.includes(d));

    let reputation = "Sconosciuta";
    if (domain.includes("gmail") || domain.includes("outlook") || domain.includes("yahoo")) {
        reputation = "Alta (provider affidabile)";
    } else if (isDisposable) {
        reputation = "Molto bassa (dominio usa-e-getta)";
    } else if (!mxRecords.length) {
        reputation = "Molto sospetta (nessun MX)";
    } else {
        reputation = "Normale";
    }

    const soaData = await dnsQuery("SOA");
    let domainAge = "N/D";
    if (soaData && soaData.Answer) {
        const serial = soaData.Answer[0].data.split(" ")[2];
        if (serial && serial.length === 10) {
            const year = serial.substring(0, 4);
            const month = serial.substring(4, 6);
            const day = serial.substring(6, 8);
            domainAge = `${day}/${month}/${year}`;
        }
    }

    div.innerHTML = `
        <div class="result-item">
            <strong>Email:</strong> ${email}<br>
            <strong>Valida sintatticamente:</strong> ${valid ? "Sì" : "No"}<br>
            <strong>Dominio:</strong> ${domain}<br><br>

            <strong>MX Records:</strong><br>
            ${mxRecords.length ? mxRecords.join("<br>") : "Nessun MX"}<br><br>

            <strong>SPF:</strong><br>
            ${spf}<br><br>

            <strong>DMARC:</strong><br>
            ${dmarc}<br><br>

            <strong>TXT Records:</strong><br>
            ${txtRecords.length ? txtRecords.join("<br>") : "Nessun TXT"}<br><br>

            <strong>Reverse MX (server → dominio):</strong><br>
            ${reverseMX}<br><br>

            <strong>Dominio usa-e-getta:</strong><br>
            ${isDisposable ? "Sì (⚠️ sospetto)" : "No"}<br><br>

            <strong>Età dominio (da SOA):</strong><br>
            ${domainAge}<br><br>

            <strong>Reputazione dominio:</strong><br>
            ${reputation}<br><br>

            <em>Analisi email completata.</em>
        </div>
    `;
}

// --- PORT SCANNER (demo HTTP-based) ---
async function scanPorts() {
    const host = document.getElementById("portsHostInput").value.trim();
    const div = document.getElementById("ports-results");

    if (!host) {
        div.innerHTML = "<p>Inserisci un host (es. https://example.com).</p>";
        return;
    }

    stats.portScans++;
    updateStats();

    div.innerHTML = "<p>⏳ Scansione porte (demo)...</p>";

    const ports = [80, 443, 8080, 8443];
    let output = "<div class='result-item'><strong>Risultati porte (HTTP-based):</strong><br>";

    for (const port of ports) {
        const url = host.replace(/\/+$/, "") + ":" + port;
        try {
            await fetch(url, { method: "GET", mode: "no-cors" });
            output += `🟢 Porta ${port}: possibile risposta (no-cors)<br>`;
        } catch {
            output += `🔴 Porta ${port}: nessuna risposta (o bloccata)<br>`;
        }
    }

    output += "<em>Limitato dal browser, per scan seri serve backend.</em></div>";
    div.innerHTML = output;
}

// --- EXIF ---
function analyzeImage() {
    const fileInput = document.getElementById("imageInput");
    const resultsDiv = document.getElementById("image-results");

    if (!fileInput.files.length) {
        resultsDiv.innerHTML = "<p>Carica un'immagine.</p>";
        return;
    }

    stats.exifAnalyses++;
    updateStats();

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

// --- FILE META (base) ---
function analyzeFileMeta() {
    const input = document.getElementById("fileMetaInput");
    const div = document.getElementById("filemeta-results");

    if (!input.files.length) {
        div.innerHTML = "<p>Carica un file.</p>";
        return;
    }

    stats.fileMetaAnalyses++;
    updateStats();

    const file = input.files[0];

    div.innerHTML = `
        <div class="result-item">
            <strong>Nome file:</strong> ${file.name}<br>
            <strong>Dimensione:</strong> ${file.size} bytes<br>
            <strong>Tipo MIME:</strong> ${file.type || "N/D"}<br>
            <em>Per metadati avanzati (PDF/DOCX) serve parsing dedicato.</em>
        </div>
    `;
}

// --- UNSHORT ---
async function unshortURL() {
    const url = document.getElementById("unshortInput").value.trim();
    const div = document.getElementById("unshort-results");

    if (!url) {
        div.innerHTML = "<p>Inserisci un URL.</p>";
        return;
    }

    stats.unshorts++;
    updateStats();

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

// --- HASH ---
async function calcHash() {
    const text = document.getElementById("hashInput").value;
    const div = document.getElementById("hash-results");

    if (!text) {
        div.innerHTML = "<p>Inserisci del testo.</p>";
        return;
    }

    stats.hashCalcs++;
    updateStats();

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

// --- HEADERS ---
async function analyzeHeaders() {
    const url = document.getElementById("headersInput").value.trim();
    const div = document.getElementById("headers-results");

    if (!url) {
        div.innerHTML = "<p>Inserisci un URL.</p>";
        return;
    }

    stats.headerAnalyses++;
    updateStats();

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

// --- FOOTPRINT ---
async function generateFootprint() {
    const domain = document.getElementById("footprintInput").value.trim();
    const div = document.getElementById("footprint-results");

    if (!domain) {
        div.innerHTML = "<p>Inserisci un dominio.</p>";
        return;
    }

    stats.footprints++;
    updateStats();

    div.innerHTML = "<p>⏳ Generazione footprint...</p>";

    let output = `<div class="result-item"><strong>Footprint per ${domain}:</strong><br>`;

    try {
        const dnsRes = await fetch(`https://dns.google/resolve?name=${domain}`);
        const dnsData = await dnsRes.json();
        output += "<br><strong>DNS:</strong><br>";
        if (dnsData.Answer) {
            dnsData.Answer.forEach(a => {
                output += `${a.type} → ${a.data}<br>`;
            });
        } else {
            output += "Nessuna risposta DNS.<br>";
        }
    } catch {
        output += "<br>Errore DNS.<br>";
    }

    output += "<br><em>WHOIS, ASN, Reverse, ecc. possono essere integrati lato backend per massima affidabilità.</em>";
    output += "</div>";

    div.innerHTML = output;
}

// --- REPORT ---
function generateReport() {
    const div = document.getElementById("report-results");

    stats.reportsGenerated++;
    updateStats();

    const notes = document.getElementById("notesInput")?.value || "";

    div.innerHTML = `
        <div class="result-item">
            <strong>Report OSINT (snapshot):</strong><br>
            <em>Report generato lato client.</em><br><br>
            <strong>Note:</strong><br>
            <pre>${notes || "Nessuna nota inserita."}</pre>
            <br>
            <strong>Stats attuali:</strong><br>
            Username scans: ${stats.usernameScans}<br>
            IP lookups: ${stats.ipLookups}<br>
            DNS lookups: ${stats.dnsLookups}<br>
            WHOIS lookups: ${stats.whoisLookups}<br>
            ASN lookups: ${stats.asnLookups}<br>
            EXIF analyses: ${stats.exifAnalyses}<br>
            Unshort: ${stats.unshorts}<br>
            Hash calcs: ${stats.hashCalcs}<br>
            Email analyses: ${stats.emailAnalyses}<br>
        </div>
    `;
}

