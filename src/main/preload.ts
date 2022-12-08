import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { spawn } from 'child_process';
import { join } from 'path';

// Check if python is installed
const python = spawn('python', ['-V']);
var hasStarted = false;

// var dataPath = '';

// // calling IPC exposed from preload script
// ipcRenderer.once('data-path', (event: IpcRendererEvent, path: any) => {
//   dataPath = path;
// });
// ipcRenderer.send('data-path', ['send-data']);

function startServer() {
  // Start the server
  if (hasStarted) return;

  const server = spawn('python', [join(process.cwd(), 'python', 'main.py')], {
    detached: true,
  });
  server.unref();

  server.stderr.on('data', (data) => {
    ipcRenderer.send('server-crashed', data.toString());
    hasStarted = false;
    startServer();
  });

  server.on('close', (code) => {
    ipcRenderer.send('server-crashed', 'Server closed');
    hasStarted = false;
    startServer();
  });
  
  hasStarted = true;
}

python.stdout.on('data', (data) => {
  // If python is not installed, alert the user to install it
  if (data.toString().includes('not recognized')) {
    // Send a message to the renderer process
    // Wait until the renderer process is ready

    ipcRenderer.send('python-not-installed');
  } else {
    // If python is installed, install the required packages
    const install = spawn('pip', [
      'install',
      '-r',
      join(process.cwd(), 'python', 'requirements.txt'),
    ]);

    install.stdout.on('close', startServer);
  }
});

window.path = require('path');

window.fs = require('fs');
