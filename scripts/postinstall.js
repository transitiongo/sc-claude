#!/usr/bin/env node

/**
 * postinstall script - Auto-configure shell completion for sc command
 * Only runs on macOS/Linux, skips Windows
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
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

// Run
installCompletion();
