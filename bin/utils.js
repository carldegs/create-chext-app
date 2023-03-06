#! /usr/bin/env node
const { spawn } = require('child_process');
const { writeFile } = require('fs/promises');

async function runScript(script) {
  const child = spawn(script, { shell: true });
  child.stdout.on('data', (data) => {
    console.log(`${data}`);
  });
  child.stderr.on('data', (data) => {
    console.error(`${data}`);
  });
  try {
    await new Promise((resolve, reject) => {
      child.on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
          console.error(`Command failed with exit code ${code}`);
          reject(new Error(`Command failed with exit code ${code}`));
        }
      });
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

async function installLibs(libs = [], isDevDep = false) {
  const script = `yarn add ${isDevDep ? '--dev ' : ''}${libs.join(' ')}`;
  return runScript(script);
}

async function updateFile(path, content) {
  await writeFile(path, content);
  console.log(`${path} has been updated successfully.`);
}

module.exports = {
  runScript,
  updateFile,
  installLibs,
};
