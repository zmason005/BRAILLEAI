/**
 * app.js
 * Application Orchestrator and User Input Event Lifecycle Controller.
 * Dynamically updates the live aria-log region with clean semantic markup.
 */

// Relative imports optimized to find peer files inside the same js subfolder
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
        
        // Block empty submissions to prevent empty DOM mutations
        if (!text) return;

        try {
            // Run the dynamic update loop using the default platform transport logic
            await processInteractionLoop('default', text);
            
            // Clean box exclusively after processing completes safely to protect text buffering
            userInput.value = ''; 
            
            // Retain user focus for immediate continuation via Braille routing keys
            userInput.focus(); 
        } catch (err) {
            console.error("Runtime exception encountered inside submission framework:", err);
            userInput.value = '';
        }
    });

    // Capture standard terminal carriage entries while preserving multi-line options
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Stop native newline execution behavior
            e.stopPropagation(); // Stop event bubbling propagation loops entirely
            
            // Explicitly execute click listener logic to route through form lifecycle handlers cleanly
            if (btnSubmit) {
                btnSubmit.click();
            } else {
                chatForm.dispatchEvent(new Event('submit'));
            }
        }
    });

    // Verification helper triggers for simulating specialized structures
    btnList.addEventListener('click', async () => {
        await processInteractionLoop('simulated-list', 'Execute List Simulation Output Pattern Request.');
    });

    btnTable.addEventListener('click', async () => {
        await processInteractionLoop('simulated-table', 'Execute Table Matrix Output Pattern Request.');
    });

    /**
     * Executes the strict Prompt + Response dual-article processing loop
     * Dynamically appends semantic text nodes to the live conversation log
     */
    async function processInteractionLoop(platform, userText) {
        // Increment tracking pointer to keep heading milestones strictly linear
        interactionCounter++;
        const currentIdIndex = interactionCounter;

        // ==========================================
        // STEP 1: ASSEMBLE AND APPEND USER PROMPT
        // ==========================================
        const promptArticle = document.createElement('article');
        promptArticle.className = 'prompt-article';
        promptArticle.id = `prompt-target-${currentIdIndex}`;
        
        // Enforced strict level-5 heading for prompt sections per architectural adjustments
        const promptHeading = `<h5 id="prompt-${currentIdIndex}">PROMPT ${currentIdIndex}</h5>`;
        
        // Transform multiline raw inputs into true isolated paragraph structures
        const promptContent = parseRawTextToParagraphs(userText);
        
        // Safely map code fragments to innerHTML inside the detached element
        promptArticle.innerHTML = promptHeading + promptContent;
        
        // Inject block into the live aria log framework
        chatLog.appendChild(promptArticle);

        // ==========================================
        // STEP 2: CONSTRUCT INSTANT GLOSSARY ROUTING
        // ==========================================
        const glossaryItem = document.createElement('li');
        const glossaryLink = document.createElement('a');
        glossaryLink.href = `#prompt-target-${currentIdIndex}`;
        
        // Normalize line breaks for clean screen reader speech and Braille display line pacing
        const normalizedText = userText.replace(/\n+/g, ' ');
        const textSnippet = normalizedText.length > 40 ? normalizedText.substring(0, 40) + '...' : normalizedText;
        glossaryLink.textContent = `Go to Exchange ${currentIdIndex}: ${textSnippet}`;
        
        glossaryItem.appendChild(glossaryLink);
        glossaryList.appendChild(glossaryItem);

        // ==========================================
        // STEP 3: ASYNC FETCH & RESPONSE RENDERING
        // ==========================================
        let responseHTML = '';
        try {
            // Handshake payload over mock transport module
            const rawResponse = await submitPromptToModel(platform, userText);
            // Map raw text streams into completely clean HTML matrices
            responseHTML = parseMarkdownToNavigableHTML(rawResponse);
        } catch (err) {
            responseHTML = '<p>Connection or streaming processing execution failed.</p>';
        }

        // ==========================================
        // STEP 4: ASSEMBLE AND APPEND AI RESPONSE
        // ==========================================
        const responseArticle = document.createElement('article');
        responseArticle.className = 'response-article';
        responseArticle.id = `response-target-${currentIdIndex}`;
        
        // Maintained level-6 heading structure for response blocks
        const responseHeading = `<h6 id="response-${currentIdIndex}">RESPONSE ${currentIdIndex}</h6>`;
        
        // Incorporate response fragment text securely
        responseArticle.innerHTML = responseHeading + responseHTML;
        
        // Push full response structure block to user viewport log
        chatLog.appendChild(responseArticle);
        
        // Smoothly adjust tracking viewport window position
        window.scrollTo(0, document.body.scrollHeight);
    }
});
