function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function typeText(element, text) {
    for (let char of text) {
        element.innerText += char;
        await sleep(20);
    }
}

async function scanUsername() {
    const username = document.getElementById("usernameInput").value;
    const resultBox = document.getElementById("result");

    resultBox.innerText = "";

    if (!username) {
        await typeText(resultBox, "Errore: inserisci uno username.\n");
        return;
    }

    await typeText(resultBox, "Inizializzazione sistema...\n");
    await sleep(500);
    await typeText(resultBox, "Connessione ai database OSINT...\n");
    await sleep(500);

    const sites = [
        { name: "GitHub", url: `https://github.com/${username}` },
        { name: "Instagram", url: `https://www.instagram.com/${username}` },
        { name: "Reddit", url: `https://www.reddit.com/user/${username}` }
    ];

    for (let site of sites) {
        await typeText(resultBox, `Scansione ${site.name}...\n`);
        await sleep(700);

        try {
            await fetch(site.url, { method: "HEAD", mode: "no-cors" });
            await typeText(resultBox, `[+] ${site.name}: POSSIBILE MATCH\n`);
        } catch {
            await typeText(resultBox, `[-] ${site.name}: NON TROVATO\n`);
        }
    }

    await typeText(resultBox, "\nScansione completata.\n");
}