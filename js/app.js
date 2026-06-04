/**
 * js/app.js
 * Application Orchestrator and User Input Event Lifecycle Controller.
 */

import { parseMarkdownToNavigableHTML } from './parser.js';
import { submitPromptToModel } from './transport.js';

document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatLog = document.getElementById('chat-log');
    const btnList = document.getElementById('btn-load-list');
    const btnTable = document.getElementById('btn-load-table');

    // Handle form submissions
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = userInput.value.trim();
        if (!text) return;

        appendMessageEntry('user', text);
        userInput.value = '';

        // Execute processing tracking states
        try {
            const rawResponse = await submitPromptToModel('default', text);
            appendMessageEntry('ai', rawResponse);
        } catch (err) {
            appendMessageEntry('system', 'Connection or streaming processing execution failed.');
        }
    });

    // Capture standard terminal carriage entries while preserving multi-line options
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Stop native newline behavior
            chatForm.requestSubmit(); // Dispatch clean submission lifecycles
        }
    });

    // Map verification helper controllers
    btnList.addEventListener('click', async () => {
        appendMessageEntry('user', 'Execute List Simulation Output Pattern Request.');
        const response = await submitPromptToModel('simulated-list', '');
        appendMessageEntry('ai', response);
    });

    btnTable.addEventListener('click', async () => {
        appendMessageEntry('user', 'Execute Table Matrix Output Pattern Request.');
        const response = await submitPromptToModel('simulated-table', '');
        appendMessageEntry('ai', response);
    });

    function appendMessageEntry(sender, rawText) {
        const msgContainer = document.createElement('div');
        msgContainer.classList.add('chat-message', `${sender}-message`);

        // Apply custom accessible structural parser logic to AI outputs
        if (sender === 'ai') {
            msgContainer.innerHTML = parseMarkdownToNavigableHTML(rawText);
        } else {
            const p = document.createElement('p');
            p.textContent = rawText;
            msgContainer.appendChild(p);
        }

        chatLog.appendChild(msgContainer);
        
        // Ensure standard scrolling view updates alongside text additions
        chatLog.scrollTop = chatLog.scrollHeight;
    }
});
