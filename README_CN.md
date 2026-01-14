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

<h4 align="center">一键切换 Claude Code 的多个 API 配置</h4>

<p align="center">
  <a href="#-特性">特性</a> •
  <a href="#-安装">安装</a> •
  <a href="#-快速开始">快速开始</a> •
  <a href="#-命令说明">命令说明</a> •
  <a href="#-工作原理">工作原理</a>
</p>

---

```
    ____         _ __       __       ________                __
   / __/      __(_) /______/ /_     / ____/ /___ ___  ______/ /__
   \__ \ | /| / / / __/ ___/ __ \   / /   / / __ `/ / / / __  / _ \
  ___/ / |/ |/ / / /_/ /__/ / / /  / /___/ / /_/ / /_/ / /_/ /  __/
 /____/|__/|__/_/\__/\___/_/ /_/   \____/_/\__,_/\__,_/\__,_/\___/

 $ sc
 ? 选择要切换的 API 配置:
   ▶ 生产环境 (当前)
     开发环境
     本地代理
```

---

## ✨ 特性

- 🚀 **一键切换** - 使用 `sc` 命令即可快速切换 API 配置
- 🔐 **多配置管理** - 支持管理多个 API 配置文件
- 🎯 **自动检测** - 首次运行自动导入现有环境变量
- ⚡ **Tab 补全** - 开箱即用的 Shell 自动补全
- 🖥️ **跨平台** - 支持 macOS、Linux 和 Windows

## 📦 安装

```bash
npm install -g switch-claude-cli
```

安装完成后，CLI 会自动：
- ✅ 检测现有的 `ANTHROPIC_AUTH_TOKEN` 和 `ANTHROPIC_BASE_URL`
- ✅ 从现有配置创建默认配置文件
- ✅ 为 zsh/bash 安装 Shell 补全

## 🚀 快速开始

```bash
# 交互式切换（显示所有配置）
sc

# 添加新的 API 配置
sc add

# 快速切换到指定配置
sc use production

# 让配置在当前终端立即生效
eval "$(sc env)"
```

## 📖 命令说明

| 命令 | 说明 |
|---------|-------------|
| `sc` | 交互式选择配置 |
| `sc use <名称>` | 快速切换到指定配置 |
| `sc add` | 添加新配置 |
| `sc edit` | 编辑现有配置 |
| `sc remove` | 删除配置 |
| `sc list` | 列出所有配置 |
| `sc env` | 输出当前配置的环境变量 |

### 使用示例

**添加新配置：**
```bash
$ sc add
? 配置名称: my-custom-api
? ANTHROPIC_AUTH_TOKEN: sk-ant-xxx...
? ANTHROPIC_BASE_URL: https://my-proxy.com/api

✓ 配置 "my-custom-api" 添加成功
```

**查看配置列表：**
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

**切换配置：**
```bash
$ sc use development

✓ 已切换到 development

💡 运行以下命令使配置立即生效：
   eval "$(sc env)"
```

## ⚙️ 工作原理

Switch Claude 将你的 API 配置存储在 `~/.claude/sc-profiles.json`，并将当前配置的环境变量写入 Shell 配置文件（`~/.zshrc` 或 `~/.bashrc`）。

```
┌──────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  sc-profiles.json │ ──▶ │  Shell 配置文件   │ ──▶ │ Claude Code │
│   (你的配置)      │     │  (环境变量导出)   │     │  (使用 API) │
└──────────────────┘     └──────────────────┘     └─────────────┘
```

### 配置文件位置

- **配置存储：** `~/.claude/sc-profiles.json`
- **环境变量：** `~/.zshrc` 或 `~/.bashrc`（托管代码块）

## 🔧 Shell 补全

Tab 补全会在安装时自动配置。只需输入：

```bash
sc <TAB>
# 显示: use  add  remove  edit  list  env
```

## 🤝 使用场景

- **多账号切换** - 在个人账号和工作账号之间切换
- **代理切换** - 在直连 API 和代理端点之间切换
- **环境切换** - 开发环境和生产环境使用不同配置
- **API 调试** - 快速切换不同端点进行测试

## 📄 许可证

MIT © 2024

---

<p align="center">
  用 ❤️ 为 Claude Code 社区打造
</p>
