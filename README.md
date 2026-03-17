# @prosperity-solutions/mcp-server-screenshot

[![npm](https://img.shields.io/npm/v/@prosperity-solutions/mcp-server-screenshot)](https://www.npmjs.com/package/@prosperity-solutions/mcp-server-screenshot)
[![license](https://img.shields.io/npm/l/@prosperity-solutions/mcp-server-screenshot)](LICENSE)

Native macOS screenshot capture for AI assistants.

An [MCP](https://modelcontextprotocol.io/) server that gives AI assistants the ability to capture screenshots on macOS using the native `screencapture` command.

## Features

- **list_windows** — List all visible windows with app name, title, ID, and bounds
- **screenshot_window** — Capture a specific window by ID or app name
- **screenshot_screen** — Capture an entire display
- **screenshot_region** — Capture a rectangular region by coordinates
- **request_screenshot** — Interactive crosshair selector for user-driven capture
- **set_confirmation_mode** — Toggle native Allow/Deny dialog before each capture

## Prerequisites

- **macOS** (uses the native `screencapture` command)
- **Node.js** >= 24
- **Screen Recording permission** — Grant permission to your terminal app in:
  System Settings → Privacy & Security → Screen Recording

## Quick Start

### Claude Desktop

Add to your `claude_desktop_config.json`:

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

### Claude Code

```bash
claude mcp add screenshot -- npx -y @prosperity-solutions/mcp-server-screenshot
```

## Tools

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `list_windows` | List visible windows | `app_name?` — filter by app name |
| `screenshot_window` | Capture a window | `window_id?`, `app_name?`, `format?` |
| `screenshot_screen` | Capture a display | `display?` (default: 1), `format?` |
| `screenshot_region` | Capture a region | `x`, `y`, `width`, `height`, `format?` |
| `request_screenshot` | Interactive selector | `format?` |
| `set_confirmation_mode` | Toggle confirmation | `enabled` (boolean) |

All capture tools support `format` (`"png"` or `"jpg"`, default `"png"`).

## Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `SCREENSHOT_MCP_CONFIRM` | `1` | Set to `0` to disable the native confirmation dialog |

Example with confirmation disabled:

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
