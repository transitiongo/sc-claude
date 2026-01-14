<p align="center">
  <a href="https://github.com/transitiongo/sc-claude/blob/main/README_CN.md">🇨🇳 中文</a> | <a href="https://github.com/transitiongo/sc-claude/blob/main/README.md">🇺🇸 English</a>
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/sc-claude?style=flat-square&color=00d4aa" alt="npm version" />
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-blue?style=flat-square" alt="platform" />
  <img src="https://img.shields.io/npm/l/sc-claude?style=flat-square" alt="license" />
</p>

<h1 align="center">
  <br>
  🔀 Switch Claude
  <br>
</h1>

<h4 align="center">Effortlessly switch between multiple Claude Code API configurations</h4>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-commands">Commands</a> •
  <a href="#-how-it-works">How It Works</a>
</p>

---

```
    ____         _ __       __       ________                __
   / __/      __(_) /______/ /_     / ____/ /___ ___  ______/ /__
   \__ \ | /| / / / __/ ___/ __ \   / /   / / __ `/ / / / __  / _ \
  ___/ / |/ |/ / / /_/ /__/ / / /  / /___/ / /_/ / /_/ / /_/ /  __/
 /____/|__/|__/_/\__/\___/_/ /_/   \____/_/\__,_/\__,_/\__,_/\___/

 $ sc
 ? Select API profile to switch to:
   ▶ production (current)
     development
     local-proxy
```

---

## ✨ Features

- 🚀 **One Command Switch** - Switch API configurations instantly with `sc`
- 🔐 **Multiple Profiles** - Manage unlimited API configurations
- 🎯 **Auto Detection** - Automatically imports your existing environment variables
- ⚡ **Tab Completion** - Shell auto-completion out of the box
- 🖥️ **Cross Platform** - Works on macOS, Linux, and Windows

## 📦 Installation

```bash
npm install -g switch-claude-cli
```

That's it! The CLI will:
- ✅ Auto-detect your current `ANTHROPIC_AUTH_TOKEN` and `ANTHROPIC_BASE_URL`
- ✅ Create a default profile from your existing config
- ✅ Install shell completions for zsh/bash

## 🚀 Quick Start

```bash
# Interactive switch (shows all profiles)
sc

# Add a new API profile
sc add

# Quick switch to a specific profile
sc use production

# Apply changes to current terminal
eval "$(sc env)"
```

## 📖 Commands

| Command | Description |
|---------|-------------|
| `sc` | Interactive profile selector |
| `sc use <name>` | Quick switch to a profile |
| `sc add` | Add a new profile |
| `sc edit` | Edit an existing profile |
| `sc remove` | Remove a profile |
| `sc list` | List all profiles |
| `sc env` | Output current profile as export statements |

### Examples

**Adding a new profile:**
```bash
$ sc add
? Profile name: my-custom-api
? ANTHROPIC_AUTH_TOKEN: sk-ant-xxx...
? ANTHROPIC_BASE_URL: https://my-proxy.com/api

✓ Profile "my-custom-api" added successfully
```

**Listing profiles:**
```bash
$ sc list

API Profiles:

  ▶ production (current)
    code.example.com/api
    development
    dev.example.com/api
    local
    127.0.0.1:8080
```

**Switching profiles:**
```bash
$ sc use development

✓ Switched to development

💡 Run the following command to apply changes immediately:
   eval "$(sc env)"
```

## ⚙️ How It Works

Switch Claude manages your API configurations in `~/.claude/sc-profiles.json` and updates your shell configuration file (`~/.zshrc` or `~/.bashrc`) with the active profile's environment variables.

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  sc-profiles.json │ ──▶ │  Shell Config    │ ──▶ │  Claude Code │
│  (your profiles) │     │  (env exports)   │     │  (uses API)  │
└─────────────────┘     └──────────────────┘     └─────────────┘
```

### Configuration Location

- **Profiles:** `~/.claude/sc-profiles.json`
- **Shell exports:** `~/.zshrc` or `~/.bashrc` (managed block)

## 🔧 Shell Completion

Tab completion is automatically installed. Just type:

```bash
sc <TAB>
# Shows: use  add  remove  edit  list  env
```

## 🤝 Use Cases

- **Multiple API Keys** - Switch between personal and work accounts
- **Custom Proxies** - Toggle between direct API and proxy endpoints
- **Development/Production** - Separate configs for different environments
- **API Testing** - Quick switch for debugging different endpoints

## 📄 License

MIT © 2024

---

<p align="center">
  Made with ❤️ for the Claude Code community
</p>
