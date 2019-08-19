// Modules to control application life and create native browser window
const {app, BrowserWindow,Menu, Tray} = require('electron');
const path = require('path');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    // transparent: true,
    // frame: false,
    width: 1200,
    height: 700,
    icon: path.join(__dirname, 'build/icons/'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false
    }
  });


  // and load the index.html of the app.
  // mainWindow.loadFile('index.html')
  mainWindow.loadURL('https://feedly.com/i/latest');

  // https://newsn.net/say/electron-browserwindow-size.html
  // mainWindow.webContents.on('new-window',function(event, url, fname, disposition, options){
  //   let childWindow = new BrowserWindow({
  //     width:1100,
  //     height:700,
  //     // webPreferences: {
  //     //   // preload: path.join(__dirname, 'preload.js'),
  //     //   nodeIntegration:false
  //     // },
  //     // parent: mainWindow
  //   });
  //   childWindow.loadURL(url);
  //   event.preventDefault();
  // });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  mainWindow.on('close',function (event) {
    event.preventDefault();
    mainWindow.hide();
  });

  // mainWindow.on('focus',function () {
  //   for(let childWindow of mainWindow.getChildWindows()){
  //     childWindow.destroy()
  //   }
  // });

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
  tray = new Tray(path.join(__dirname, 'build/icons/feedly.png'));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'show',
      click: function () {
        if (!mainWindow.isVisible()) {
          mainWindow.show();
        }
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
