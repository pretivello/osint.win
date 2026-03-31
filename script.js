// =======================
// UTILS
// =======================

function setResult(id, content) {
    document.getElementById(id).innerHTML = content;
}

function handleError(id, error) {
    setResult(id, "❌ Errore: " + error.message);
}

// =======================
// IP LOOKUP (API REALE)
// =======================

async function lookupIP() {
    const ip = document.getElementById("ipInput").value.trim();
    if (!ip) return;

    setResult("ipResult", "⏳ Caricamento...");

    try {
        const res = await fetch(`https://ipapi.co/${ip}/json/`);
        const data = await res.json();

        if (data.error) {
            setResult("ipResult", "❌ IP non valido");
            return;
        }

        setResult("ipResult", `
            🌍 IP: ${data.ip}<br>
            🏙️ Città: ${data.city}<br>
            🌐 Regione: ${data.region}<br>
            🇺🇳 Paese: ${data.country_name}<br>
            📡 ISP: ${data.org}
        `);

    } catch (err) {
        handleError("ipResult", err);
    }
}

// =======================
// DNS LOOKUP (LIMITATO)
// =======================

async function lookupDNS() {
    const domain = document.getElementById("dnsInput").value.trim();
    if (!domain) return;

    setResult("dnsResult", "⏳ Caricamento...");

    try {
        const res = await fetch(`https://dns.google/resolve?name=${domain}`);
        const data = await res.json();

        if (!data.Answer) {
            setResult("dnsResult", "❌ Nessun record trovato");
            return;
        }

        let output = "";
        data.Answer.forEach(record => {
            output += `📌 ${record.data}<br>`;
        });

        setResult("dnsResult", output);

    } catch (err) {
        handleError("dnsResult", err);
    }
}

// =======================
// EMAIL ANALYSIS (LOGICA)
// =======================

function analyzeEmail() {
    const email = document.getElementById("emailInput").value.trim();
    if (!email.includes("@")) {
        setResult("emailResult", "❌ Email non valida");
        return;
    }

    const [user, domain] = email.split("@");

    const disposable = ["tempmail.com", "10minutemail.com"];
    const isDisposable = disposable.includes(domain);

    setResult("emailResult", `
        📧 Email: ${email}<br>
        👤 Username: ${user}<br>
        🌐 Dominio: ${domain}<br>
        ⚠️ Temporanea: ${isDisposable ? "Sì" : "No"}
    `);
}

// =======================
// HASH SHA-256 (REALE)
// =======================

async function calcHash() {
    const text = document.getElementById("hashInput").value;
    if (!text) return;

    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    setResult("hashResult", `🔐 ${hashHex}`);
}

// =======================
// EXIF (REALE)
// =======================

function analyzeImage() {
    const file = document.getElementById("imageInput").files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {
        const img = new Image();
        img.src = e.target.result;

        img.onload = function() {
            EXIF.getData(img, function () {
                const allMeta = EXIF.getAllTags(this);

                if (Object.keys(allMeta).length === 0) {
                    setResult("imageResult", "❌ Nessun dato EXIF trovato");
                    return;
                }

                let output = "";
                for (let key in allMeta) {
                    output += `📌 ${key}: ${allMeta[key]}<br>`;
                }

                setResult("imageResult", output);
            });
        };
    };

    reader.readAsDataURL(file);
}

// =======================
// BACKEND REQUIRED
// =======================

function whoisLookup() {
    setResult("backendResult", "⚠️ WHOIS richiede backend (Node.js / API)");
}

function usernameScan() {
    setResult("backendResult", "⚠️ Username scan serio richiede backend (CORS + scraping)");
}

function portScan() {
    setResult("backendResult", "⚠️ Port scanning reale NON possibile via browser");
}

async function whoisLookup() {
    const domain = document.getElementById("domainInput").value;

    const res = await fetch(`http://localhost:3000/whois?domain=${domain}`);
    const data = await res.json();

    setResult("backendResult", JSON.stringify(data, null, 2));
}

async function usernameScan() {
    const username = document.getElementById("usernameInput").value;

    const res = await fetch(`http://localhost:3000/username?username=${username}`);
    const data = await res.json();

    setResult("backendResult", JSON.stringify(data, null, 2));
}

async function portScan() {
    const host = document.getElementById("portInput").value;

    const res = await fetch(`http://localhost:3000/port?host=${host}`);
    const data = await res.json();

    setResult("backendResult", JSON.stringify(data, null, 2));
}
