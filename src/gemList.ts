import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as util from './util';

const OPTIONS = { timeout: 3000 };

//
// Lists gems (as directories).
//

export const gemList = (): Promise<string[]> => {
  // find Gemfile
  const root = util.rootDir();
  if (!root) {
    return new Promise((resolve, reject) => reject());
  }

  // If we have a Gemfile, try bundle show --paths. Otherwise fallback to gem
  // env gemdir.
  const gemfile = util.findFileUp(root, 'Gemfile');
  if (gemfile) {
    return bundler(gemfile);
  }

  console.log('Gemfile not found, falling back to gem env gemdir');
  return gemenv(root);
};

//
// If we have a Gemfile, run bundle show --paths
//

const bundler = (gemfile: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    // list gems in there
    const cmd = <string>vscode.workspace.getConfiguration('bustagem').get('bundle');
    const cwd = path.dirname(gemfile);
    const options = Object.assign({}, OPTIONS, { cwd });

    console.log(`Running ${cmd} in ${cwd}...`);
    child_process.exec(cmd, options, (error: Error, stdout: string) => {
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

const gemenv = (root: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const cmd = <string>vscode.workspace.getConfiguration('bustagem').get('gem');
    const options: any = Object.assign({}, OPTIONS, { cwd: root });

    console.log(`Running ${cmd} in ${root}...`);
    child_process.exec(cmd, options, (error: Error, stdout: string) => {
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
