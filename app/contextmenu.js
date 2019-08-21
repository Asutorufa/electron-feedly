const { Menu, MenuItem,  clipboard,  Notification,shell} = require('electron');

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

    menu.append(new MenuItem({
        label: 'go forward',
        accelerator: 'Alt+Right',
        click: function (_, focusedWindow) {
            if (focusedWindow.webContents.canGoForward()) focusedWindow.webContents.goForward()
        }
    }));


    menu.append(new MenuItem({
        label: 'go back',
        accelerator: 'Alt+Left',
        click: function (_, focusedWindow) {
            if (focusedWindow.webContents.canGoBack()) focusedWindow.webContents.goBack()
        }
    }));

    if (params.selectionText) {
        menu.append(new MenuItem({
            label: 'copy',
            role: 'copy'
            // click: function (_, focusWindow) {
            //     focusWindow.webContents.copy();
            //     // new Notification({
            //     //     title: "copy",
            //     //     body: "copy TEXT: " + params.selectionText
            //     // }).show();
            // }
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