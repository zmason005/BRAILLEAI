/**
 * parser.js
 * The HTML Engine. Converts raw text chunks into strict semantic structures.
 */

/**
 * Parses user multiline plain text inputs into individual standalone paragraphs.
 * Completely replaces <br> behaviors with strict <p> block tags.
 */
export function parseRawTextToParagraphs(text) {
    if (!text) return '';
    return text
        .split(/\n+/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => `<p>${line}</p>`)
        .join('');
}

/**
 * Handles raw responses containing structures like tables and lists
 */
export function parseMarkdownToNavigableHTML(text) {
    const container = document.createElement('div');
    const blocks = text.split(/\n\n+/);
    
    blocks.forEach(block => {
        const trimmedBlock = block.trim();
        if (!trimmedBlock) return;

        // 1. Process Markdown Tables
        if (trimmedBlock.startsWith('|')) {
            const tableElement = buildSemanticTable(trimmedBlock);
            container.appendChild(tableElement);
        }
        // 2. Process Bulleted Lists (Handles mixed Markdown asterisks or hyphens)
        else if (trimmedBlock.startsWith('- ') || trimmedBlock.startsWith('* ')) {
            const listElement = buildSemanticList(trimmedBlock);
            container.appendChild(listElement);
        }
        // 3. Fallback standard reading paragraphs
        else {
            // Split inner blocks by any remaining sub-newlines to force true paragraph isolation
            const subLines = trimmedBlock.split(/\n+/);
            subLines.forEach(line => {
                const cleanLine = line.trim();
                if (cleanLine) {
                    const p = document.createElement('p');
                    p.textContent = cleanLine;
                    container.appendChild(p);
                }
            });
        }
    });

    return container.innerHTML;
}

function buildSemanticTable(markdownText) {
    const table = document.createElement('table');
    const lines = markdownText.split('\n').map(l => l.trim()).filter(l => l);
    
    if (lines.length === 0) return table;

    // Process Table Header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const rawHeaders = lines[0].split('|').map(h => h.trim()).filter((h, index, arr) => {
        return index > 0 && index < arr.length - 1;
    });

    rawHeaders.forEach(headerText => {
        const th = document.createElement('th');
        th.setAttribute('scope', 'col'); // Explicitly anchors column rules for screen readers
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Process Table Body
    const tbody = document.createElement('tbody');
    const dataLines = lines.slice(2); // Skips header row and divider line

    dataLines.forEach(line => {
        const tr = document.createElement('tr');
        const rawCells = line.split('|').map(c => c.trim()).filter((c, index, arr) => {
            return index > 0 && index < arr.length - 1;
        });

        rawCells.forEach(cellText => {
            const td = document.createElement('td');
            const trimmed = cellText.trim();
            // Injects text or a explicit non-breaking space fallback 
            // to shield cell structural layout calculation failures on refreshable displays
            td.textContent = trimmed === '' ? '\u00A0' : trimmed;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    return table;
}

function buildSemanticList(markdownText) {
    const ul = document.createElement('ul');
    const lines = markdownText.split('\n').map(l => l.trim()).filter(l => l);

    lines.forEach(line => {
        const cleanContent = line.replace(/^[-*]\s+/, '');
        const li = document.createElement('li');
        li.textContent = cleanContent;
        ul.appendChild(li);
    });

    return ul;
}
