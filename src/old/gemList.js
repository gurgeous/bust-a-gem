const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const vscode = require('vscode');
const util = require('./util');

const OPTIONS = { timeout: 3000 };

//
// Lists gems (as directories).
//

const gemList = () => {
  // find Gemfile
  let gemfile;
  const root = util.rootDir();
  if (root) {
    gemfile = util.findFileUp(root, 'Gemfile');
  }

  // If we have a Gemfile, try bundle show --paths. Otherwise fallback to gem
  // env gemdir.
  if (gemfile) {
    return bundler(gemfile);
  }

  console.log('Gemfile not found, falling back to gem env gemdir');
  return gemenv(root);
};

//
// If we have a Gemfile, run bundle show --paths
//

const bundler = gemfile => {
  return new Promise((resolve, reject) => {
    // list gems in there
    const cmd = vscode.workspace.getConfiguration('bustagem').get('bundle');
    const cwd = path.dirname(gemfile);
    const options = Object.assign({}, OPTIONS, { cwd });

    console.log(`Running ${cmd} in ${cwd}...`);
    child_process.exec(cmd, options, (error, stdout) => {
      try {
        if (error) {
          throw error;
        }

        const dirs = stdout.trim().split('\n');
        if (dirs.length === 0) {
          throw new Error(`${cmd} didn't return anything.`);
        }
        resolve(dirs);
      } catch (error) {
        reject(error);
      }
    });
  });
};

//
// Fallback to gem env gemdir
//

const gemenv = root => {
  return new Promise((resolve, reject) => {
    const cmd = vscode.workspace.getConfiguration('bustagem').get('gem');
    const options = Object.assign({}, OPTIONS);
    if (root) {
      options.cwd = root;
    }

    console.log(`Running ${cmd} in ${root}...`);
    child_process.exec(cmd, options, (error, stdout) => {
      try {
        if (error) {
          throw error;
        }

        const gemdir = stdout.trim();
        if (!gemdir) {
          throw new Error(`${cmd} didn't return anything.`);
        }

        const gemdirGems = `${gemdir}/gems`;
        const dirs = fs.readdirSync(gemdirGems);
        if (dirs.length === 0) {
          throw new Error(`${gemdirGems} seems to be empty.`);
        }
        resolve(dirs);
      } catch (error) {
        reject(error);
      }
    });
  });
};

module.exports = gemList;
