#! /usr/bin/env node
const prompt = require('prompt');
const { rm } = require('fs/promises');
const { join } = require('path');
const { runScript, updateFile, installLibs } = require('./utils');
const {
  ESLINT_RC_FILE,
  PRETTIER_RC_FILE,
  DEV_DEPENDENCIES,
  DEPENDENCIES,
  APP_FILE,
  INDEX_FILE,
} = require('./constants');

async function promptForProjectName() {
  const { projectName } = await prompt.get({
    properties: {
      projectName: {
        description:
          'Enter the name of the project (must be a valid directory name):',
        pattern: /^[a-zA-Z0-9_-]+$/,
        message:
          'Project name must be alphanumeric, hyphenated or underscored.',
        required: true,
      },
    },
  });
  return projectName;
}

async function setupNextApp(projectName) {
  const script = `yarn create next-app ${projectName} --ts --eslint --src-dir --import-alias @/* --no-experimental-app`;
  return runScript(script);
}

async function removeStylesFolder() {
  const stylesFolderPath = join(process.cwd(), 'src/styles');
  try {
    await rm(stylesFolderPath, { recursive: true });
    console.log(`Removed the 'styles' folder and its contents.`);
  } catch (error) {
    console.error(
      `Failed to remove the 'styles' folder and its contents: ${error}`
    );
  }
}

async function run() {
  try {
    let projectName;
    if (process.argv.length > 2) {
      projectName = process.argv[2];
      console.log(`Using provided project name: ${projectName}`);
    } else {
      projectName = await promptForProjectName();
    }

    await setupNextApp(projectName);
    console.log('Next.js app setup completed successfully.');

    process.chdir(projectName);

    // await installChakra();
    await installLibs(DEPENDENCIES);
    // await setupDevDependencies();
    await installLibs(DEV_DEPENDENCIES, true);
    console.log('Additional libraries installed.');

    // await createPrettierRC();
    await updateFile('./.prettierrc.js', PRETTIER_RC_FILE);
    // await overwriteESLintRC();
    await updateFile('./.eslintrc.json', ESLINT_RC_FILE);
    console.log('Added linting configurations');

    // await setupHusky();
    await runScript('npx husky-init');
    console.log('Pre-commit checks setup complete');

    await removeStylesFolder(projectName);
    // await overwriteAppFile();
    await updateFile('./src/pages/_app.tsx', APP_FILE);
    // await overwriteIndexFile();
    await updateFile('./src/pages/index.tsx', INDEX_FILE);
    // await fixListErrors();
    runScript('yarn lint --fix');
    console.log('Updated files');
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

run();
