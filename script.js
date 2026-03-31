async function scanUsername() {
    const username = document.getElementById("usernameInput").value;
    const resultBox = document.getElementById("result");

    if (!username) {
        resultBox.innerText = "Inserisci uno username.";
        return;
    }

    resultBox.innerText = "Scanning...\n";

    const sites = [
        { name: "GitHub", url: `https://github.com/${username}` },
        { name: "Instagram", url: `https://www.instagram.com/${username}` },
        { name: "Reddit", url: `https://www.reddit.com/user/${username}` }
    ];

    for (let site of sites) {
        try {
            const response = await fetch(site.url, { method: "HEAD", mode: "no-cors" });

            resultBox.innerText += `${site.name}: Probabilmente esiste\n`;
        } catch {
            resultBox.innerText += `${site.name}: Non trovato\n`;
        }
    }
}