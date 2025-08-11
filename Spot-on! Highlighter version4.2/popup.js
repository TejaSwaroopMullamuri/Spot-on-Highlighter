// Simple popup script for Spot On! Highlighter
class SpotOnPopup {
    constructor() {
        this.isSpotlightOn = false;
        this.selectedColor = '#ffff00';
        this.globalDefaultColor = '#ffff00';
        this.siteSettings = {};
        this.hostname = null;
        
        this.init();
    }
    
    async init() {
        await this.loadSettings();
        await this.getCurrentTabHostname();
        this.setupEventListeners();
        this.updateUI();
    }
    
    async loadSettings() {
        try {
            const result = await chrome.storage.local.get([
                'isSpotlightOn',
                'defaultHighlightColorValue',
                'siteColorSettings'
            ]);
            
            this.isSpotlightOn = result.isSpotlightOn || false;
            this.globalDefaultColor = result.defaultHighlightColorValue || '#ffff00';
            this.siteSettings = result.siteColorSettings || {};
            
            // Use site-specific color if available, otherwise global default
            const siteColor = this.hostname ? this.siteSettings[this.hostname] : null;
            this.selectedColor = siteColor || this.globalDefaultColor;
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }
    
    async getCurrentTabHostname() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab?.url) {
                const url = new URL(tab.url);
                this.hostname = url.hostname;
            }
        } catch (error) {
            console.error('Error getting hostname:', error);
        }
    }
    
    setupEventListeners() {
        // Toggle button
        const toggleBtn = document.getElementById('toggleBtn');
        toggleBtn.addEventListener('click', () => this.handleToggle());
        
        // Color picker
        const colorPicker = document.getElementById('colorPicker');
        colorPicker.addEventListener('change', (e) => this.handleColorChange(e.target.value));
        
        // Set Global button
        const setGlobalBtn = document.getElementById('setGlobalBtn');
        setGlobalBtn.addEventListener('click', () => this.handleSetGlobal());
        
        // Reset Site button
        const resetSiteBtn = document.getElementById('resetSiteBtn');
        resetSiteBtn.addEventListener('click', () => this.handleResetSite());
    }
    
    updateUI() {
        // Update toggle button
        const toggleBtn = document.getElementById('toggleBtn');
        const colorSection = document.getElementById('colorSection');
        const buttonSection = document.getElementById('buttonSection');
        
        if (this.isSpotlightOn) {
            toggleBtn.classList.add('active');
            colorSection.classList.remove('hidden');
            buttonSection.classList.remove('hidden');
        } else {
            toggleBtn.classList.remove('active');
            colorSection.classList.add('hidden');
            buttonSection.classList.add('hidden');
        }
        
        // Update color picker
        const colorPicker = document.getElementById('colorPicker');
        colorPicker.value = this.selectedColor;
        
        // Update buttons
        const setGlobalBtn = document.getElementById('setGlobalBtn');
        const resetSiteBtn = document.getElementById('resetSiteBtn');
        
        const isGlobalDifferent = this.selectedColor !== this.globalDefaultColor;
        setGlobalBtn.disabled = !isGlobalDifferent;
        
        const hasSiteColor = this.hostname && this.siteSettings[this.hostname];
        resetSiteBtn.disabled = !hasSiteColor;
    }
    
    async handleToggle() {
        this.isSpotlightOn = !this.isSpotlightOn;
        
        // Save to storage
        await chrome.storage.local.set({ isSpotlightOn: this.isSpotlightOn });
        
        // Update content script
        this.updateContentScript();
        
        // Update UI
        this.updateUI();
    }
    
    async handleColorChange(color) {
        this.selectedColor = color;
        
        // If we have a hostname, save as site-specific setting
        if (this.hostname) {
            this.siteSettings[this.hostname] = color;
            await chrome.storage.local.set({ siteColorSettings: this.siteSettings });
        }
        
        // Update content script
        this.updateContentScript();
        
        // Update UI
        this.updateUI();
    }
    
    async handleSetGlobal() {
        this.globalDefaultColor = this.selectedColor;
        await chrome.storage.local.set({ defaultHighlightColorValue: this.selectedColor });
        this.updateUI();
    }
    
    async handleResetSite() {
        if (this.hostname && this.siteSettings[this.hostname]) {
            delete this.siteSettings[this.hostname];
            await chrome.storage.local.set({ siteColorSettings: this.siteSettings });
            
            // Reset to global default
            this.selectedColor = this.globalDefaultColor;
            
            // Update content script
            this.updateContentScript();
            
            // Update UI
            this.updateUI();
        }
    }
    
    updateContentScript() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'UPDATE_STATE',
                    payload: {
                        isSpotlightOn: this.isSpotlightOn,
                        highlightColor: this.selectedColor
                    }
                });
            }
        });
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SpotOnPopup();
});
