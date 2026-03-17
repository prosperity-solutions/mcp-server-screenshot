import { execFile } from "node:child_process";

/**
 * Show a native macOS confirmation dialog via osascript.
 * Returns true if user clicked Allow, false if Deny/cancelled.
 */
export async function confirm(message: string): Promise<boolean> {
  const script = `display dialog ${JSON.stringify(message)} buttons {"Deny", "Allow"} default button "Allow" with title "Screenshot MCP"`;

  return new Promise((resolve) => {
    const proc = execFile("osascript", ["-e", script], { timeout: 30000 }, (error, stdout) => {
      if (error) {
        // User clicked Deny or closed the dialog
        resolve(false);
        return;
      }
      resolve(stdout.includes("Allow"));
    });
  });
}
