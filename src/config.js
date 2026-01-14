import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const CONFIG_DIR = join(homedir(), '.claude');
const CONFIG_FILE = join(CONFIG_DIR, 'sc-profiles.json');

/**
 * Default config structure
 */
function getDefaultConfig() {
  return {
    current: null,
    profiles: {}
  };
}

/**
 * Ensure config directory exists
 */
function ensureConfigDir() {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

/**
 * Load config from file
 */
export function loadConfig() {
  ensureConfigDir();

  if (!existsSync(CONFIG_FILE)) {
    return getDefaultConfig();
  }

  try {
    const content = readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading config file:', error.message);
    return getDefaultConfig();
  }
}

/**
 * Save config to file
 */
export function saveConfig(config) {
  ensureConfigDir();

  try {
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving config file:', error.message);
    return false;
  }
}

/**
 * Get all profiles
 */
export function getProfiles() {
  const config = loadConfig();
  return config.profiles;
}

/**
 * Get profile by name
 */
export function getProfile(name) {
  const config = loadConfig();
  return config.profiles[name] || null;
}

/**
 * Get current profile
 */
export function getCurrentProfile() {
  const config = loadConfig();
  if (!config.current) {
    return null;
  }
  return config.profiles[config.current] || null;
}

/**
 * Get current profile name
 */
export function getCurrentProfileName() {
  const config = loadConfig();
  return config.current;
}

/**
 * Add a new profile
 */
export function addProfile(name, token, baseUrl) {
  const config = loadConfig();

  if (config.profiles[name]) {
    return { success: false, error: `Profile "${name}" already exists` };
  }

  config.profiles[name] = {
    name,
    ANTHROPIC_AUTH_TOKEN: token,
    ANTHROPIC_BASE_URL: baseUrl
  };

  // If this is the first profile, set it as current
  if (!config.current) {
    config.current = name;
  }

  if (saveConfig(config)) {
    return { success: true };
  }
  return { success: false, error: 'Failed to save config' };
}

/**
 * Remove a profile
 */
export function removeProfile(name) {
  const config = loadConfig();

  if (!config.profiles[name]) {
    return { success: false, error: `Profile "${name}" not found` };
  }

  delete config.profiles[name];

  // If removing current profile, clear current
  if (config.current === name) {
    const remaining = Object.keys(config.profiles);
    config.current = remaining.length > 0 ? remaining[0] : null;
  }

  if (saveConfig(config)) {
    return { success: true };
  }
  return { success: false, error: 'Failed to save config' };
}

/**
 * Update a profile
 */
export function updateProfile(name, token, baseUrl) {
  const config = loadConfig();

  if (!config.profiles[name]) {
    return { success: false, error: `Profile "${name}" not found` };
  }

  config.profiles[name] = {
    name,
    ANTHROPIC_AUTH_TOKEN: token,
    ANTHROPIC_BASE_URL: baseUrl
  };

  if (saveConfig(config)) {
    return { success: true };
  }
  return { success: false, error: 'Failed to save config' };
}

/**
 * Set current profile
 */
export function setCurrentProfile(name) {
  const config = loadConfig();

  if (!config.profiles[name]) {
    return { success: false, error: `Profile "${name}" not found` };
  }

  config.current = name;

  if (saveConfig(config)) {
    return { success: true, profile: config.profiles[name] };
  }
  return { success: false, error: 'Failed to save config' };
}

/**
 * Check if any profiles exist
 */
export function hasProfiles() {
  const config = loadConfig();
  return Object.keys(config.profiles).length > 0;
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
      // Ensure valid profile name (alphanumeric, hyphens, underscores)
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
 * Initialize config from system environment variables (first-time setup)
 */
export function initFromSystemEnv() {
  const config = loadConfig();

  // If profiles already exist, skip initialization
  if (Object.keys(config.profiles).length > 0) {
    return { initialized: false };
  }

  const token = process.env.ANTHROPIC_AUTH_TOKEN;
  const baseUrl = process.env.ANTHROPIC_BASE_URL;

  // Only initialize if both env vars are present
  if (token && baseUrl) {
    const name = extractNameFromUrl(baseUrl);
    config.profiles[name] = {
      name,
      ANTHROPIC_AUTH_TOKEN: token,
      ANTHROPIC_BASE_URL: baseUrl
    };
    config.current = name;
    saveConfig(config);
    return { initialized: true, name };
  }

  return { initialized: false };
}
