"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForOutput = exports.cleanupProcesses = exports.execAsync = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/utils/test-helpers.ts
const child_process_1 = require("child_process");
const util_1 = require("util");
exports.execAsync = (0, util_1.promisify)(child_process_1.exec);
const cleanupProcesses = async () => {
    try {
        if (process.platform === 'win32') {
            await (0, exports.execAsync)('taskkill /F /IM node.exe /T', { windowsHide: true }).catch(() => { });
        }
        else {
            await (0, exports.execAsync)('pkill -f node', { windowsHide: true }).catch(() => { });
        }
    }
    catch (_) {
        // Ignore cleanup errors
    }
};
exports.cleanupProcesses = cleanupProcesses;
const waitForOutput = async (process, expectedOutput, timeout = 5000) => {
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
        process.stdout.on('data', (data) => {
            output += data;
            if (output.includes(expectedOutput)) {
                clearTimeout(timer);
                resolve(output);
            }
        });
        process.stderr.on('data', (data) => {
            console.error(`Error: ${data}`);
        });
    });
};
exports.waitForOutput = waitForOutput;
