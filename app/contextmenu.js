const {app, BrowserWindow,Menu,MenuItem, Tray,shell,clipboard,dialog,Notification} = require('electron');
function contextMenu(event,params) {
    const menu = new Menu();
    if(params.isEditable) {
        menu.append(new MenuItem({label:'undo', role: 'undo' }));
        menu.append(new MenuItem({label:'redo', role: 'redo' }));
        // menu.append(new MenuItem({ role: 'separator' }));
        menu.append(new MenuItem({label:'cut', role: 'cut' }));
        menu.append(new MenuItem({label:'paste', role: 'paste' }));
        // menu.append(new MenuItem({ role: 'pasteandmatchstyle' }));
        menu.append(new MenuItem({label:'delete', role: 'delete' }));
    }
    if(params.linkURL){
        let linkURL = params.linkURL;
        let linkText = params.linkText;
        menu.append(new MenuItem({
                label: "copy link address",
                click: function (_,focusWindow) {
                    clipboard.writeText(linkURL);
                }
            }
        ));
        menu.append(new MenuItem({
            label:"copy link Text",
                click:function () {
            clipboard.writeText(linkText);
            // new Notification({
            //     title: "copy",
            //     body: "copy TEXT: " + linkText
            // }).show();
        }
        }))
    }

    if(params.selectionText) {
        menu.append(new MenuItem({
            label: 'copy',
            // role: 'copy',
            click: function (_, focusWindow) {
                focusWindow.webContents.copy();
                new Notification({
                    title: "copy",
                    body: "copy TEXT: " + params.selectionText
                }).show();
            }
        }));
    }
    menu.append(new MenuItem({
        label:'copy this page URL',
        click:function (_,focusWindow) {
            clipboard.writeText(focusWindow.webContents.getURL());
            // new Notification({
            //     title: "copy",
            //     body: "copy TEXT: " + focusWindow.webContents.getURL()
            // }).show();
        }
    }));
    menu.append(new MenuItem({ label:'select all', role: 'selectall' }));
    menu.append(new MenuItem({
        label:'refresh',
        click:function (_,focusWindow) {
            focusWindow.reload()
        }
    }));
    menu.popup(this, params.x, params.y);
}

exports.contextMenu=contextMenu;