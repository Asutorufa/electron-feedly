import { Menu, MenuItem, BrowserWindow, clipboard, shell, Event, ContextMenuParams } from 'electron';
import { iconPath, createWindow, preloadJS } from './window';

export const contextMenu = (_: Event, params: ContextMenuParams): void => {
    const menu = new Menu();
    if (params.isEditable) {
        menu.append(new MenuItem({ label: 'undo', role: 'undo' }));
        menu.append(new MenuItem({ label: 'redo', role: 'redo' }));
        menu.append(new MenuItem({ label: 'cut', role: 'cut' }));
        menu.append(new MenuItem({ label: 'paste', role: 'paste' }));
        // menu.append(new MenuItem({ role: 'pasteandmatchstyle' }));
        menu.append(new MenuItem({ label: 'delete', role: 'delete' }));
    }

    if (params.srcURL) {
        if (params.hasImageContents) {
            menu.append(new MenuItem({
                label: "View Image",
                click: () => {
                    new BrowserWindow({
                        width: 500,
                        height: 480,
                        icon: iconPath,
                        webPreferences: {
                            preload: preloadJS,
                            // nodeIntegration: true,
                            nativeWindowOpen: true
                        },
                        title: 'View Media'
                    }).loadURL(params.srcURL).then();
                }
            }));
            menu.append(new MenuItem({
                label: 'Copy Image',
                click: (_, focusWindow) => {
                    focusWindow.webContents.copyImageAt(params.x, params.y);
                }
            }));
            menu.append(new MenuItem({
                label: "Copy Image Link",
                click: () => {
                    // console.log(params.srcURL);
                    clipboard.writeText(params.srcURL);
                }
            }));
        } else {
            menu.append(new MenuItem({
                label: "Copy Media Link",
                click: () => {
                    // console.log(params.srcURL);
                    clipboard.writeText(params.srcURL);
                }
            }));
            menu.append(new MenuItem({
                label: "Download Media",
                click: (_, focusWindow) => {
                    focusWindow.loadURL(params.srcURL).then();
                }
            }));
        }
    }

    if (params.linkURL) {
        const linkURL = params.linkURL;
        const linkText = params.linkText;
        menu.append(new MenuItem({
            label: "Open This Link At External Browser",
            click: function () {
                shell.openExternal(linkURL).then();
            }
        }));
        menu.append(new MenuItem({
            label: "Copy Link",
            click: function () {
                clipboard.writeText(linkURL);
            }
        }));
        menu.append(new MenuItem({
            label: "Copy Link Text",
            click: function () {
                clipboard.writeText(linkText);
            }
        }))
    }

    if (params.selectionText) {
        menu.append(new MenuItem({
            label: 'Copy',
            role: 'copy'
        }));
        menu.append(new MenuItem({
            label: 'Search From Google',
            click: () => {
                createWindow().loadURL("https://www.google.com/search?q=" + params.selectionText).then();
            }
        }))
    }

    if (BrowserWindow.getFocusedWindow().webContents.canGoBack()) {
        menu.append(new MenuItem({
            label: 'Go Back',
            accelerator: 'Alt+Left',
            click: function (_, focusedWindow) {
                focusedWindow.webContents.goBack()
            }
        }));
    }

    if (BrowserWindow.getFocusedWindow().webContents.canGoForward()) {
        menu.append(new MenuItem({
            label: 'Go Forward',
            accelerator: 'Alt+Right',
            click: function (_, focusedWindow) {
                focusedWindow.webContents.goForward()
            }
        }));
    }

    menu.append(new MenuItem({
        label: 'Copy This Page\'s URL',
        click: function (_, focusWindow) {
            clipboard.writeText(focusWindow.webContents.getURL());
        }
    }));
    menu.append(new MenuItem({ label: "Select All", role: "selectAll" }));
    menu.append(new MenuItem({
        label: 'Refresh',
        click: function (_, focusWindow) {
            focusWindow.reload()
        }
    }));
    menu.popup({
        window: this,
        x: params.x,
        y: params.y
    });
}
