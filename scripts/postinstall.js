#!/usr/bin/env node

/**
 * postinstall script - Auto-configure shell completion and import existing config
 * Only runs on macOS/Linux, skips Windows
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const START_MARKER = '# >>> sc completion >>>';
const END_MARKER = '# <<< sc completion <<<';

// Zsh completion script
const ZSH_COMPLETION = `${START_MARKER}
_sc() {
  local commands="use add remove edit list env"
  local cur=\${words[CURRENT]}
  if [[ \${CURRENT} -eq 2 ]]; then
    _describe 'command' "(use add remove edit list env)"
  fi
}
compdef _sc sc
${END_MARKER}`;

// Bash completion script
const BASH_COMPLETION = `${START_MARKER}
_sc() {
  local cur=\${COMP_WORDS[COMP_CWORD]}
  if [[ \${COMP_CWORD} -eq 1 ]]; then
    COMPREPLY=($(compgen -W "use add remove edit list env" -- "\${cur}"))
  fi
}
complete -F _sc sc
${END_MARKER}`;

/**
 * Detect shell type from SHELL env
 */
function detectShell() {
  const shell = process.env.SHELL || '';
  if (shell.includes('zsh')) return 'zsh';
  if (shell.includes('bash')) return 'bash';
  // Default to zsh on macOS
  return process.platform === 'darwin' ? 'zsh' : 'bash';
}

/**
 * Get shell config file path
 */
function getShellConfigPath(shellType) {
  const home = homedir();
  if (shellType === 'zsh') {
    return join(home, '.zshrc');
  }
  // Bash
  if (process.platform === 'darwin') {
    const bashProfile = join(home, '.bash_profile');
    if (existsSync(bashProfile)) return bashProfile;
  }
  return join(home, '.bashrc');
}

/**
 * Install completion script to shell config
 */
function installCompletion() {
  // Skip on Windows
  if (process.platform === 'win32') {
    return;
  }

  const shellType = detectShell();
  const configPath = getShellConfigPath(shellType);
  const completionScript = shellType === 'zsh' ? ZSH_COMPLETION : BASH_COMPLETION;

  let content = '';
  if (existsSync(configPath)) {
    content = readFileSync(configPath, 'utf-8');
  }

  // Check if already installed
  if (content.includes(START_MARKER)) {
    // Already installed, update it
    const startIdx = content.indexOf(START_MARKER);
    const endIdx = content.indexOf(END_MARKER);
    if (startIdx !== -1 && endIdx !== -1) {
      content = content.substring(0, startIdx) +
                completionScript +
                content.substring(endIdx + END_MARKER.length);
    }
  } else {
    // Append new completion
    if (content && !content.endsWith('\n')) {
      content += '\n';
    }
    content += '\n' + completionScript + '\n';
  }

  try {
    writeFileSync(configPath, content, 'utf-8');
    console.log(`✓ Shell completion installed to ${configPath}`);
    console.log('  Restart your terminal or run: source ' + configPath);
  } catch (error) {
    // Silently fail - don't break npm install
    console.log('Note: Could not install shell completion automatically.');
  }
}

/**
 * Extract profile name from URL (use last path segment)
 */
function extractNameFromUrl(baseUrl) {
  try {
    const url = new URL(baseUrl);
    const pathParts = url.pathname.split('/').filter(p => p.length > 0);
    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1];
      if (/^[a-zA-Z0-9_-]+$/.test(lastPart)) {
        return lastPart;
      }
    }
  } catch {
    // Ignore URL parse errors
  }
  return 'default';
}

/**
 * Import existing ANTHROPIC_* config from shell config file
 */
function importExistingConfig() {
  // Skip on Windows
  if (process.platform === 'win32') {
    return;
  }

  const CONFIG_DIR = join(homedir(), '.claude');
  const CONFIG_FILE = join(CONFIG_DIR, 'sc-profiles.json');

  // If config file already exists and has profiles, skip
  if (existsSync(CONFIG_FILE)) {
    try {
      const config = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
      if (config.profiles && Object.keys(config.profiles).length > 0) {
        return;
      }
    } catch {
      // Continue if can't parse
    }
  }

  const shellType = detectShell();
  const configPath = getShellConfigPath(shellType);

  if (!existsSync(configPath)) {
    return;
  }

  let content;
  try {
    content = readFileSync(configPath, 'utf-8');
  } catch {
    return;
  }

  // Parse ANTHROPIC_AUTH_TOKEN and ANTHROPIC_BASE_URL from exports
  const tokenMatch = content.match(/export\s+ANTHROPIC_AUTH_TOKEN\s*=\s*["']?([^"'\n]+)["']?/);
  const urlMatch = content.match(/export\s+ANTHROPIC_BASE_URL\s*=\s*["']?([^"'\n]+)["']?/);

  const token = tokenMatch ? tokenMatch[1].trim() : null;
  const baseUrl = urlMatch ? urlMatch[1].trim() : null;

  // Only import if both values are present
  if (token && baseUrl) {
    const name = extractNameFromUrl(baseUrl);

    // Ensure config directory exists
    if (!existsSync(CONFIG_DIR)) {
      mkdirSync(CONFIG_DIR, { recursive: true });
    }

    const config = {
      current: name,
      profiles: {
        [name]: {
          name,
          ANTHROPIC_AUTH_TOKEN: token,
          ANTHROPIC_BASE_URL: baseUrl
        }
      }
    };

    try {
      writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
      console.log(`✓ Imported existing config as profile "${name}"`);
    } catch {
      // Silently fail
    }
  }
}

// Run
installCompletion();
importExistingConfig();
