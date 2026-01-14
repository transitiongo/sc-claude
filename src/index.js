import chalk from 'chalk';
import {
  getProfiles,
  getCurrentProfile,
  getCurrentProfileName,
  addProfile as addProfileToConfig,
  removeProfile as removeProfileFromConfig,
  updateProfile as updateProfileInConfig,
  setCurrentProfile as setCurrentInConfig,
  hasProfiles
} from './config.js';
import { updateShellConfig, generateEnvOutput } from './shell.js';
import { updateWindowsEnv, generateWindowsEnvOutput } from './windows.js';
import { selectProfile, inputProfile, editProfileInput, confirmAction } from './prompts.js';

const isWindows = process.platform === 'win32';

/**
 * Apply profile to system (update shell config or Windows env)
 */
function applyProfile(profile) {
  if (isWindows) {
    return updateWindowsEnv(profile);
  } else {
    return updateShellConfig(profile);
  }
}

/**
 * Print success message with eval hint
 */
function printSwitchSuccess(profileName) {
  console.log(chalk.green(`\n✓ Switched to ${chalk.bold(profileName)}`));
  console.log();

  if (isWindows) {
    console.log(chalk.yellow('💡 Changes will take effect in new terminal windows.'));
    console.log(chalk.yellow('   To apply in current session (PowerShell):'));
    console.log(chalk.cyan('   sc env | Invoke-Expression'));
  } else {
    console.log(chalk.yellow('💡 Run the following command to apply changes immediately:'));
    console.log(chalk.cyan('   eval "$(sc env)"'));
  }
  console.log();
}

/**
 * Switch profile (interactive)
 */
export async function switchProfile() {
  if (!hasProfiles()) {
    console.log(chalk.yellow('No profiles configured. Use "sc add" to add one.'));
    return;
  }

  const selected = await selectProfile('Select API profile to switch to:');

  if (!selected) {
    return;
  }

  const result = setCurrentInConfig(selected);

  if (!result.success) {
    console.log(chalk.red(`Error: ${result.error}`));
    return;
  }

  const applyResult = applyProfile(result.profile);

  if (!applyResult.success) {
    console.log(chalk.red(`Warning: Failed to update shell config: ${applyResult.error}`));
  }

  printSwitchSuccess(selected);
}

/**
 * Switch to profile by name (non-interactive)
 */
export async function useProfile(name) {
  const result = setCurrentInConfig(name);

  if (!result.success) {
    console.log(chalk.red(`Error: ${result.error}`));
    process.exit(1);
  }

  const applyResult = applyProfile(result.profile);

  if (!applyResult.success) {
    console.log(chalk.red(`Warning: Failed to update shell config: ${applyResult.error}`));
  }

  printSwitchSuccess(name);
}

/**
 * Add new profile
 */
export async function addProfile() {
  const input = await inputProfile();

  const result = addProfileToConfig(input.name, input.token, input.baseUrl);

  if (!result.success) {
    console.log(chalk.red(`Error: ${result.error}`));
    return;
  }

  console.log(chalk.green(`\n✓ Profile "${input.name}" added successfully`));

  // If this is the first profile, apply it
  if (Object.keys(getProfiles()).length === 1) {
    const profile = getCurrentProfile();
    if (profile) {
      applyProfile(profile);
      console.log(chalk.yellow(`   Set as current profile.`));
      printSwitchSuccess(input.name);
    }
  }
}

/**
 * Remove profile
 */
export async function removeProfile() {
  if (!hasProfiles()) {
    console.log(chalk.yellow('No profiles to remove.'));
    return;
  }

  const selected = await selectProfile('Select profile to remove:');

  if (!selected) {
    return;
  }

  const confirmed = await confirmAction(`Are you sure you want to remove "${selected}"?`);

  if (!confirmed) {
    console.log(chalk.gray('Cancelled.'));
    return;
  }

  const result = removeProfileFromConfig(selected);

  if (!result.success) {
    console.log(chalk.red(`Error: ${result.error}`));
    return;
  }

  console.log(chalk.green(`\n✓ Profile "${selected}" removed`));

  // Update shell config with new current profile (if any)
  const currentProfile = getCurrentProfile();
  if (currentProfile) {
    applyProfile(currentProfile);
    console.log(chalk.yellow(`   Switched to "${getCurrentProfileName()}"`));
  }
}

/**
 * Edit profile
 */
export async function editProfile() {
  if (!hasProfiles()) {
    console.log(chalk.yellow('No profiles to edit.'));
    return;
  }

  const selected = await selectProfile('Select profile to edit:');

  if (!selected) {
    return;
  }

  const input = await editProfileInput(selected);

  if (!input) {
    console.log(chalk.red('Error: Profile not found'));
    return;
  }

  const result = updateProfileInConfig(selected, input.token, input.baseUrl);

  if (!result.success) {
    console.log(chalk.red(`Error: ${result.error}`));
    return;
  }

  console.log(chalk.green(`\n✓ Profile "${selected}" updated`));

  // If editing current profile, update shell config
  if (selected === getCurrentProfileName()) {
    const currentProfile = getCurrentProfile();
    if (currentProfile) {
      applyProfile(currentProfile);
      console.log(chalk.yellow('   Shell config updated.'));
    }
  }
}

/**
 * List all profiles
 */
export function listProfiles() {
  const profiles = getProfiles();
  const currentName = getCurrentProfileName();

  const profileNames = Object.keys(profiles);

  if (profileNames.length === 0) {
    console.log(chalk.yellow('No profiles configured. Use "sc add" to add one.'));
    return;
  }

  console.log();
  console.log(chalk.bold('API Profiles:'));
  console.log();

  for (const name of profileNames) {
    const profile = profiles[name];
    const urlShort = profile.ANTHROPIC_BASE_URL.replace(/^https?:\/\//, '').slice(0, 40);

    if (name === currentName) {
      console.log(chalk.green.bold(`  ▶ ${name} (current)`));
      console.log(chalk.green(`    ${urlShort}`));
    } else {
      console.log(chalk.gray(`    ${name}`));
      console.log(chalk.gray.dim(`    ${urlShort}`));
    }
  }
  console.log();
}

/**
 * Output env for eval
 */
export function outputEnv() {
  const profile = getCurrentProfile();

  if (!profile) {
    // Output nothing if no profile
    return;
  }

  if (isWindows) {
    console.log(generateWindowsEnvOutput(profile));
  } else {
    console.log(generateEnvOutput(profile));
  }
}
