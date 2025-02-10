/* eslint-disable @typescript-eslint/no-unused-vars */
// src/utils/test-helpers.ts
import { exec, ChildProcess } from 'child_process';
import { promisify } from 'util';

export const execAsync = promisify(exec);

export const cleanupProcesses = async () => {
  try {
    if (process.platform === 'win32') {
      await execAsync('taskkill /F /IM node.exe /T', { windowsHide: true }).catch(() => {});
    } else {
      await execAsync('pkill -f node', { windowsHide: true }).catch(() => {});
    }
  } catch (_) {
    // Ignore cleanup errors
  }
};

export const waitForOutput = async (process: ChildProcess, expectedOutput: string, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    let output = '';
    const timer = setTimeout(() => {
      process.kill();
      reject(new Error(`Timeout waiting for output: ${expectedOutput}`));
    }, timeout);

    if (!process.stdout || !process.stderr) {
      clearTimeout(timer);
      reject(new Error('Process streams are not available'));
      return;
    }

    process.stdout.on('data', (data: string) => {
      output += data;
      if (output.includes(expectedOutput)) {
        clearTimeout(timer);
        resolve(output);
      }
    });

    process.stderr.on('data', (data: string) => {
      console.error(`Error: ${data}`);
    });
  });
};