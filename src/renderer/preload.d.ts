import { Stats } from 'fs';
import { Channels } from 'main/preload';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        sendMessage(channel: Channels, args: unknown[]): void;
        on(
          channel: Channels,
          func: (...args: unknown[]) => void
        ): (() => void) | undefined;
        once(channel: Channels, func: (...args: unknown[]) => void): void;
      };
    };
    fs: {
      watchFile: (
        path: string,
        listener: (curr: Stats, prev: Stats) => void,
        options?: { persistent: boolean; interval: number }
      ) => void;
      readFileSync: (path: string, options?: { encoding: string }) => string;
    };
    path: {
      join: (...paths: string[]) => string;
    };
  }
}

export {};
