import { app, BrowserWindow, Tray, shell, Menu } from "electron";
import * as path from "path";
import * as fs from "fs";
import { iconPath, windowOption, preloadJS } from "./window/window";
import { contextMenu } from "./window/contextmenu";

let mainWindow: BrowserWindow = null;
let tray: Tray = null;

const getTheLock = app.requestSingleInstanceLock();
if (!getTheLock) {
  app.quit();
} else {
  start();
}

function start() {
  app.on("second-instance", () => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });


  // https://newsn.net/say/electron-second-instance.html
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.

  app.whenReady().then(() => {
    createWindow();
    createMenu();
    createTray();
  })

  app.on('web-contents-created', (_, webContent) => {
    webContent.on("context-menu", (event, params) => contextMenu(event, params));
    webContent.on('dom-ready', () => {
      const scrollBarCSS = fs.readFileSync(path.join(__dirname, './css/scrollbar.css')).toString();
      webContent.insertCSS(scrollBarCSS).then();
    });
  });
  app.on('browser-window-created', (_, browserWindow) => {
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
    width: 1200,
    height: 700,
    icon: iconPath,
    webPreferences: {
      preload: preloadJS,
      nativeWindowOpen: true,
    },
  });

  mainWindow.webContents.setUserAgent('Chrome');
  mainWindow.webContents.setWindowOpenHandler(() => {
    return {
      action: "allow",
      overrideBrowserWindowOptions: windowOption
    }
  })

  // and load the index.html of the app.
  mainWindow.loadURL('https://feedly.com/i/latest').then();
  // Open the DevTools.
  // mainWindow.webContents.openDevTools();


  mainWindow.on('close', (e) => {
    e.preventDefault();
    mainWindow.hide();
  })
}

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
const createTray = () => {
  // Tray Icon
  tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([{
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
  }]);
  tray.setToolTip('feedly');
  tray.setContextMenu(contextMenu);
}

function createMenu() {
  // Application Menu
  const menu = Menu.buildFromTemplate([{
    label: 'feedly',
    submenu: [{
      label: 'Home',
      accelerator: 'Alt+Home',
      click: function () {
        for (const childWindow of mainWindow.getChildWindows()) {
          childWindow.destroy()
        }
        mainWindow.loadURL('https://feedly.com/i/latest', { userAgent: 'Chrome' }).then()
      }
    }, {
      label: 'Minimize',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize'
    }, {
      label: 'Exit',
      accelerator: 'CmdOrCtrl+W',
      click: function () {
        mainWindow.destroy()
      }
    }]
  },
  {
    label: 'View',
    submenu: [{
      label: 'Reload',
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
    }, {
      label: 'Go Forward',
      accelerator: 'Alt+Right',
      click: function (_, focusedWindow) {
        focusedWindow.webContents.goForward()
      }
    }, {
      label: 'Go Back',
      accelerator: 'Alt+Left',
      click: function (_, focusedWindow) {
        focusedWindow.webContents.goBack()
      }
    }]
  }, {
    label: 'about',
    submenu: [{
      label: 'github',
      click: function () {
        shell.openExternal('https://github.com/Asutorufa/electron-feedly').then()
      }
    }, {
      label: 'author: Asutorufa',
      click: function () {
        shell.openExternal('https://github.com/Asutorufa').then()
      }
    }, {
      label: 'version: 1.0.0'
    }

    ]
  }
  ]);
  Menu.setApplicationMenu(menu);
}