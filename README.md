# @prosperity-solutions/mcp-server-screenshot

[![npm](https://img.shields.io/npm/v/@prosperity-solutions/mcp-server-screenshot)](https://www.npmjs.com/package/@prosperity-solutions/mcp-server-screenshot)
[![license](https://img.shields.io/npm/l/@prosperity-solutions/mcp-server-screenshot)](LICENSE)

Native macOS screenshot capture for AI assistants.

An [MCP](https://modelcontextprotocol.io/) server that provides screenshot capture on macOS using the native `screencapture` command. Works with any MCP-compatible client.

## Features

- **list_windows** — List all visible windows with app name, title, ID, and bounds
- **screenshot_window** — Capture a specific window by ID or app name
- **screenshot_screen** — Capture an entire display
- **screenshot_region** — Capture a rectangular region by coordinates
- **request_screenshot** — Interactive crosshair selector for user-driven capture

## Prerequisites

- **macOS** (uses the native `screencapture` command)
- **Node.js** >= 24
- **Screen Recording permission** — Grant permission to your terminal app in:
  System Settings → Privacy & Security → Screen Recording

## Quick Start

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "screenshot": {
      "command": "npx",
      "args": ["-y", "@prosperity-solutions/mcp-server-screenshot"]
    }
  }
}
```

## Tools

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `list_windows` | List visible windows | `app_name?` — filter by app name |
| `screenshot_window` | Capture a window | `window_id?`, `app_name?`, `format?` |
| `screenshot_screen` | Capture a display | `display?` (default: 1), `format?` |
| `screenshot_region` | Capture a region | `x`, `y`, `width`, `height`, `format?` |
| `request_screenshot` | Interactive selector | `format?` |

All capture tools support `format` (`"png"` or `"jpg"`, default `"png"`).

## Security & Privacy

Screenshot capture is a sensitive operation — it can expose passwords, private messages, financial data, or anything else visible on screen. This server is designed with a clear trust boundary: **the user, not the agent, decides what gets shared.**

By default, every screenshot request triggers a **native macOS confirmation dialog** (Allow / Deny) before any pixels are captured. This dialog is rendered by the operating system, completely outside the agent's context — the agent cannot see it, dismiss it, or influence the outcome. You always know exactly what is being captured before it happens.

If you operate in a trusted environment (e.g., a dedicated machine, a sandboxed workflow, or an automated pipeline where no sensitive content is on screen), you can disable confirmation by setting the `SCREENSHOT_MCP_CONFIRM` environment variable to `0`. This is an environment-level setting, configured at server startup — it is intentionally not exposed as a tool, so an agent can never change it at runtime.

```json
{
  "mcpServers": {
    "screenshot": {
      "command": "npx",
      "args": ["-y", "@prosperity-solutions/mcp-server-screenshot"],
      "env": {
        "SCREENSHOT_MCP_CONFIRM": "0"
      }
    }
  }
}
```

## Development

```bash
git clone https://github.com/prosperity-solutions/mcp-server-screenshot.git
cd mcp-server-screenshot
npm install
npm run build
npm start
```

## License

[MIT](LICENSE)
