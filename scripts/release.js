/* eslint-disable no-await-in-loop */
const exec = require('exec-sh');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const pkg = require('../package.json');
const childPkg = require('../package/package.json');

async function release() {
  const options = await inquirer.prompt([
    {
      type: 'input',
      name: 'version',
      message: 'Version:',
      default: pkg.version,
    },
  ]);
  // Set version
  pkg.version = options.version;
  childPkg.version = options.version;

  // Copy dependencies
  childPkg.dependencies = pkg.dependencies;

  fs.writeFileSync(
    path.resolve(__dirname, '../package.json'),
    JSON.stringify(pkg, null, 2),
  );
  fs.writeFileSync(
    path.resolve(__dirname, '../package/package.json'),
    JSON.stringify(childPkg, null, 2),
  );

  const cleanPackage = [
    'rm -rf **/*.js',
    'rm -rf *.js',
    'rm -rf **/*.ts',
    'rm -rf *.ts',
    'rm -rf **/*.css',
    'rm -rf *.css',
    'rm -rf **/*.map',
    'rm -rf *.map',
    'rm -rf **/*.less',
    'rm -rf *.less',
    'rm -rf **/*.scss',
    'rm -rf *.scss',
    'rm -rf **/*.svelte',
    'rm -rf *.svelte',
  ];

  await exec.promise('git pull');
  await exec.promise('npm i');
  await exec.promise(`cd ./package && ${cleanPackage.join(' && ')}`);
  await exec.promise('npm run build:prod');
  await exec.promise('git add .');
  await exec.promise(`git commit -m "${pkg.version} release"`);
  await exec.promise('git push');
  await exec.promise(`git tag v${pkg.version}`);
  await exec.promise('git push origin --tags');

  // eslint-disable-next-line
  await exec.promise('cd ./package && npm publish');
}

release();
