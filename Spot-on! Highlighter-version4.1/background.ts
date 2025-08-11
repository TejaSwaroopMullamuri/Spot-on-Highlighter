
declare const chrome: any; // Add this line to inform TypeScript about the global chrome object

// Background Service Worker for Spot On!

// Listener for when the extension is installed or updated
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onInstalled) {
  chrome.runtime.onInstalled.addListener((details: any) => { // Changed chrome.runtime.InstalledDetails to any
    const initialReason = details.reason;
    console.log(`Spot On! Background: onInstalled event, reason: ${initialReason}`);

    if (initialReason === 'install') {
      console.log('Spot On! Highlighter: Extension installed. Setting default values.');
      // Set initial default values in storage
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({
          isSpotlightOn: false, // Default to OFF
          defaultHighlightColorValue: '#FFD700', // Default Gold color
          siteColorSettings: {} // Initialize empty site-specific color settings
        }, () => {
          if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError) {
            console.error("Spot On! Background: Error setting default values on install:", chrome.runtime.lastError.message);
          } else {
            console.log("Spot On! Background: Default values set successfully on install.");
          }
        });
      }
    } else if (initialReason === 'update') {
      // console.log('Spot On! Highlighter: Extension updated to version ' + (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest ? chrome.runtime.getManifest().version : 'unknown'));
      // Ensure new storage keys are initialized if they don't exist after an update
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['isSpotlightOn', 'defaultHighlightColorValue', 'siteColorSettings'], (result: any) => {
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError) {
                console.error("Spot On! Background: Error getting values on update:", chrome.runtime.lastError.message);
                return;
            }
            const update: { [key: string]: any } = {};
            if (result.isSpotlightOn === undefined) {
                update.isSpotlightOn = false;
            }
            if (result.defaultHighlightColorValue === undefined) {
                update.defaultHighlightColorValue = '#FFD700'; // Ensure default color exists
            }
            if (result.siteColorSettings === undefined) {
                update.siteColorSettings = {}; // Ensure site settings object exists
            }

            if (Object.keys(update).length > 0) {
                chrome.storage.local.set(update, () => {
                    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError) {
                        console.error("Spot On! Background: Error setting missing default values on update:", chrome.runtime.lastError.message);
                    } else {
                        // console.log("Spot On! Background: Missing default values set on update.");
                    }
                });
            }
        });
      }
    }
  });
}

// console.log("Spot On! Background service worker started.");
