import { execFile } from "node:child_process";

export interface WindowInfo {
  windowId: number;
  appName: string;
  windowTitle: string;
  pid: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

const SWIFT_CODE = `
import CoreGraphics
import Foundation

let windowList = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as? [[String: Any]] ?? []

var results: [[String: Any]] = []
for window in windowList {
    guard let layer = window[kCGWindowLayer as String] as? Int, layer == 0 else { continue }
    guard let windowId = window[kCGWindowNumber as String] as? Int else { continue }
    let appName = window[kCGWindowOwnerName as String] as? String ?? ""
    let windowTitle = window[kCGWindowName as String] as? String ?? ""
    let pid = window[kCGWindowOwnerPID as String] as? Int ?? 0
    let bounds = window[kCGWindowBounds as String] as? [String: Any] ?? [:]
    let x = bounds["X"] as? Double ?? 0
    let y = bounds["Y"] as? Double ?? 0
    let width = bounds["Width"] as? Double ?? 0
    let height = bounds["Height"] as? Double ?? 0
    results.append([
        "windowId": windowId,
        "appName": appName,
        "windowTitle": windowTitle,
        "pid": pid,
        "x": x,
        "y": y,
        "width": width,
        "height": height
    ])
}

let json = try! JSONSerialization.data(withJSONObject: results, options: [.prettyPrinted, .sortedKeys])
print(String(data: json, encoding: .utf8)!)
`;

export async function listWindows(appNameFilter?: string): Promise<WindowInfo[]> {
  return new Promise((resolve, reject) => {
    execFile("swift", ["-e", SWIFT_CODE], { timeout: 5000 }, (error, stdout, stderr) => {
      if (error) {
        if (stderr.includes("CGWindowListCopyWindowInfo") || stdout.trim() === "[]" || stdout.trim() === "") {
          reject(new Error(
            "Screen Recording permission is required. Go to System Settings > Privacy & Security > Screen & System Audio Recording and enable your terminal app."
          ));
          return;
        }
        reject(new Error(`Window enumeration failed: ${stderr || error.message}`));
        return;
      }

      try {
        const windows: WindowInfo[] = JSON.parse(stdout);
        if (appNameFilter) {
          const filter = appNameFilter.toLowerCase();
          resolve(windows.filter((w) => w.appName.toLowerCase().includes(filter)));
        } else {
          resolve(windows);
        }
      } catch (e) {
        reject(new Error(`Failed to parse window list: ${stdout}`));
      }
    });
  });
}
