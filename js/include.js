document.addEventListener("DOMContentLoaded", () => {
    // --- 1️⃣ Inclusions HTML automatiques (footer, header, etc.) ---
    document.querySelectorAll("[data-include]").forEach(el => {
        const file = el.getAttribute("data-include");
        fetch(file)
            .then(response => {
                if (!response.ok) throw new Error(`Erreur chargement ${file}`);
                return response.text();
            })
            .then(html => el.innerHTML = html)
            .catch(err => console.error(err));
    });

    // --- 2️⃣ Chargement automatique du board Trello (si présent) ---
    const boardElement = document.querySelector("[data-trello-board]");
    if (boardElement) {
        const boardId = boardElement.getAttribute("data-trello-board");
        const selector = `[data-trello-board="${boardId}"]`;

        const refreshBoard = () => {
            if (typeof loadTrelloBoard === "function") {
                loadTrelloBoard(boardId, selector);
            } else {
                console.warn("⚠️ Fonction loadTrelloBoard non trouvée");
            }
        };

        refreshBoard();
        setInterval(refreshBoard, 5000);
    }
});
