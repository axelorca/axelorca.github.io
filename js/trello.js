/**
 * Load a Trello board by ID into a specific container element.
 * @param {string} boardId - The Trello board ID (from its URL)
 * @param {string} containerSelector - CSS selector for the container element
 */
async function loadTrelloBoard(boardId, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Container "${containerSelector}" not found.`);
        return;
    }

    try {
        const response = await fetch(`https://trello.com/b/${boardId}.json`);
        if (!response.ok) throw new Error("Failed to fetch Trello board data");

        const data = await response.json();
        renderTrelloBoard(data, container);
    } catch (error) {
        console.error(`Error loading Trello board ${boardId}:`, error);
    }
}

/**
 * Render a Trello board inside a given container.
 */
function renderTrelloBoard(data, container) {
    // Store existing lists and their scroll positions
    const existingLists = {};
    container.querySelectorAll(".tr-column-base").forEach(listEl => {
        const id = listEl.dataset.listId;
        if (id) {
            existingLists[id] = {
                element: listEl,
                scrollTop: listEl.querySelector(".tr-column")?.scrollTop || 0
            };
        }
    });

    const activeListIds = new Set();
    const orderedListElements = [];

    data.lists.forEach(list => {
        if (list.closed) return;
        activeListIds.add(list.id);

        let listBase, header, column;
        const saved = existingLists[list.id];

        if (saved) {
            listBase = saved.element;
            header = listBase.querySelector(".tr-column-header");
            column = listBase.querySelector(".tr-column");
            if (header.textContent !== list.name) header.textContent = list.name;
        } else {
            listBase = document.createElement("div");
            listBase.classList.add("tr-column-base");
            listBase.dataset.listId = list.id;

            header = document.createElement("div");
            header.classList.add("tr-column-header");
            header.textContent = list.name;

            column = document.createElement("div");
            column.classList.add("tr-column", "thin-scrollbar");

            listBase.appendChild(header);
            listBase.appendChild(column);
        }

        // --- Update cards ---
        const existingCards = {};
        column.querySelectorAll(".tr-card").forEach(cardEl => {
            const id = cardEl.dataset.cardId;
            if (id) existingCards[id] = cardEl;
        });

        const cards = data.cards.filter(card => card.idList === list.id && !card.closed);
        const activeCardIds = new Set();
        const orderedCardElements = [];

        cards.forEach(card => {
            activeCardIds.add(card.id);
            let cardEl = existingCards[card.id];
            if (!cardEl) {
                cardEl = createCardElement(card);
                cardEl.dataset.cardId = card.id;
            } else {
                const newContent = createCardElement(card);
                if (cardEl.innerHTML !== newContent.innerHTML) {
                    cardEl.innerHTML = newContent.innerHTML;
                }
            }
            orderedCardElements.push(cardEl);
        });

        // Remove old cards
        for (const id in existingCards) {
            if (!activeCardIds.has(id)) existingCards[id].remove();
        }

        // Reorder cards without nuking scroll
        orderedCardElements.forEach(el => {
            if (el.parentNode !== column) column.appendChild(el);
            else if (el !== column.lastElementChild) column.appendChild(el);
        });

        orderedListElements.push(listBase);
    });

    // Remove deleted lists
    container.querySelectorAll(".tr-column-base").forEach(listEl => {
        const id = listEl.dataset.listId;
        if (!activeListIds.has(id)) listEl.remove();
    });

    // Reorder lists
    orderedListElements.forEach(el => container.appendChild(el));

    // --- Restore scroll positions ---
    orderedListElements.forEach(listEl => {
        const id = listEl.dataset.listId;
        const saved = existingLists[id];
        if (saved && listEl.querySelector(".tr-column")) {
            listEl.querySelector(".tr-column").scrollTop = saved.scrollTop;
        }
    });
}



/**
 * Create a Trello card element with labels, description, and attachments.
 */
function createCardElement(card) {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("tr-card");

    // --- LABELS ---
    const labelContainer = document.createElement("div");
    labelContainer.classList.add("tr-card-labels");

    card.labels.forEach(label => {
        const labelDiv = document.createElement("span");
        labelDiv.classList.add("tr-card-label", getLabelColorClass(label.color));
        labelDiv.textContent = label.name || "Unnamed";
        labelContainer.appendChild(labelDiv);
    });

    // --- TITLE ---
    const title = document.createElement("h4");
    title.textContent = card.name;

    // --- DESCRIPTION ---
    const desc = document.createElement("p");
    desc.innerHTML = formatMarkdown(card.desc || "");

    // --- ATTACHMENTS ---
    const attachmentContainer = document.createElement("div");
    attachmentContainer.classList.add("tr-card-attachments", "thin-scrollbar");

    card.attachments.forEach(att => {
        const link = document.createElement("a");
        link.href = att.url;
        link.textContent = att.name || "Attachment";
        link.target = "_blank";
        attachmentContainer.appendChild(link);
    });

    // --- Append only non-empty sections ---
    if (labelContainer.childElementCount > 0) cardDiv.appendChild(labelContainer);
    cardDiv.appendChild(title);
    if (desc.innerHTML.trim()) cardDiv.appendChild(desc);
    if (attachmentContainer.childElementCount > 0) cardDiv.appendChild(attachmentContainer);

    return cardDiv;
}

/**
 * Helpers
 */
function getLabelColorClass(color) {
    const colors = [
        "red","green","yellow","blue","purple","pink",
        "black","sky","lime","orange"
    ];
    return colors.includes(color) ? `tr-label-${color}` : "tr-label-default";
}

function formatMarkdown(text) {
    return text
        .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
        .replace(/\*(.+?)\*/g, "<i>$1</i>")
        .replace(/~~(.+?)~~/g, "<del>$1</del>")
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>')
        .replace(/\n/g, "<br>");
}
