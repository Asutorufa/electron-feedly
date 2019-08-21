const { Menu, MenuItem,  BrowserWindow,clipboard,  Notification,shell,nativeImage} = require('electron');

function contextMenu(event, params) {
    const menu = new Menu();
    if (params.isEditable) {
        menu.append(new MenuItem({label: 'undo', role: 'undo'}));
        menu.append(new MenuItem({label: 'redo', role: 'redo'}));
        menu.append(new MenuItem({label: 'cut', role: 'cut'}));
        menu.append(new MenuItem({label: 'paste', role: 'paste'}));
        // menu.append(new MenuItem({ role: 'pasteandmatchstyle' }));
        menu.append(new MenuItem({label: 'delete', role: 'delete'}));
    }

    if (params.srcURL) {
        if (params.hasImageContents) {
            menu.append(new MenuItem({
                label: "view image",
                click: () => {
                    new BrowserWindow({
                        width: 500,
                        height: 480,
                        webPreferences: {
                            preload: require('path').join(__dirname, 'preload.js'),
                            // nodeIntegration: true,
                            nativeWindowOpen: true
                        },
                        title: 'view media'
                    }).loadURL(params.srcURL).then();
                }
            }));
            menu.append(new MenuItem({
                label: 'copy image',
                click: (_, focusWindow) => {
                    focusWindow.webContents.copyImageAt(params.x, params.y);
                    // const request = require('request').defaults({encoding: null});
                    // request.get(params.srcURL, function (error, response, body) {
                    //     // https://stackoverflow.com/questions/17124053/node-js-get-image-from-web-and-encode-with-base64
                    //     let imageData;
                    //     if (!error && response.statusCode === 200) {
                    //         imageData = "data:" + response.headers["content-type"] +
                    //             ";base64," + new Buffer(body).toString('base64');
                    //         clipboard.writeImage(nativeImage.createFromDataURL(imageData));
                    //     }
                    // });
                }
            }));
            menu.append(new MenuItem({
                label: "copy image link",
                click: () => {
                    console.log(params.srcURL);
                    clipboard.writeText(params.srcURL);
                }
            }));
        }else{
            menu.append(new MenuItem({
                label: "copy media link",
                click: () => {
                    console.log(params.srcURL);
                    clipboard.writeText(params.srcURL);
                }
            }));
            menu.append(new MenuItem({
                label: "download media",
                click: (_, focusWindow) => {
                    focusWindow.loadURL(params.srcURL);
                }
            }));
        }
    }

    if (params.linkURL) {
        let linkURL = params.linkURL;
        let linkText = params.linkText;
        menu.append(new MenuItem({
           label:"open the link at External Browser",
           click:function () {
               shell.openExternal(linkURL).then();
           }
        }));
        menu.append(new MenuItem({
                label: "copy link address",
                click: function () {
                    clipboard.writeText(linkURL);
                }
            }
        ));
        menu.append(new MenuItem({
            label: "copy link Text",
            click: function () {
                clipboard.writeText(linkText);
            }
        }))
    }

    if (params.selectionText) {
        menu.append(new MenuItem({
            label: 'copy',
            role: 'copy'
        }));
        menu.append(new MenuItem({
            label: 'search from google',
            click:()=>{
                new BrowserWindow({
                    // transparent: true,
                    // frame: false,
                    width: 1200,
                    height: 700,
                    webPreferences: {
                        preload: require('path').join(__dirname, 'preload.js'),
                        // nodeIntegration: true,
                        nativeWindowOpen: true
                    }
                }).loadURL("https://www.google.com/search?q=" + params.selectionText).then();
            }
        }))
    }

    if(BrowserWindow.getFocusedWindow().webContents.canGoForward()){
        menu.append(new MenuItem({
            label: 'go forward',
            accelerator: 'Alt+Right',
            click: function (_, focusedWindow) {
                focusedWindow.webContents.goForward()
            }
        }));
    }
    if(BrowserWindow.getFocusedWindow().webContents.canGoBack()) {
        menu.append(new MenuItem({
            label: 'go back',
            accelerator: 'Alt+Left',
            click: function (_, focusedWindow) {
                focusedWindow.webContents.goBack()
            }
        }));
    }
    
    menu.append(new MenuItem({
        label: 'copy this page URL',
        click: function (_, focusWindow) {
            clipboard.writeText(focusWindow.webContents.getURL());
        }
    }));
    menu.append(new MenuItem({label: 'select all', role: 'selectall'}));
    menu.append(new MenuItem({
        label: 'refresh',
        click: function (_, focusWindow) {
            focusWindow.reload()
        }
    }));
    menu.popup({
        window:this,
        x:params.x,
        y:params.y
    });
}

exports.contextMenu = contextMenu;