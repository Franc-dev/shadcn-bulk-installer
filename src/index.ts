#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/index.ts

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import Listr from 'listr';
import execa from 'execa';
import fs from 'fs/promises';
import os from 'os';

type PackageManager = 'pnpm' | 'npm' | 'bun' | 'yarn';
export function createProgram() {
  const program = new Command();

  program
    .name('shadcn-bulk')
    .description(chalk.bold('🚀 Bulk installer for shadcn/ui components'))
    .version('1.0.0');

  program
    .command('install')
    .description('Install multiple shadcn/ui components')
    .option('-a, --all', 'Install all components')
    .option('-f, --force', 'Force reinstall components even if already present')
    .action(async (options) => {
      try {
        console.log(chalk.bold.rgb(123, 104, 238)('\n🎨 shadcn/ui Bulk Installer\n'));

        // Existing installation logic remains the same
      } catch (error: any) {
        console.error(chalk.red('\n❌ Error occurred:'));
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });

  return program;
}
export const AVAILABLE_COMPONENTS = [
  'accordion', 'alert', 'alert-dialog', 'aspect-ratio', 'avatar', 'badge',
  'button', 'calendar', 'card', 'carousel', 'checkbox', 'collapsible',
  'command', 'context-menu', 'dialog', 'dropdown-menu', 'form', 'hover-card',
  'input', 'label', 'menubar', 'navigation-menu', 'popover', 'progress',
  'radio-group', 'scroll-area', 'select', 'separator', 'sheet', 'skeleton',
  'slider', 'switch', 'table', 'tabs', 'textarea', 'toast', 'toggle',
  'tooltip'
];

// Optimized package manager configurations
export const PACKAGE_MANAGERS: Record<PackageManager, {
  color: chalk.Chalk;
  install: string[];
  concurrent: number;
  batchSize: number;
}> = {
  pnpm: {
    color: chalk.magenta,
    install: ['dlx'],
    concurrent: Math.min(Math.max(os.cpus().length - 1, 3), 10), // Capped at 10
    batchSize: 5
  },
  bun: {
    color: chalk.hex('#fbf0df'),
    install: ['x'],
    concurrent: Math.min(Math.max(os.cpus().length, 5), 10), // Capped at 10
    batchSize: 8
  },
  npm: {
    color: chalk.red,
    install: ['npx'],
    concurrent: Math.min(Math.floor(os.cpus().length / 2), 10), // Capped at 10
    batchSize: 4
  },
  yarn: {
    color: chalk.cyan,
    install: ['dlx'],
    concurrent: Math.min(Math.floor(os.cpus().length / 2), 10), // Capped at 10
    batchSize: 4
  }
};

// ... (keep existing AVAILABLE_COMPONENTS and other imports)

async function installComponentBatch(
  components: string[], 
  packageManager: PackageManager, 
  pm: typeof PACKAGE_MANAGERS[PackageManager]
): Promise<void> {
  const tasks = new Listr(
    components.map(component => ({
      title: pm.color(`Installing ${component}`),
      task: async (ctx: any, task: Listr.ListrTaskWrapper<any>) => {
        try {
          // Cache check for already installed components
          const componentPath = `components/ui/${component}`;
          try {
            await fs.access(componentPath);
            task.title = pm.color(`↪ ${component} (already installed)`);
            return;
          } catch {
            // Continue if component directory doesn't exist (expected for new installations)
          }

          await execa(packageManager, [
            ...pm.install,
            'shadcn@latest',
            'add',
            component,
            '--yes',
            '--no-color' // Reduces processing overhead
          ], {
            env: {
              ...process.env,
              NODE_ENV: 'production', // Faster installation
              FORCE_COLOR: '0'
            }
          });
          task.title = pm.color(`✓ ${component}`);
        } catch (error) {
          task.title = chalk.red(`⚠️  ${component}`);
          throw error;
        }
      }
    })),
    {
      concurrent: pm.concurrent,
      exitOnError: false
    }
  );

  await tasks.run();
}

async function detectPackageManager(): Promise<PackageManager | undefined> {
  try {
    const files = await fs.readdir(process.cwd());
    if (files.includes('pnpm-lock.yaml')) return 'pnpm';
    if (files.includes('bun.lockb')) return 'bun';
    if (files.includes('yarn.lock')) return 'yarn';
    if (files.includes('package-lock.json')) return 'npm';
    return undefined;
  } catch {
    return undefined;
  }
}

async function batchInstallComponents(
  components: string[],
  packageManager: PackageManager,
  pm: typeof PACKAGE_MANAGERS[PackageManager]
): Promise<void> {
  const batches = [];
  for (let i = 0; i < components.length; i += pm.batchSize) {
    batches.push(components.slice(i, i + pm.batchSize));
  }

  const totalBatches = batches.length;
  for (let i = 0; i < batches.length; i++) {
    console.log(chalk.cyan(`\n📦 Installing batch ${i + 1}/${totalBatches} (${batches[i].length} components)`));
    await installComponentBatch(batches[i], packageManager, pm);
  }
}

const program = new Command();

program
  .name('shadcn-bulk')
  .description(chalk.bold('🚀 Bulk installer for shadcn/ui components'))
  .version('1.0.0');

program
  .command('install')
  .description('Install multiple shadcn/ui components')
  .option('-a, --all', 'Install all components')
  .option('-f, --force', 'Force reinstall components even if already present')
  .action(async (options) => {
    try {
      console.log(chalk.bold.rgb(123, 104, 238)('\n🎨 shadcn/ui Bulk Installer\n'));

      // Fast project setup check
      const spinner = ora('Checking project setup...').start();
      const [isSetup, detectedPM] = await Promise.all([
        checkProjectSetup(),
        detectPackageManager()
      ]);
      
      if (!isSetup) {
        spinner.fail(chalk.red('Project setup incomplete'));
        console.log(chalk.red('\n❌ Error: components.json not found'));
        console.log(chalk.yellow('\nPlease run init first:'));
        console.log(chalk.gray('\n1. Choose your package manager'));
        console.log(chalk.gray('2. Run: <package-manager> dlx shadcn@latest init\n'));
        process.exit(1);
      }
      spinner.succeed(chalk.green('Project setup verified'));

      const { packageManager } = await inquirer.prompt<{ packageManager: PackageManager }>([
        {
          type: 'list',
          name: 'packageManager',
          message: 'Select package manager:',
          default: detectedPM,
          choices: Object.entries(PACKAGE_MANAGERS).map(([name, config]) => ({
            name: config.color(`${name}${detectedPM === name ? ' (detected)' : ''}`),
            value: name
          }))
        }
      ]);

      const pm = PACKAGE_MANAGERS[packageManager];

      let componentsToInstall = [];
      if (options.all) {
        componentsToInstall = AVAILABLE_COMPONENTS;
        console.log(chalk.cyan(`\n📦 Installing all ${componentsToInstall.length} components\n`));
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
            pageSize: 20,
            loop: false
          }
        ]);
        componentsToInstall = answer.components;
      }

      if (componentsToInstall.length === 0) {
        console.log(chalk.yellow('\n⚠️  No components selected. Exiting...'));
        process.exit(0);
      }

      await batchInstallComponents(componentsToInstall, packageManager, pm);

      console.log(chalk.green('\n✨ Installation complete!'));
      console.log(chalk.cyan('\n📘 Import components from:'));
      console.log(chalk.yellow('@/components/ui/<component-name>'));
      
    } catch (error: any) {
      console.error(chalk.red('\n❌ Error occurred:'));
      console.error(chalk.red(error.message));
      if (error.stderr) {
        console.error(chalk.gray('\nDetails:'));
        console.error(chalk.gray(error.stderr));
      }
      process.exit(1);
    }
  });

async function checkProjectSetup(): Promise<boolean> {
  try {
    await fs.access('components.json');
    return true;
  } catch {
    return false;
  }
}

// Only parse if running as a script
if (require.main === module) {
  const program = createProgram();
  program.parse(process.argv);
}