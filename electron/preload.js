// Preload script for Electron
// This script runs in the renderer process before web content loads

const { contextBridge } = require('electron');

// Expose protected methods that allow the renderer process to use
// selected node.js features without exposing full node.js APIs
contextBridge.exposeInMainWorld('electronAPI', {
  // Add any APIs you want to expose to the renderer here
  platform: process.platform,
  isElectron: true
});
