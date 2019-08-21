// Modules to control application life and create native browser window
const {app, BrowserWindow,Menu,Tray,shell,Notification,dialog} = require('electron');
const path = require('path');
const fs = require('fs');


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;
let tray = null;

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
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready',createMenu);
  app.on('ready', createWindow);
  app.on('web-contents-created',(_,webContent)=>{
    webContent.on("context-menu",(event,params) => require('./app/contextmenu').contextMenu(event,params));
    webContent.on('dom-ready',()=>{
      let scrollBarCSS = fs.readFileSync(path.join(__dirname,'./css/scrollbar.css')).toString();
      webContent.insertCSS(scrollBarCSS);
    });
  });
  app.on('browser-window-created',(_,browserWindow)=>{
    // let loadingWindow;
    // console.log(browserWindow.isModal());
    // if (browserWindow.isModal() !== true) {
    //   loadingWindow = new BrowserWindow({
    //     // transparent: true,
    //     // frame: false,
    //     width: 50,
    //     height: 50,
    //     webPreferences: {
    //       preload: path.join(__dirname, 'preload.js'),
    //       // nodeIntegration: true,
    //       nativeWindowOpen: true
    //     },
    //     parent: browserWindow,
    //     modal:true
    //   });
    //   loadingWindow.loadFile('index.html').then();
    //   loadingWindow.show();
    //   browserWindow.webContents.on("page-favicon-updated",()=>{
    //     console.log("frame finished");
    //     loadingWindow.destroy()
    //   })
    // }
    browserWindow.on('ready-to-show', () => {
      browserWindow.show()
    });

    // Emitted when the window is closed.
    browserWindow.on('closed', function () {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      browserWindow = null
    })
  });

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
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    // transparent: true,
    // frame: false,
    width: 1200,
    height: 700,
    icon: path.join(__dirname, 'build/icons/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // nodeIntegration: true,
      nativeWindowOpen: true
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL('https://feedly.com/i/latest').then();

  // https://newsn.net/say/electron-browserwindow-size.html
  mainWindow.webContents.on('new-window',function(event, url, frameName, disposition, options){
      event.preventDefault();
      let childWindow = new BrowserWindow({
        width: 1100,
        height: 700,
        webContents: options.webContents, // use existing webContents if provided
        webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
          nativeWindowOpen: true,
          // nodeIntegration:true,
        },
      });
      if (!options.webContents) {
        childWindow.loadURL(url).then() // existing webContents will be navigated automatically
      }
      event.newGuest = childWindow;
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  mainWindow.on('close',function (event) {
    event.preventDefault();
    mainWindow.hide();
  });
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

function createMenu() {
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
}