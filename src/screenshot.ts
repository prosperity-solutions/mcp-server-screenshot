import { execFile } from "node:child_process";
import { readFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";

export type ImageFormat = "png" | "jpg";

export interface CaptureResult {
  data: string; // base64
  mimeType: "image/png" | "image/jpeg";
}

function mimeType(format: ImageFormat): "image/png" | "image/jpeg" {
  return format === "jpg" ? "image/jpeg" : "image/png";
}

/**
 * Run screencapture with the given args, read the result as base64.
 * Returns null if the user cancelled (no file produced).
 */
export async function capture(
  args: string[],
  format: ImageFormat = "png"
): Promise<CaptureResult | null> {
  const tmpFile = join(tmpdir(), `screenshot-mcp-${randomUUID()}.${format}`);
  const fullArgs = [...args, "-t", format, tmpFile];

  try {
    await new Promise<void>((resolve, reject) => {
      execFile("screencapture", fullArgs, { timeout: 10000 }, (error) => {
        if (error) {
          reject(new Error(`screencapture failed: ${error.message}`));
          return;
        }
        resolve();
      });
    });

    // Check if file was created (user may have cancelled interactive mode)
    if (!existsSync(tmpFile)) {
      return null;
    }

    const buffer = await readFile(tmpFile);
    if (buffer.length === 0) {
      throw new Error(
        "Screenshot produced empty file. Screen Recording permission may be missing. Go to System Settings > Privacy & Security > Screen & System Audio Recording."
      );
    }

    return {
      data: buffer.toString("base64"),
      mimeType: mimeType(format),
    };
  } finally {
    try {
      await unlink(tmpFile);
    } catch {
      // File may not exist if user cancelled
    }
  }
}
