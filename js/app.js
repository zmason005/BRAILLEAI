/**
 * js/app.js
 * Application Orchestrator and User Input Event Lifecycle Controller.
 */

import { parseMarkdownToNavigableHTML, parseRawTextToParagraphs } from './parser.js';
import { submitPromptToModel } from './transport.js';

document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatLog = document.getElementById('chat-log');
    const glossaryList = document.getElementById('glossary-list');
    const btnSubmit = document.getElementById('btn-submit');
    const btnList = document.getElementById('btn-load-list');
    const btnTable = document.getElementById('btn-load-table');

    // Keep state index running. Initial page loads with seed item 1.
    let interactionCounter = 1;

    // Handle form submissions safely without caching errors or freezing states
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = userInput.value.trim();
        if (!text) return;

        try {
            // Retain values in textarea until processInteractionLoop explicitly copies strings
            await processInteractionLoop('default', text);
            userInput.value = ''; // Clean box exclusively after processing completes safely
        } catch (err) {
            console.error("Runtime exception encountered inside submission framework:", err);
            userInput.value = '';
        }
    });

    // Capture standard terminal carriage entries while preserving multi-line options
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Stop native newline execution behavior
            
            // Explicitly execute click listener logic to route through form lifecycle handlers cleanly
            if (btnSubmit) {
                btnSubmit.click();
            } else {
                chatForm.dispatchEvent(new Event('submit'));
            }
        }
    });

    // Verification helper triggers
    btnList.addEventListener('click', async () => {
        await processInteractionLoop('simulated-list', 'Execute List Simulation Output Pattern Request.');
    });

    btnTable.addEventListener('click', async () => {
        await processInteractionLoop('simulated-table', 'Execute Table Matrix Output Pattern Request.');
    });

    /**
     * Executes the strict Prompt + Response dual-article processing loop
     */
    async function processInteractionLoop(platform, userText) {
        interactionCounter++;
        const currentIdIndex = interactionCounter;

        // 1. Generate and Append Prompt Article
        const promptArticle = document.createElement('article');
        promptArticle.className = 'prompt-article';
        promptArticle.id = `prompt-target-${currentIdIndex}`;
        
        const promptHeading = `<h5 id="prompt-${currentIdIndex}">PROMPT ${currentIdIndex}</h5>`;
        const promptContent = parseRawTextToParagraphs(userText);
        promptArticle.innerHTML = promptHeading + promptContent;
        chatLog.appendChild(promptArticle);

        // 2. Append anchor listing to dynamic Conversation Index Glossary
        const glossaryItem = document.createElement('li');
        const glossaryLink = document.createElement('a');
        glossaryLink.href = `#prompt-target-${currentIdIndex}`;
        
        // Extract plain snippet for clean Braille panning
        const normalizedText = userText.replace(/\n+/g, ' ');
        const textSnippet = normalizedText.length > 40 ? normalizedText.substring(0, 40) + '...' : normalizedText;
        glossaryLink.textContent = `Go to Exchange ${currentIdIndex}: ${textSnippet}`;
        
        glossaryItem.appendChild(glossaryLink);
        glossaryList.appendChild(glossaryItem);

        // 3. Request background data generation
        let responseHTML = '';
        try {
            const rawResponse = await submitPromptToModel(platform, userText);
            responseHTML = parseMarkdownToNavigableHTML(rawResponse);
        } catch (err) {
            responseHTML = '<p>Connection or streaming processing execution failed.</p>';
        }

        // 4. Generate and Append Response Article
        const responseArticle = document.createElement('article');
        responseArticle.className = 'response-article';
        responseArticle.id = `response-target-${currentIdIndex}`;
        
        const responseHeading = `<h6 id="response-${currentIdIndex}">RESPONSE ${currentIdIndex}</h6>`;
        responseArticle.innerHTML = responseHeading + responseHTML;
        chatLog.appendChild(responseArticle);
        
        // Safe linear scroll updates
        window.scrollTo(0, document.body.scrollHeight);
    }
});
