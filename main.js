// Modules to control application life and create native browser window
const {app, BrowserWindow,Menu,Tray,shell,Notification} = require('electron');
const path = require('path');
const fs = require('fs');


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    app.quit()
  } else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        if(!mainWindow.isVisible()) mainWindow.show();
        mainWindow.focus()
      }
    });

    // https://newsn.net/say/electron-second-instance.html
    new Notification({
      title:"welcome",
      body:"organize, read and share what matters to you."
    }).show();
    app.on('ready', createWindow)
  }
  // Create the browser window.
  mainWindow = new BrowserWindow({
    // transparent: true,
    // frame: false,
    width: 1200,
    height: 700,
    icon: path.join(__dirname, 'build/icons/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      nativeWindowOpen: true
    }
  });
  mainWindow.webContents.on("context-menu",(event,params) =>
      require('./app/contextmenu').contextMenu(event,params));


  // and load the index.html of the app.
  mainWindow.loadURL('https://feedly.com/i/latest').then();
  mainWindow.webContents.on("did-finish-load", function() {
    // let scrollBarCSS = fs.readFileSync(path.join(__dirname,'./css/scrollbar.css')).toString();
    // mainWindow.webContents.insertCSS(scrollBarCSS)
    const scrollBarJS = fs.readFileSync(path.join(__dirname, './js/scrollbar.js')).toString();
    mainWindow.webContents.executeJavaScript(scrollBarJS).then();
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  });

  // https://newsn.net/say/electron-browserwindow-size.html
  mainWindow.webContents.on('new-window',function(event, url, frameName, disposition, options){
    // console.log(fname,url,disposition);
    // if((!url.match("feedly.com\\/v3\\/auth\\/auth\\?client\\_id=feedly.*&mode=login")) && (!url.match("login-callback"))) {
      event.preventDefault();
      let childWindow = new BrowserWindow({
        // transparent: true,
        width: 1100,
        height: 700,
        webContents: options.webContents, // use existing webContents if provided
        webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
          nodeIntegration:true,
        },
        // parent: mainWindow,
        // modal: true,
        // maximizable: false,
        // maxHeight: 600,
        // maxWidth:1200
      });
      childWindow.webContents.on("context-menu",(event,params) =>
          require('./app/contextmenu').contextMenu(event,params));

      childWindow.once('ready-to-show', () => {
        childWindow.show()
      });
      if (!options.webContents) {
        childWindow.loadURL(url).then() // existing webContents will be navigated automatically
      }
      childWindow.webContents.on("did-finish-load", ()=> {
        // let scrollBarCSS = fs.readFileSync(path.join(__dirname,'./css/scrollbar.css')).toString();
        // childWindow.webContents.insertCSS(scrollBarCSS);
        const scrollBarJS = fs.readFileSync(path.join(__dirname, './js/scrollbar.js')).toString();
        childWindow.webContents.executeJavaScript(scrollBarJS).then();
      });

      event.newGuest = childWindow;
    // }
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  mainWindow.on('close',function (event) {
    event.preventDefault();
    mainWindow.hide();
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

let tray = null;
app.on('ready', ()=>{
  // Tray Icon
  tray = new Tray(path.join(__dirname, 'build/icons/feedly.png'));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'show',
      click: function () {
        if (!mainWindow.isVisible()) {
          mainWindow.show();
        }
        mainWindow.focus()
      }
    }, {
      label: 'exit',
      click: function () {
        mainWindow.destroy();
      }
    }
  ]);
  tray.setToolTip('feedly');
  tray.setContextMenu(contextMenu);

  // Application Menu
  let menu = Menu.buildFromTemplate([
    {
      label: 'feedly',
      submenu: [
        {
          label:'home',
          accelerator: 'Alt+Home',
          click:function () {
            for(let childWindow of mainWindow.getChildWindows()){
              childWindow.destroy()
            }
            mainWindow.loadURL('https://feedly.com/i/latest').then()
          }
        }, {
          label: 'minimize',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        }, {
          label: 'exit',
          accelerator: 'CmdOrCtrl+W',
          click: function () {
            mainWindow.destroy()
          }
        }
      ]
    },
    {
      label:'View',
      submenu: [
        { label: 'reload',
          accelerator: 'CmdOrCtrl+R',
          click: function (_, focusedWindow) {
            if (focusedWindow) {
              if (focusedWindow.id === 1) {
                BrowserWindow.getAllWindows().forEach(function (win) {
                  if (win.id > 1) {
                    win.close()
                  }
                })
              }
              focusedWindow.reload()
            }
          }
        },{
          label:'go forward',
          accelerator: 'Alt+Right',
          click:function (_,focusedWindow) {
            focusedWindow.webContents.goForward()
          }
        },{
          label:'go back',
          accelerator: 'Alt+Left',
          click:function (_,focusedWindow) {
            focusedWindow.webContents.goBack()
          }
        }
      ]
    }, {
      label: 'about',
      submenu: [
        {
          label: 'github',
          click: function (){
            shell.openExternal('https://github.com/Asutorufa/electron-feedly').then()
          }
        },{
          label: 'author: Asutorufa',
          click: function () {
            shell.openExternal('https://github.com/Asutorufa').then()
          }
        },{
          label: 'version: 1.0.0'
        }

      ]
    }
  ]);
  Menu.setApplicationMenu(menu);
});
app.on('ready',createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
});

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.