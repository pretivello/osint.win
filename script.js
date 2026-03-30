// --- TEMA ---
function toggleTheme() {
    document.body.classList.toggle("light");
}

// --- SCROLL ---
function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
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

    div.innerHTML = `<div class="result-item">Dominio: ${domain}<br>(Aggiungi API WHOIS se vuoi)</div>`;
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

