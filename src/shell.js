import { readFileSync, writeFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { execSync } from 'child_process';

const START_MARKER = '# >>> sc managed start >>>';
const END_MARKER = '# <<< sc managed end <<<';

/**
 * Detect current shell type
 */
export function detectShell() {
  const shell = process.env.SHELL || '';

  if (shell.includes('zsh')) {
    return 'zsh';
  } else if (shell.includes('bash')) {
    return 'bash';
  }

  // Try to detect from $0 or parent process
  try {
    const parentShell = execSync('echo $0', { encoding: 'utf-8' }).trim();
    if (parentShell.includes('zsh')) return 'zsh';
    if (parentShell.includes('bash')) return 'bash';
  } catch {
    // Ignore errors
  }

  // Default to zsh on macOS, bash elsewhere
  return process.platform === 'darwin' ? 'zsh' : 'bash';
}

/**
 * Get shell config file path
 */
export function getShellConfigPath(shellType = null) {
  const shell = shellType || detectShell();
  const home = homedir();

  if (shell === 'zsh') {
    return join(home, '.zshrc');
  } else if (shell === 'bash') {
    // On macOS, prefer .bash_profile; on Linux, prefer .bashrc
    if (process.platform === 'darwin') {
      const bashProfile = join(home, '.bash_profile');
      if (existsSync(bashProfile)) {
        return bashProfile;
      }
    }
    return join(home, '.bashrc');
  }

  return join(home, '.bashrc');
}

/**
 * Generate export block content
 */
export function generateExportBlock(profile) {
  const lines = [
    START_MARKER,
    `export ANTHROPIC_AUTH_TOKEN="${profile.ANTHROPIC_AUTH_TOKEN}"`,
    `export ANTHROPIC_BASE_URL="${profile.ANTHROPIC_BASE_URL}"`,
    END_MARKER
  ];
  return lines.join('\n');
}

/**
 * Update shell config file with new profile
 */
export function updateShellConfig(profile) {
  const configPath = getShellConfigPath();
  let content = '';

  if (existsSync(configPath)) {
    content = readFileSync(configPath, 'utf-8');
  }

  const newBlock = generateExportBlock(profile);

  // Check if managed block already exists
  const startIndex = content.indexOf(START_MARKER);
  const endIndex = content.indexOf(END_MARKER);

  if (startIndex !== -1 && endIndex !== -1) {
    // Replace existing block
    content = content.substring(0, startIndex) +
      newBlock +
      content.substring(endIndex + END_MARKER.length);
  } else {
    // Append new block
    if (content && !content.endsWith('\n')) {
      content += '\n';
    }
    content += '\n' + newBlock + '\n';
  }

  try {
    writeFileSync(configPath, content, 'utf-8');
    return { success: true, path: configPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Remove managed block from shell config
 */
export function removeShellConfig() {
  const configPath = getShellConfigPath();

  if (!existsSync(configPath)) {
    return { success: true };
  }

  let content = readFileSync(configPath, 'utf-8');

  const startIndex = content.indexOf(START_MARKER);
  const endIndex = content.indexOf(END_MARKER);

  if (startIndex !== -1 && endIndex !== -1) {
    // Remove the block and any surrounding newlines
    let before = content.substring(0, startIndex);
    let after = content.substring(endIndex + END_MARKER.length);

    // Clean up extra newlines
    before = before.replace(/\n+$/, '\n');
    after = after.replace(/^\n+/, '\n');

    content = before + after;

    try {
      writeFileSync(configPath, content, 'utf-8');
      return { success: true, path: configPath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}

/**
 * Generate env output for eval
 */
export function generateEnvOutput(profile) {
  if (!profile) {
    return '';
  }

  const lines = [
    `export ANTHROPIC_AUTH_TOKEN="${profile.ANTHROPIC_AUTH_TOKEN}"`,
    `export ANTHROPIC_BASE_URL="${profile.ANTHROPIC_BASE_URL}"`
  ];

  return lines.join('\n');
}
