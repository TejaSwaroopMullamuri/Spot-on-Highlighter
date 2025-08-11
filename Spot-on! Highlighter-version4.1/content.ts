
declare const chrome: any;

// Content Script for Spot On! Highlighter
import { hexToRgba } from './utils/colorUtils';
import { FALLBACK_DEFAULT_HIGHLIGHT_COLOR } from './constants';

// Prevent multiple script loads
if (!(window as any).spotOnHighlighterLoaded) {
  (window as any).spotOnHighlighterLoaded = true;

  let isSpotlightOn = false;
  let highlightColor = FALLBACK_DEFAULT_HIGHLIGHT_COLOR;
  let currentHighlight: HTMLElement | null = null;
  let hoverTimer: number | null = null;

  // Create highlight overlay
  function createHighlight(element: HTMLElement) {
    removeHighlight();
    
    const highlight = document.createElement('div');
    highlight.id = 'spot-on-highlight';
    highlight.style.cssText = `
      position: absolute;
      pointer-events: none;
      z-index: 999999;
      border-radius: 3px;
      transition: all 0.2s ease;
      background-color: ${hexToRgba(highlightColor, 0.3)};
    `;
    
    const rect = element.getBoundingClientRect();
    highlight.style.top = (window.scrollY + rect.top) + 'px';
    highlight.style.left = (window.scrollX + rect.left) + 'px';
    highlight.style.width = rect.width + 'px';
    highlight.style.height = rect.height + 'px';
    
    document.body.appendChild(highlight);
    currentHighlight = highlight;
  }

  // Remove highlight overlay
  function removeHighlight() {
    if (currentHighlight) {
      currentHighlight.remove();
      currentHighlight = null;
    }
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      hoverTimer = null;
    }
    
    // Clean up any temporary spans that might have been created
    const tempSpans = document.querySelectorAll('.spot-on-temp-highlight');
    tempSpans.forEach(span => {
      if (span.parentNode) {
        const textContent = span.textContent || '';
        span.parentNode.replaceChild(document.createTextNode(textContent), span);
      }
    });
  }

  // Check if element should be highlighted
  function shouldHighlight(element: Element): boolean {
    if (!element || !(element instanceof HTMLElement)) return false;
    
    // Don't highlight our own overlay
    if (element.id === 'spot-on-highlight') return false;
    
    const tagName = element.tagName.toLowerCase();
    
    // Allow most text-containing elements
    if (!['p', 'span', 'a', 'strong', 'em', 'b', 'i', 'code', 'kbd', 'small', 'sub', 'sup', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'td', 'th', 'div'].includes(tagName)) {
      return false;
    }
    
    // Must have meaningful text content
    const text = element.textContent?.trim() || '';
    if (text.length < 3 || text.length > 1000) return false;
    
    // Don't highlight if it's likely navigation/UI elements
    const classNames = element.className.toLowerCase();
    const id = element.id.toLowerCase();
    const navTerms = ['nav', 'menu', 'button', 'btn', 'header', 'footer', 'sidebar', 'toolbar', 'controls', 'icon', 'search'];
    if (navTerms.some(term => classNames.includes(term) || id.includes(term))) return false;
    
    // Check if element is visible
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return false;
    }
    
    // More generous size constraints
    const rect = element.getBoundingClientRect();
    if (rect.width < 20 || rect.height < 10 || rect.width > 1200 || rect.height > 400) {
      return false;
    }
    
    // Much more lenient container detection - only exclude obvious page containers
    const blockChildren = element.querySelectorAll('section, article, main, aside, nav, header, footer');
    if (blockChildren.length > 0) {
      return false;
    }
    
    // Allow more complex elements but avoid massive containers
    const allChildren = element.querySelectorAll('*');
    if (allChildren.length > 50) {
      return false;
    }
    
    return true;
  }

  // Handle mouse move events
  function handleMouseMove(event: MouseEvent) {
    if (!isSpotlightOn) return;
    
    // Get all elements at this point, starting with the most specific
    const elements = document.elementsFromPoint(event.clientX, event.clientY);
    let targetElement: Element | null = null;
    
    // Find highlightable elements
    const highlightableElements = elements.filter(shouldHighlight);
    
    if (highlightableElements.length > 0) {
      // Sort by size (smaller first) and tag preference
      targetElement = highlightableElements.sort((a, b) => {
        const aRect = a.getBoundingClientRect();
        const bRect = b.getBoundingClientRect();
        const aSize = aRect.width * aRect.height;
        const bSize = bRect.width * bRect.height;
        
        // Prefer specific text elements over divs
        const tagPriority = (tag: string) => {
          const priorities: {[key: string]: number} = {
            'span': 1, 'a': 1, 'strong': 1, 'em': 1, 'b': 1, 'i': 1, 'code': 1,
            'p': 2, 'h1': 2, 'h2': 2, 'h3': 2, 'h4': 2, 'h5': 2, 'h6': 2,
            'li': 3, 'td': 3, 'th': 3,
            'div': 4
          };
          return priorities[tag] || 5;
        };
        
        const aPriority = tagPriority(a.tagName.toLowerCase());
        const bPriority = tagPriority(b.tagName.toLowerCase());
        
        // First sort by tag priority
        if (aPriority !== bPriority) return aPriority - bPriority;
        
        // Then by size (smaller first)
        return aSize - bSize;
      })[0];
    }
    
    if (!targetElement) {
      removeHighlight();
      return;
    }
    
    // Debounce highlight creation
    if (hoverTimer) clearTimeout(hoverTimer);
    hoverTimer = window.setTimeout(() => {
      if (targetElement && shouldHighlight(targetElement)) {
        createHighlight(targetElement as HTMLElement);
      }
    }, 100); // Slightly slower for stability
  }

  // Handle mouse leave
  function handleMouseLeave() {
    removeHighlight();
  }

  // Handle scroll/resize to update highlight position
  function handleScrollResize() {
    if (currentHighlight) {
      // For now, just remove highlight on scroll/resize
      removeHighlight();
    }
  }

  // Add event listeners
  function addListeners() {
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    window.addEventListener('scroll', handleScrollResize, { passive: true });
    window.addEventListener('resize', handleScrollResize, { passive: true });
  }

  // Remove event listeners
  function removeListeners() {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseleave', handleMouseLeave);
    window.removeEventListener('scroll', handleScrollResize);
    window.removeEventListener('resize', handleScrollResize);
    removeHighlight();
  }

  // Initialize settings from storage
  chrome.storage.local.get(['isSpotlightOn', 'defaultHighlightColorValue', 'siteColorSettings'], (result: any) => {
    const hostname = window.location.hostname;
    isSpotlightOn = result.isSpotlightOn || false;
    
    const globalColor = result.defaultHighlightColorValue || FALLBACK_DEFAULT_HIGHLIGHT_COLOR;
    const siteSettings = result.siteColorSettings || {};
    highlightColor = siteSettings[hostname] || globalColor;
    
    if (isSpotlightOn) {
      addListeners();
    }
  });

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message: any, sender: any, sendResponse: any) => {
    if (message.type === 'UPDATE_STATE') {
      const wasOn = isSpotlightOn;
      isSpotlightOn = message.payload.isSpotlightOn;
      highlightColor = message.payload.highlightColor;
      
      if (isSpotlightOn && !wasOn) {
        addListeners();
      } else if (!isSpotlightOn && wasOn) {
        removeListeners();
      }
      
      sendResponse({ status: 'updated' });
    }
    return true;
  });

  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes: any, namespace: any) => {
    if (namespace === 'local') {
      const hostname = window.location.hostname;
      
      if (changes.isSpotlightOn) {
        const wasOn = isSpotlightOn;
        isSpotlightOn = changes.isSpotlightOn.newValue;
        
        if (isSpotlightOn && !wasOn) {
          addListeners();
        } else if (!isSpotlightOn && wasOn) {
          removeListeners();
        }
      }
      
      if (changes.defaultHighlightColorValue || changes.siteColorSettings) {
        const globalColor = changes.defaultHighlightColorValue?.newValue || highlightColor;
        const siteSettings = changes.siteColorSettings?.newValue || {};
        highlightColor = siteSettings[hostname] || globalColor;
      }
    }
  });
}