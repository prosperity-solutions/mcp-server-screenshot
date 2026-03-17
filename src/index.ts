import { createRequire } from "node:module";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { listWindows } from "./windows.js";
import { capture, type ImageFormat } from "./screenshot.js";
import { confirm } from "./confirm.js";

const require = createRequire(import.meta.url);
const { version } = require("../package.json") as { version: string };

const confirmationMode = process.env.SCREENSHOT_MCP_CONFIRM !== "0";

async function checkConfirmation(description: string): Promise<boolean> {
  if (!confirmationMode) return true;
  return confirm(`Screenshot MCP: Allow screenshot of ${description}?`);
}

const formatSchema = z.enum(["png", "jpg"]).optional().default("png");

const server = new McpServer({
  name: "screenshot",
  version,
});

// Tool 1: list_windows
server.tool(
  "list_windows",
  "List all visible windows with app name, window title, ID, and bounds",
  { app_name: z.string().optional().describe("Filter by app name (case-insensitive partial match)") },
  async ({ app_name }) => {
    try {
      const windows = await listWindows(app_name);
      if (windows.length === 0) {
        return {
          content: [{ type: "text", text: app_name ? `No windows found matching "${app_name}"` : "No visible windows found" }],
        };
      }
      const formatted = windows
        .map((w) => `[${w.windowId}] ${w.appName} — "${w.windowTitle}" (${w.width}×${w.height} at ${w.x},${w.y})`)
        .join("\n");
      return {
        content: [{ type: "text", text: formatted }],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

// Tool 2: screenshot_window
server.tool(
  "screenshot_window",
  "Capture a specific window by ID or app name. Respects confirmation mode.",
  {
    window_id: z.number().optional().describe("Window ID from list_windows"),
    app_name: z.string().optional().describe("App name (case-insensitive partial match)"),
    format: formatSchema.describe("Image format: png or jpg"),
  },
  async ({ window_id, app_name, format }) => {
    if (!window_id && !app_name) {
      return { content: [{ type: "text", text: "Error: Provide either window_id or app_name" }], isError: true };
    }

    try {
      let targetId = window_id;
      let description = `window ${window_id}`;

      if (!targetId) {
        const windows = await listWindows(app_name);
        if (windows.length === 0) {
          const allWindows = await listWindows();
          const appNames = [...new Set(allWindows.map((w) => w.appName))].join(", ");
          return {
            content: [{ type: "text", text: `No window found matching "${app_name}". Available apps: ${appNames}` }],
            isError: true,
          };
        }
        targetId = windows[0].windowId;
        description = `${windows[0].appName} — "${windows[0].windowTitle}"`;
      }

      const allowed = await checkConfirmation(description);
      if (!allowed) {
        return { content: [{ type: "text", text: "User denied screenshot request" }] };
      }

      const result = await capture(["-x", "-o", "-l", String(targetId)], format as ImageFormat);
      if (!result) {
        return { content: [{ type: "text", text: "Screenshot failed — no output produced" }], isError: true };
      }

      return {
        content: [
          { type: "image", data: result.data, mimeType: result.mimeType },
          { type: "text", text: `Screenshot of ${description}` },
        ],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

// Tool 3: screenshot_screen
server.tool(
  "screenshot_screen",
  "Capture entire screen or a specific display. Respects confirmation mode.",
  {
    display: z.number().optional().default(1).describe("Display number (default: 1)"),
    format: formatSchema.describe("Image format: png or jpg"),
  },
  async ({ display, format }) => {
    try {
      const allowed = await checkConfirmation(`display ${display}`);
      if (!allowed) {
        return { content: [{ type: "text", text: "User denied screenshot request" }] };
      }

      const result = await capture(["-x", "-D", String(display)], format as ImageFormat);
      if (!result) {
        return { content: [{ type: "text", text: "Screenshot failed — no output produced" }], isError: true };
      }

      return {
        content: [
          { type: "image", data: result.data, mimeType: result.mimeType },
          { type: "text", text: `Screenshot of display ${display}` },
        ],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

// Tool 4: screenshot_region
server.tool(
  "screenshot_region",
  "Capture a specific rectangular region of the screen. Respects confirmation mode.",
  {
    x: z.number().describe("X coordinate of top-left corner"),
    y: z.number().describe("Y coordinate of top-left corner"),
    width: z.number().describe("Width in pixels"),
    height: z.number().describe("Height in pixels"),
    format: formatSchema.describe("Image format: png or jpg"),
  },
  async ({ x, y, width, height, format }) => {
    try {
      const description = `region (${x},${y} ${width}×${height})`;
      const allowed = await checkConfirmation(description);
      if (!allowed) {
        return { content: [{ type: "text", text: "User denied screenshot request" }] };
      }

      const result = await capture(["-x", "-R", `${x},${y},${width},${height}`], format as ImageFormat);
      if (!result) {
        return { content: [{ type: "text", text: "Screenshot failed — no output produced" }], isError: true };
      }

      return {
        content: [
          { type: "image", data: result.data, mimeType: result.mimeType },
          { type: "text", text: `Screenshot of ${description}` },
        ],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

// Tool 5: request_screenshot
server.tool(
  "request_screenshot",
  "Interactive mode: shows macOS crosshair selector for user to pick what to capture. No confirmation needed.",
  {
    format: formatSchema.describe("Image format: png or jpg"),
  },
  async ({ format }) => {
    try {
      const result = await capture(["-i", "-x"], format as ImageFormat);
      if (!result) {
        return { content: [{ type: "text", text: "User cancelled screenshot" }] };
      }

      return {
        content: [
          { type: "image", data: result.data, mimeType: result.mimeType },
          { type: "text", text: "User-selected screenshot" },
        ],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
