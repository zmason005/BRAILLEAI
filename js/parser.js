/**
 * js/parser.js
 * The HTML Engine. Converts raw text chunks into strict semantic structures.
 */

export function parseMarkdownToNavigableHTML(text) {
    const container = document.createElement('div');
    
    // Normalize line endings and segment text block by block
    const blocks = text.split(/\n\n+/);
    
    blocks.forEach(block => {
        const trimmedBlock = block.trim();
        if (!trimmedBlock) return;

        // 1. Process Markdown Tables
        if (trimmedBlock.startsWith('|')) {
            const tableElement = buildSemanticTable(trimmedBlock);
            container.appendChild(tableElement);
        }
        // 2. Process Bulleted Lists
        else if (trimmedBlock.startsWith('- ') || trimmedBlock.startsWith('* ')) {
            const listElement = buildSemanticList(trimmedBlock);
            container.appendChild(listElement);
        }
        // 3. Fallback standard reading paragraphs
        else {
            const p = document.createElement('p');
            // Maintain layout clean breaks inside raw paragraph texts
            p.innerHTML = trimmedBlock.replace(/\n/g, '<br>');
            container.appendChild(p);
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
        // Discard edge splits from markdown format boundaries
        return index > 0 && index < arr.length - 1;
    });

    rawHeaders.forEach(headerText => {
        const th = document.createElement('th');
        th.setAttribute('scope', 'col'); // Tells VoiceOver explicitly it is a column rule
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Process Table Body (Skip index 0 header and index 1 separator strings |---|)
    const tbody = document.createElement('tbody');
    const dataLines = lines.slice(2);

    dataLines.forEach(line => {
        const tr = document.createElement('tr');
        const rawCells = line.split('|').map(c => c.trim()).filter((c, index, arr) => {
            return index > 0 && index < arr.length - 1;
        });

        rawCells.forEach(cellText => {
            const td = document.createElement('td');
            td.textContent = cellText;
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
        // Strip markdown list character flags safely
        const cleanContent = line.replace(/^[-*]\s+/, '');
        const li = document.createElement('li');
        li.textContent = cleanContent;
        ul.appendChild(li);
    });

    return ul;
}
