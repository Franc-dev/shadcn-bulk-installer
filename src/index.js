#!/usr/bin/env node
"use strict";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/index.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PACKAGE_MANAGERS = exports.AVAILABLE_COMPONENTS = void 0;
exports.createProgram = createProgram;
const commander_1 = require("commander");
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const listr_1 = __importDefault(require("listr"));
const execa_1 = __importDefault(require("execa"));
const promises_1 = __importDefault(require("fs/promises"));
const os_1 = __importDefault(require("os"));
function createProgram() {
    const program = new commander_1.Command();
    program
        .name('shadcn-bulk')
        .description(chalk_1.default.bold('🚀 Bulk installer for shadcn/ui components'))
        .version('1.0.0');
    program
        .command('install')
        .description('Install multiple shadcn/ui components')
        .option('-a, --all', 'Install all components')
        .option('-f, --force', 'Force reinstall components even if already present')
        .action(async (options) => {
        try {
            console.log(chalk_1.default.bold.rgb(123, 104, 238)('\n🎨 shadcn/ui Bulk Installer\n'));
            // Existing installation logic remains the same
        }
        catch (error) {
            console.error(chalk_1.default.red('\n❌ Error occurred:'));
            console.error(chalk_1.default.red(error.message));
            process.exit(1);
        }
    });
    return program;
}
exports.AVAILABLE_COMPONENTS = [
    'accordion', 'alert', 'alert-dialog', 'aspect-ratio', 'avatar', 'badge',
    'button', 'calendar', 'card', 'carousel', 'checkbox', 'collapsible',
    'command', 'context-menu', 'dialog', 'dropdown-menu', 'form', 'hover-card',
    'input', 'label', 'menubar', 'navigation-menu', 'popover', 'progress',
    'radio-group', 'scroll-area', 'select', 'separator', 'sheet', 'skeleton',
    'slider', 'switch', 'table', 'tabs', 'textarea', 'toast', 'toggle',
    'tooltip'
];
// Optimized package manager configurations
exports.PACKAGE_MANAGERS = {
    pnpm: {
        color: chalk_1.default.magenta,
        install: ['dlx'],
        concurrent: Math.min(Math.max(os_1.default.cpus().length - 1, 3), 10), // Capped at 10
        batchSize: 5
    },
    bun: {
        color: chalk_1.default.hex('#fbf0df'),
        install: ['x'],
        concurrent: Math.min(Math.max(os_1.default.cpus().length, 5), 10), // Capped at 10
        batchSize: 8
    },
    npm: {
        color: chalk_1.default.red,
        install: ['npx'],
        concurrent: Math.min(Math.floor(os_1.default.cpus().length / 2), 10), // Capped at 10
        batchSize: 4
    },
    yarn: {
        color: chalk_1.default.cyan,
        install: ['dlx'],
        concurrent: Math.min(Math.floor(os_1.default.cpus().length / 2), 10), // Capped at 10
        batchSize: 4
    }
};
// ... (keep existing AVAILABLE_COMPONENTS and other imports)
async function installComponentBatch(components, packageManager, pm) {
    const tasks = new listr_1.default(components.map(component => ({
        title: pm.color(`Installing ${component}`),
        task: async (ctx, task) => {
            try {
                // Cache check for already installed components
                const componentPath = `components/ui/${component}`;
                try {
                    await promises_1.default.access(componentPath);
                    task.title = pm.color(`↪ ${component} (already installed)`);
                    return;
                }
                catch {
                    // Continue if component directory doesn't exist (expected for new installations)
                }
                await (0, execa_1.default)(packageManager, [
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
            }
            catch (error) {
                task.title = chalk_1.default.red(`⚠️  ${component}`);
                throw error;
            }
        }
    })), {
        concurrent: pm.concurrent,
        exitOnError: false
    });
    await tasks.run();
}
async function detectPackageManager() {
    try {
        const files = await promises_1.default.readdir(process.cwd());
        if (files.includes('pnpm-lock.yaml'))
            return 'pnpm';
        if (files.includes('bun.lockb'))
            return 'bun';
        if (files.includes('yarn.lock'))
            return 'yarn';
        if (files.includes('package-lock.json'))
            return 'npm';
        return undefined;
    }
    catch {
        return undefined;
    }
}
async function batchInstallComponents(components, packageManager, pm) {
    const batches = [];
    for (let i = 0; i < components.length; i += pm.batchSize) {
        batches.push(components.slice(i, i + pm.batchSize));
    }
    const totalBatches = batches.length;
    for (let i = 0; i < batches.length; i++) {
        console.log(chalk_1.default.cyan(`\n📦 Installing batch ${i + 1}/${totalBatches} (${batches[i].length} components)`));
        await installComponentBatch(batches[i], packageManager, pm);
    }
}
const program = new commander_1.Command();
program
    .name('shadcn-bulk')
    .description(chalk_1.default.bold('🚀 Bulk installer for shadcn/ui components'))
    .version('1.0.0');
program
    .command('install')
    .description('Install multiple shadcn/ui components')
    .option('-a, --all', 'Install all components')
    .option('-f, --force', 'Force reinstall components even if already present')
    .action(async (options) => {
    try {
        console.log(chalk_1.default.bold.rgb(123, 104, 238)('\n🎨 shadcn/ui Bulk Installer\n'));
        // Fast project setup check
        const spinner = (0, ora_1.default)('Checking project setup...').start();
        const [isSetup, detectedPM] = await Promise.all([
            checkProjectSetup(),
            detectPackageManager()
        ]);
        if (!isSetup) {
            spinner.fail(chalk_1.default.red('Project setup incomplete'));
            console.log(chalk_1.default.red('\n❌ Error: components.json not found'));
            console.log(chalk_1.default.yellow('\nPlease run init first:'));
            console.log(chalk_1.default.gray('\n1. Choose your package manager'));
            console.log(chalk_1.default.gray('2. Run: <package-manager> dlx shadcn@latest init\n'));
            process.exit(1);
        }
        spinner.succeed(chalk_1.default.green('Project setup verified'));
        const { packageManager } = await inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'packageManager',
                message: 'Select package manager:',
                default: detectedPM,
                choices: Object.entries(exports.PACKAGE_MANAGERS).map(([name, config]) => ({
                    name: config.color(`${name}${detectedPM === name ? ' (detected)' : ''}`),
                    value: name
                }))
            }
        ]);
        const pm = exports.PACKAGE_MANAGERS[packageManager];
        let componentsToInstall = [];
        if (options.all) {
            componentsToInstall = exports.AVAILABLE_COMPONENTS;
            console.log(chalk_1.default.cyan(`\n📦 Installing all ${componentsToInstall.length} components\n`));
        }
        else {
            const answer = await inquirer_1.default.prompt([
                {
                    type: 'checkbox',
                    name: 'components',
                    message: 'Select components to install:',
                    choices: exports.AVAILABLE_COMPONENTS.map(component => ({
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
            console.log(chalk_1.default.yellow('\n⚠️  No components selected. Exiting...'));
            process.exit(0);
        }
        await batchInstallComponents(componentsToInstall, packageManager, pm);
        console.log(chalk_1.default.green('\n✨ Installation complete!'));
        console.log(chalk_1.default.cyan('\n📘 Import components from:'));
        console.log(chalk_1.default.yellow('@/components/ui/<component-name>'));
    }
    catch (error) {
        console.error(chalk_1.default.red('\n❌ Error occurred:'));
        console.error(chalk_1.default.red(error.message));
        if (error.stderr) {
            console.error(chalk_1.default.gray('\nDetails:'));
            console.error(chalk_1.default.gray(error.stderr));
        }
        process.exit(1);
    }
});
async function checkProjectSetup() {
    try {
        await promises_1.default.access('components.json');
        return true;
    }
    catch {
        return false;
    }
}
// Only parse if running as a script
if (require.main === module) {
    const program = createProgram();
    program.parse(process.argv);
}
