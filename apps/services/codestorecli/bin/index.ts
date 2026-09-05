#!/usr/bin/env node

import { Command } from 'commander';
import login from '../src/commands/login';
import push from '../src/commands/push';
import cloneCommand from '../src/commands/clone';

const program = new Command();

program
    .name('cloudecode')
    .description('CLI to sell and manage code on CloudDecode Marketplace')
    .version('1.0.0');

// Login Command
program
    .command('login')
    .description('Authenticate with your CloudDecode account')
    .action(login);

// Push Command
program
    .command('push')
    .description('Push current directory code to CloudDecode')
    .option('-m, --message <msg>', 'Commit message')
    .action(push);

// Clone/Buy Command
program
    .command('clone <id>')
    .description('Clone/Download a purchased project')
    .action(cloneCommand);

program.parse(process.argv);