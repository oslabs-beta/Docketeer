'use strict';
import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { format as formatUrl } from 'url';
import installExtension, { REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

import verifyCode from './twilio/verifyCode';
import verifyMobileNumber from './twilio/verifyMobile';
import postEvent from './twilio/postEvent';

const isDevelopment = process.env.NODE_ENV !== 'production';

// global reference to mainWindow (necessary to prevent window from being garbage collected)

let mainWindow;

function createMainWindow() {
  const window = new BrowserWindow({
    width: 1300,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      allowRendererProcessReuse: false,
    },
  });

  if (isDevelopment) {
    window.webContents.openDevTools();
  }

  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
  } else {
    window.loadURL(
      formatUrl({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true,
      })
    );
  }

  window.on('closed', () => {
    mainWindow = null;
  });

  window.webContents.on('devtools-opened', () => {
    window.focus();
    setImmediate(() => {
      window.focus();
    });
  });

  return window;
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow();
  }
});

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  // server;
  mainWindow = createMainWindow();
});

// comment out lines 79-83 if dev tools is slowing app
app.whenReady().then(() => {
  installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS])
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));
});
// if (module.hot) {
//   module.hot.accept();
// }

ipcMain.handle('verify-number', async (_, args) => {
  return await verifyMobileNumber(args);
});

ipcMain.handle('verify-code', async (_, args) => {
  return await verifyCode(args);
});

ipcMain.handle('post-event', async (_, args) => {
  const { mobileNumber, triggeringEvent } = args;
  return await postEvent(mobileNumber, triggeringEvent);
});

