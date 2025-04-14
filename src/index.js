/* global SillyTavern */
import 'katex/dist/katex.min.css';
import katex from 'katex';
import asciiMathToLatex from 'asciimath-to-latex';
import renderMathInElement from 'katex/dist/contrib/auto-render';

const {
    eventSource,
    event_types,
    getContext,
} = SillyTavern.getContext();

const katexOptions = {
    delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '\\[', right: '\\]', display: true },
        { left: '\\(', right: '\\)', display: false },
        { left: '$', right: '$', display: false },
        {
            left: '§', right: '§', display: false,
            preprocessor: (text) => {
                try {
                    return asciiMathToLatex(text);
                } catch (error) {
                    // Log error for debugging, but don't break rendering
                    console.error("[LaTeX Extension] Error converting AsciiMath:", error);
                    // Display error message within KaTeX itself
                    return `\\text{AsciiMath Error: ${error.message.replace(/\\/g, '\\\\').replace(/[{}]/g, '')}}`;
                }
            },
        },
    ],
    throwOnError: false,
    output: 'mathml',
};

// Renders KaTeX in a single provided message element's text container
function renderSingleMessageElement(element) {
    if (!element) {
        return false;
    }

    // Always clear previous KaTeX spans before attempting to render/re-render
    const existingKatexSpans = element.querySelectorAll('.katex-mathml, .katex');
    if (existingKatexSpans.length > 0) {
        existingKatexSpans.forEach(span => {
             // Just remove the old span. Assumes the underlying text node
             // has been updated by SillyTavern's edit mechanism.
             if (span.parentNode) {
                span.parentNode.removeChild(span);
             }
        });
        element.normalize(); // Consolidate text nodes after removal
    }

    // Always Remove the rendered flag before attempting to re-render
    delete element.dataset.katexRendered;

    // Attempt rendering
    let rendered = false;
    try {
        // Let renderMathInElement find delimiters in the current content
        renderMathInElement(element, katexOptions);
        if (element.querySelector('.katex-mathml, .katex')) {
            rendered = true;
            // Add flag only if rendering actually happened
            element.dataset.katexRendered = 'true';
        }
    } catch (error) {
        // Log rendering errors
        console.error("[LaTeX Extension] Error during renderMathInElement:", error, "on element:", element);
    }
    return rendered;
}


// Renders all messages currently in the chat
async function renderMathForAllMessages() {
    const messageTextElements = document.querySelectorAll('#chat .mes_text');

    if (messageTextElements.length === 0) {
        return;
    }

    let renderedAny = false;
    for (const element of messageTextElements) {
        if (renderSingleMessageElement(element)) {
            renderedAny = true;
        }
    }

    if (renderedAny) {
        // Wait for the DOM to update after rendering.
        await new Promise((resolve) => setTimeout(resolve, 50));
    }
}

// Specific handler for newly rendered messages
function handleNewMessageRendered(messageId) {
    setTimeout(() => {
        const messageElement = document.getElementById(`chatMessage_${messageId}`);
        if (messageElement) {
            const textElement = messageElement.querySelector('.mes_text');
            if (textElement) {
                 renderSingleMessageElement(textElement);
            } else {
                // console.warn(`[LaTeX Extension] Could not find .mes_text for message ID ${messageId}`);
            }
        } else {
             // console.warn(`[LaTeX Extension] Could not find message element for ID ${messageId}`);
             renderMathForAllMessages(); // Fallback
        }
    }, 150);
}

// Generic handler for events that require full re-render
function handleChatUpdate(eventId) {
    // console.log(`[LaTeX Extension] Chat update/change/swipe event triggered (ID: ${eventId}), scheduling full render.`);
    // Always trigger full render for simplicity and robustness on updates/changes/swipes
    setTimeout(renderMathForAllMessages, 200);
}


// Set up event listeners
eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, handleNewMessageRendered);
eventSource.on(event_types.USER_MESSAGE_RENDERED, handleNewMessageRendered);
eventSource.on(event_types.MESSAGE_UPDATED, handleChatUpdate);
eventSource.on(event_types.CHAT_CHANGED, handleChatUpdate);
eventSource.on(event_types.MESSAGE_SWIPED, handleChatUpdate);


// Initial Render
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderMathForAllMessages);
} else {
    renderMathForAllMessages();
}
