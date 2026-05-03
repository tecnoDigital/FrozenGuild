#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const PORT = process.argv[2] || 8000;

async function killPort() {
  try {
    // Find the PID using the port
    // Exact match to avoid matching similar ports like 80001
    const portPattern = `:${PORT}\\b`;
    const { stdout } = await execAsync(`netstat -ano | findstr /R "${portPattern}"`);

    if (stdout) {
      // Parse the first line to get the PID
      const lines = stdout.trim().split('\n');
      const listeningLine = lines.find((line) => line.includes('LISTENING'));

      if (listeningLine) {
        const parts = listeningLine.trim().split(/\s+/);
        const pid = parts[parts.length - 1];

        if (pid && pid !== '0') {
          console.log(`[cleanup] Killing process ${pid} using port ${PORT}...`);

          try {
            await execAsync(`taskkill /PID ${pid} /F`);
            console.log(`[cleanup] Process ${pid} terminated successfully`);
          } catch {
            console.log(
              `[cleanup] Could not kill process ${pid} (may have already exited)`
            );
          }
        }
      }
    } else {
      console.log(`[cleanup] Port ${PORT} is free`);
    }
  } catch {
    // Port is free or netstat failed
    console.log(`[cleanup] Port ${PORT} is available`);
  }
}

await killPort();