#!/usr/bin/env node
// src/index.ts

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import Listr from 'listr';
import execa from 'execa';

const AVAILABLE_COMPONENTS = [
  'accordion',
  'alert-dialog',
  'alert',
  'aspect-ratio',
  'avatar',
  'badge',
  'button',
  'calendar',
  'card',
  'carousel',
  'checkbox',
  'collapsible',
  'combobox',
  'command',
  'context-menu',
  'dialog',
  'dropdown-menu',
  'form',
  'hover-card',
  'input',
  'label',
  'menubar',
  'navigation-menu',
  'popover',
  'progress',
  'radio-group',
  'scroll-area',
  'select',
  'separator',
  'sheet',
  'skeleton',
  'slider',
  'switch',
  'table',
  'tabs',
  'textarea',
  'toast',
  'toggle',
  'tooltip'
];


const program = new Command();

program
  .name('shadcn-bulk')
  .description('Bulk installer for shadcn/ui components')
  .version('1.0.0');

program
  .command('install')
  .description('Install multiple shadcn/ui components')
  .option('-a, --all', 'Install all components')
  .action(async (options) => {
    try {
      // Verify if project has shadcn/ui initialized
      const spinner = ora('Checking project setup...').start();
      
      try {
        await execa('npx', ['shadcn@latest', '--help']);
        spinner.succeed('shadcn/ui is properly set up');
      } catch {
        spinner.fail('shadcn/ui is not properly set up in this project');
        console.log(chalk.red('\nPlease initialize shadcn/ui first:'));
        console.log(chalk.yellow('\nnpx shadcn@latest init\n'));
        process.exit(1);
      }

      let componentsToInstall: string[] = [];

      if (options.all) {
        componentsToInstall = AVAILABLE_COMPONENTS;
      } else {
        const answer = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'components',
            message: 'Select components to install:',
            choices: AVAILABLE_COMPONENTS.map(component => ({
              name: component,
              value: component
            })),
            pageSize: 20
          }
        ]);
        componentsToInstall = answer.components;
      }

      if (componentsToInstall.length === 0) {
        console.log(chalk.yellow('\nNo components selected. Exiting...'));
        process.exit(0);
      }

      const tasks = new Listr(
        componentsToInstall.map(component => ({
          title: `Installing ${component}`,
          task: () => execa('npx', ['shadcn@latest', 'add', component])
        })),
        { concurrent: false }
      );

      console.log(chalk.cyan(`\nInstalling ${componentsToInstall.length} components...\n`));
      await tasks.run();

      console.log(chalk.green('\n✨ All components installed successfully!'));
      console.log(chalk.cyan('\nImport components from:'));
      console.log(chalk.yellow('@/components/ui/<component-name>'));
      
    } catch (error) {
      console.error(chalk.red('\nAn error occurred:'), error);
      process.exit(1);
    }
  });

program.parse();