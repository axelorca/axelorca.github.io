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
    container.innerHTML = ""; // Clear existing content

    data.lists.forEach(list => {
        if (list.closed) return; // Skip archived lists

        const listBase = document.createElement("div");
        listBase.classList.add("tr-column-base");

        const header = document.createElement("div");
        header.classList.add("tr-column-header");
        header.textContent = list.name;

        const column = document.createElement("div");
        column.classList.add("tr-column", "thin-scrollbar");

        const cards = data.cards.filter(card => card.idList === list.id && !card.closed);
        cards.forEach(card => column.appendChild(createCardElement(card)));

        listBase.appendChild(header);
        listBase.appendChild(column);
        container.appendChild(listBase);
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
