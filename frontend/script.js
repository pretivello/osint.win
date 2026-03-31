// =======================
// UTILS
// =======================

function setResult(id, content) {
    const el = document.getElementById(id);
    el.innerHTML = content;
}

function handleError(id, error) {
    setResult(id, `❌ Errore: ${error.message || error}`);
}

// =======================
// IP LOOKUP
// =======================

async function lookupIP() {
    const ip = document.getElementById("ipInput").value.trim();
    if (!ip.match(/^(\d{1,3}\.){3}\d{1,3}$/)) return setResult("ipResult","❌ IP non valido");

    setResult("ipResult", "⏳ Caricamento...");

    try {
        const res = await fetch(`https://ipapi.co/${ip}/json/`);
        const data = await res.json();
        if (data.error) return setResult("ipResult","❌ IP non valido");

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
// DNS LOOKUP
// =======================

async function lookupDNS() {
    const domain = document.getElementById("dnsInput").value.trim();
    if (!domain) return setResult("dnsResult","❌ Inserisci un dominio");

    setResult("dnsResult","⏳ Caricamento...");

    try {
        const res = await fetch(`https://dns.google/resolve?name=${domain}`);
        const data = await res.json();
        if (!data.Answer) return setResult("dnsResult","❌ Nessun record trovato");

        let output = "";
        data.Answer.forEach(record => { output += `📌 ${record.data}<br>`; });
        setResult("dnsResult", output);
    } catch (err) {
        handleError("dnsResult", err);
    }
}

// =======================
// EMAIL ANALYSIS
// =======================

function analyzeEmail() {
    const email = document.getElementById("emailInput").value.trim();
    if (!email.includes("@")) return setResult("emailResult","❌ Email non valida");

    const [user, domain] = email.split("@");
    const disposable = ["tempmail.com","10minutemail.com"];
    const isDisposable = disposable.includes(domain.toLowerCase());

    setResult("emailResult", `
        📧 Email: ${email}<br>
        👤 Username: ${user}<br>
        🌐 Dominio: ${domain}<br>
        ⚠️ Temporanea: ${isDisposable ? "Sì" : "No"}
    `);
}

// =======================
// HASH SHA-256
// =======================

async function calcHash() {
    const text = document.getElementById("hashInput").value;
    if (!text) return;

    const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2,"0")).join("");
    setResult("hashResult", `🔐 ${hashHex}`);
}

// =======================
// EXIF ANALYZER
// =======================

function analyzeImage() {
    const file = document.getElementById("imageInput").files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
            EXIF.getData(img, function() {
                const meta = EXIF.getAllTags(this);
                if (!Object.keys(meta).length) return setResult("imageResult","❌ Nessun dato EXIF trovato");

                const relevant = ["Make","Model","DateTime","GPSLatitude","GPSLongitude"];
                let output = "";
                relevant.forEach(k => { if(meta[k]) output += `📌 ${k}: ${meta[k]}<br>`; });
                setResult("imageResult", output || "❌ Nessun dato rilevante trovato");
            });
        };
    };
    reader.readAsDataURL(file);
}

// =======================
// BACKEND FETCH
// =======================

async function backendFetch(type, param) {
    if (!param) return setResult("backendResult","❌ Inserisci input");
    setResult("backendResult","⏳ Caricamento...");

    try {
        const res = await fetch(`http://localhost:3000/${type}?${type}=${encodeURIComponent(param)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setResult("backendResult", JSON.stringify(data, null, 2));
    } catch(err) {
        handleError("backendResult", err);
    }
}

// =======================
// THEME TOGGLE
// =======================

const themeBtn = document.getElementById("themeToggle");
themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");
    themeBtn.textContent = document.body.classList.contains("light") ? "🌞" : "🌙";
});
