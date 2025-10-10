document.addEventListener("DOMContentLoaded", () => {
    console.log(import.meta.env.VITE_API_URL);

    // 1. Automatically insert topbar and footer around .page-content
    const pageContents = document.querySelectorAll(".page-content");
    pageContents.forEach(pageContent => {
        // Only insert if not already present
        const hasTopbar = document.querySelector('[data-include="/topbar.html"]');
        const hasFooter = document.querySelector('[data-include="/footer.html"]');

        if (!hasTopbar) {
            console.log("Hello");
            const topbar = document.createElement("div");
            topbar.setAttribute("data-include", "/topbar.html");
            pageContent.parentNode.insertBefore(topbar, pageContent);
        }

        if (!hasFooter) {
            console.log("Hello");
            const footer = document.createElement("div");
            footer.setAttribute("data-include", "/footer.html");
            pageContent.parentNode.insertBefore(footer, pageContent.nextSibling);
        }
    });

    // 2. Handle includes (load HTML snippets)
    document.querySelectorAll("[data-include]").forEach(el => {
        const file = el.getAttribute("data-include");
        fetch(file)
            .then(response => {
                if (!response.ok) throw new Error(`Can't load ${file}`);
                return response.text();
            })
            .then(html => el.innerHTML = html)
            .catch(err => console.error(err));
    });

    // 3. Handle Trello board auto-refresh
    const boardElement = document.querySelector("[data-trello-board]");
    if (boardElement) {
        const boardId = boardElement.getAttribute("data-trello-board");
        const selector = `[data-trello-board="${boardId}"]`;

        const refreshBoard = () => {
            if (typeof loadTrelloBoard === "function") {
                loadTrelloBoard(boardId, selector);
            } else {
                console.warn("Trello loader not found");
            }
        };

        refreshBoard();
        setInterval(refreshBoard, 5000);
    }

});
