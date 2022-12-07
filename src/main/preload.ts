import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { spawn } from 'child_process';
import { join } from 'path';

export type Channels = 'ipc-example';

// Check if python is installed
const python = spawn('python', ['-V']);
var hasStarted = false;

function startServer() {
  // Start the server
  if (hasStarted) return;

  const server = spawn('python', [join(process.cwd(), 'python', 'main.py')], {
    detached: true,
  });
  server.unref();

  server.stderr.on('data', (data) => {
    console.error(data.toString());
    ipcRenderer.send('server-crashed');
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

window.electron = {
  ipcRenderer: {
    sendMessage(channel: Channels, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

window.path = require('path');

window.fs = require('fs');
