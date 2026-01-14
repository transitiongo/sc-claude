#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import {
  switchProfile,
  useProfile,
  addProfile,
  removeProfile,
  editProfile,
  listProfiles,
  outputEnv
} from '../src/index.js';
import { initFromSystemEnv } from '../src/config.js';

// Initialize from system environment on first run
const initResult = initFromSystemEnv();
if (initResult.initialized) {
  console.log(chalk.green(`✓ Detected system environment variables.`));
  console.log(chalk.green(`  Created profile "${initResult.name}" as default.`));
  console.log();
}

const program = new Command();

program
  .name('sc')
  .description('Switch Claude Code API configurations')
  .version('1.0.0');

// Default command (no subcommand) - interactive switch
program
  .action(async () => {
    await switchProfile();
  });

// use <name> - quick switch
program
  .command('use <name>')
  .description('Switch to a specific profile')
  .action(async (name) => {
    await useProfile(name);
  });

// add - add new profile
program
  .command('add')
  .description('Add a new API profile')
  .action(async () => {
    await addProfile();
  });

// remove - remove profile
program
  .command('remove')
  .description('Remove an API profile')
  .action(async () => {
    await removeProfile();
  });

// edit - edit profile
program
  .command('edit')
  .description('Edit an existing API profile')
  .action(async () => {
    await editProfile();
  });

// list - list all profiles
program
  .command('list')
  .description('List all API profiles')
  .action(() => {
    listProfiles();
  });

// env - output env for eval
program
  .command('env')
  .description('Output environment variables for current profile (for eval)')
  .action(() => {
    outputEnv();
  });

program.parse();
