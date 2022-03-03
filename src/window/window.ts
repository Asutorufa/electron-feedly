import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import * as path from "path";

export const preloadJS = path.join(__dirname, "../preload.js");
export const iconPath = path.join(__dirname, "../icons/icon.png");
export const windowOption: BrowserWindowConstructorOptions = {
    height: 700,
    width: 1100,
    icon: iconPath,
    webPreferences: {
        preload: preloadJS,
        nativeWindowOpen: true,
    },
}

export const createWindow = (): BrowserWindow => {
    const w = new BrowserWindow(windowOption);
    w.webContents.setUserAgent('Chrome');

    return w;
}