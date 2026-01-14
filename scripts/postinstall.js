#!/usr/bin/env node

/**
 * postinstall script - Auto-configure shell completion and import existing config
 * Only runs on macOS/Linux, skips Windows
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const START_MARKER = '# >>> sc managed >>>';
const END_MARKER = '# <<< sc managed <<<';

// Zsh: shell function wrapper + completion
const ZSH_SCRIPT = `${START_MARKER}
# sc wrapper function - auto-apply env after switch
sc() {
  command sc "$@"
  local cmd="$1"
  if [[ -z "$cmd" || "$cmd" == "use" || "$cmd" == "add" || "$cmd" == "edit" || "$cmd" == "remove" ]]; then
    eval "$(command sc env)"
  fi
}
# completion
_sc() {
  local commands="use add remove edit list env"
  local cur=\${words[CURRENT]}
  if [[ \${CURRENT} -eq 2 ]]; then
    _describe 'command' "(use add remove edit list env)"
  fi
}
compdef _sc sc
${END_MARKER}`;

// Bash: shell function wrapper + completion
const BASH_SCRIPT = `${START_MARKER}
# sc wrapper function - auto-apply env after switch
sc() {
  command sc "$@"
  local cmd="$1"
  if [[ -z "$cmd" || "$cmd" == "use" || "$cmd" == "add" || "$cmd" == "edit" || "$cmd" == "remove" ]]; then
    eval "$(command sc env)"
  fi
}
# completion
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
 * Install shell wrapper function and completion
 */
function installShellIntegration() {
  // Skip on Windows
  if (process.platform === 'win32') {
    return;
  }

  const shellType = detectShell();
  const configPath = getShellConfigPath(shellType);
  const shellScript = shellType === 'zsh' ? ZSH_SCRIPT : BASH_SCRIPT;

  let content = '';
  if (existsSync(configPath)) {
    content = readFileSync(configPath, 'utf-8');
  }

  // Check if already installed (look for old or new marker)
  const oldMarker = '# >>> sc completion >>>';
  const hasOldMarker = content.includes(oldMarker);
  const hasNewMarker = content.includes(START_MARKER);

  if (hasOldMarker || hasNewMarker) {
    // Remove old version first
    const markerToFind = hasOldMarker ? oldMarker : START_MARKER;
    const endMarkerToFind = hasOldMarker ? '# <<< sc completion <<<' : END_MARKER;
    const startIdx = content.indexOf(markerToFind);
    const endIdx = content.indexOf(endMarkerToFind);
    if (startIdx !== -1 && endIdx !== -1) {
      content = content.substring(0, startIdx) +
        shellScript +
        content.substring(endIdx + endMarkerToFind.length);
    }
  } else {
    // Append new script
    if (content && !content.endsWith('\n')) {
      content += '\n';
    }
    content += '\n' + shellScript + '\n';
  }

  try {
    writeFileSync(configPath, content, 'utf-8');
    console.log(`✓ Shell integration installed to ${configPath}`);
    console.log(`  Run 'source ${configPath}' or restart your terminal to enable auto-apply`);
  } catch (error) {
    console.log('Note: Could not install shell integration automatically.');
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
installShellIntegration();
importExistingConfig();
