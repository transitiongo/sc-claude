import { execSync } from 'child_process';

/**
 * Set user environment variable on Windows
 */
export function setEnvVar(name, value) {
  if (process.platform !== 'win32') {
    return { success: false, error: 'Not on Windows' };
  }

  try {
    // Use setx to set user environment variable
    // Note: setx has a 1024 character limit for values
    execSync(`setx ${name} "${value}"`, { stdio: 'pipe' });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Remove user environment variable on Windows
 */
export function removeEnvVar(name) {
  if (process.platform !== 'win32') {
    return { success: false, error: 'Not on Windows' };
  }

  try {
    // Use reg delete to remove user environment variable
    execSync(
      `reg delete "HKCU\\Environment" /v ${name} /f`,
      { stdio: 'pipe' }
    );
    return { success: true };
  } catch (error) {
    // If the variable doesn't exist, that's fine
    if (error.message.includes('not find')) {
      return { success: true };
    }
    return { success: false, error: error.message };
  }
}

/**
 * Update Windows environment variables with profile
 */
export function updateWindowsEnv(profile) {
  if (process.platform !== 'win32') {
    return { success: false, error: 'Not on Windows' };
  }

  const tokenResult = setEnvVar('ANTHROPIC_AUTH_TOKEN', profile.ANTHROPIC_AUTH_TOKEN);
  if (!tokenResult.success) {
    return tokenResult;
  }

  const urlResult = setEnvVar('ANTHROPIC_BASE_URL', profile.ANTHROPIC_BASE_URL);
  if (!urlResult.success) {
    return urlResult;
  }

  return { success: true };
}

/**
 * Remove Windows environment variables
 */
export function removeWindowsEnv() {
  if (process.platform !== 'win32') {
    return { success: false, error: 'Not on Windows' };
  }

  removeEnvVar('ANTHROPIC_AUTH_TOKEN');
  removeEnvVar('ANTHROPIC_BASE_URL');

  return { success: true };
}

/**
 * Generate PowerShell env output for eval
 */
export function generateWindowsEnvOutput(profile) {
  if (!profile) {
    return '';
  }

  const lines = [
    `$env:ANTHROPIC_AUTH_TOKEN="${profile.ANTHROPIC_AUTH_TOKEN}"`,
    `$env:ANTHROPIC_BASE_URL="${profile.ANTHROPIC_BASE_URL}"`
  ];

  return lines.join('\n');
}

/**
 * Generate CMD env output
 */
export function generateCmdEnvOutput(profile) {
  if (!profile) {
    return '';
  }

  const lines = [
    `set ANTHROPIC_AUTH_TOKEN=${profile.ANTHROPIC_AUTH_TOKEN}`,
    `set ANTHROPIC_BASE_URL=${profile.ANTHROPIC_BASE_URL}`
  ];

  return lines.join('\n');
}
