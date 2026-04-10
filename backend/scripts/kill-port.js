#!/usr/bin/env node

import { execSync } from "child_process";
import { platform } from "os";

const port = process.argv[2];

if (!port) {
  console.error("Usage: node kill-port.js <port>");
  process.exit(1);
}

try {
  if (platform() === "win32") {
    // Windows: Use netstat and taskkill
    try {
      const output = execSync(`netstat -ano | findstr :${port}`, {
        encoding: "utf8",
      });
      const lines = output.trim().split("\n");

      for (const line of lines) {
        if (line.includes("LISTENING")) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];

          if (pid && pid !== "0") {
            try {
              execSync(`taskkill /PID ${pid} /F`, { stdio: "inherit" });
              console.log(`Killed process ${pid} using port ${port}`);
            } catch (killError) {
              console.log(
                `Could not kill process ${pid}: ${killError.message}`,
              );
            }
          }
        }
      }
    } catch (error) {
      // No processes found on this port, which is fine
      console.log(`No processes found using port ${port}`);
    }
  } else {
    // Unix-like systems: Use lsof and kill
    try {
      const output = execSync(`lsof -ti:${port}`, { encoding: "utf8" });
      const pids = output
        .trim()
        .split("\n")
        .filter((pid) => pid);

      for (const pid of pids) {
        try {
          execSync(`kill -9 ${pid}`, { stdio: "inherit" });
          console.log(`Killed process ${pid} using port ${port}`);
        } catch (killError) {
          console.log(`Could not kill process ${pid}: ${killError.message}`);
        }
      }
    } catch (error) {
      // No processes found on this port, which is fine
      console.log(`No processes found using port ${port}`);
    }
  }
} catch (error) {
  console.error(`Error checking port ${port}:`, error.message);
}
