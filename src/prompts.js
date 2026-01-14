import inquirer from 'inquirer';
import { getProfiles, getCurrentProfileName, getProfile } from './config.js';

/**
 * Select a profile from the list
 */
export async function selectProfile(message = 'Select a profile:') {
  const profiles = getProfiles();
  const currentName = getCurrentProfileName();

  const profileNames = Object.keys(profiles);

  if (profileNames.length === 0) {
    return null;
  }

  const choices = profileNames.map(name => ({
    name: name === currentName ? `${name} (current)` : name,
    value: name
  }));

  const { selected } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selected',
      message,
      choices,
      default: currentName
    }
  ]);

  return selected;
}

/**
 * Input new profile details
 */
export async function inputProfile(defaultName = '') {
  const { name, token, baseUrl } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Profile name:',
      default: defaultName,
      validate: (input) => {
        if (!input.trim()) {
          return 'Profile name is required';
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(input)) {
          return 'Profile name can only contain letters, numbers, hyphens, and underscores';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'token',
      message: 'ANTHROPIC_AUTH_TOKEN:',
      validate: (input) => {
        if (!input.trim()) {
          return 'Token is required';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'baseUrl',
      message: 'ANTHROPIC_BASE_URL:',
      validate: (input) => {
        if (!input.trim()) {
          return 'Base URL is required';
        }
        try {
          new URL(input);
          return true;
        } catch {
          return 'Please enter a valid URL';
        }
      }
    }
  ]);

  return {
    name: name.trim(),
    token: token.trim(),
    baseUrl: baseUrl.trim()
  };
}

/**
 * Input profile details for editing (with current values as defaults)
 */
export async function editProfileInput(profileName) {
  const profile = getProfile(profileName);

  if (!profile) {
    return null;
  }

  const { token, baseUrl } = await inquirer.prompt([
    {
      type: 'input',
      name: 'token',
      message: 'ANTHROPIC_AUTH_TOKEN:',
      default: profile.ANTHROPIC_AUTH_TOKEN,
      validate: (input) => {
        if (!input.trim()) {
          return 'Token is required';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'baseUrl',
      message: 'ANTHROPIC_BASE_URL:',
      default: profile.ANTHROPIC_BASE_URL,
      validate: (input) => {
        if (!input.trim()) {
          return 'Base URL is required';
        }
        try {
          new URL(input);
          return true;
        } catch {
          return 'Please enter a valid URL';
        }
      }
    }
  ]);

  return {
    name: profileName,
    token: token.trim(),
    baseUrl: baseUrl.trim()
  };
}

/**
 * Confirm an action
 */
export async function confirmAction(message) {
  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message,
      default: false
    }
  ]);

  return confirmed;
}
