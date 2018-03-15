const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('./util');
const vscode = require('vscode');

const OPTIONS = { timeout: 3000 };

//
// main command
//

const openGem = () => {
  // find Gemfile
  let gemfile;
  const root = util.rootDir();
  if (root) {
    gemfile = util.findFileUp(root, 'Gemfile');
  }

  // If we have a Gemfile, try bundle show --paths. Otherwise fallback to gem
  // env gemdir.
  if (gemfile) {
    bundler(gemfile);
  } else {
    console.log('Gemfile not found, falling back to gem env gemdir');
    gemenv(root);
  }
};
module.exports = openGem;

//
// If we have a Gemfile, run bundle show --paths
//

const bundler = gemfile => {
  // list gems in there
  const cmd = vscode.workspace.getConfiguration('bustagem').get('bundle');
  const cwd = path.dirname(gemfile);
  const options = Object.assign({}, OPTIONS, { cwd });

  console.log(`Running ${cmd} in ${cwd}...`);
  cp.exec(cmd, options, (error, stdout) => {
    try {
      if (error) {
        throw error;
      }

      const dirs = stdout.trim().split('\n');
      if (dirs.length === 0) {
        throw new Error(`${cmd} didn't return anything.`);
      }
      util.quickPickDirs(dirs);
    } catch (error) {
      vscode.window.showErrorMessage(`Bust-A-Gem: ${error.message}`);
    }
  });
};

//
// Fallback to gem env gemdir
//

const gemenv = root => {
  // list gems in there
  const cmd = vscode.workspace.getConfiguration('bustagem').get('gem');
  const options = Object.assign({}, OPTIONS);
  if (root) {
    options.cwd = root;
  }

  console.log(`Running ${cmd} in ${root}...`);
  cp.exec(cmd, options, (error, stdout) => {
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
      util.quickPickDirs(dirs);
    } catch (error) {
      vscode.window.showErrorMessage(`Bust-A-Gem: ${error.message}`);
    }
  });
};
