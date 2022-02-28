const { BrowserWindow } = require('electron');
const path = require('path');

exports.windowOption = {
    //  frame:true,
    width: 1100,
    height: 700,
    // webContents: options.webContents,
    icon: exports.iconPath,
    webPreferences: {
        preload: exports.preloadJS,
        nativeWindowOpen: true,
        // nodeIntegration: true
    }
}

exports.preloadJS = path.join(__dirname, '../preload.js');
exports.iconPath = path.join(__dirname, '../build/icons/icon.png');

exports.createWindow = function() {
    let w = new BrowserWindow(exports.windowOption);
    w.webContents.setUserAgent('Chrome');

    return w;
}