import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as util from './util';

const OPTIONS = { timeout: 3000 };

//
// Lists gems (as directories).
//

export const gemList = async (): Promise<string[]> => {
  // find Gemfile
  const root = util.rootDir();
  const gemfile = util.findFileUp(root, 'Gemfile');

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

const bundler = async (gemfile: string): Promise<string[]> => {
  // list gems in there
  const cmd = <string>vscode.workspace.getConfiguration('bustagem').get('bundle');
  const cwd = path.dirname(gemfile);
  const options = Object.assign({}, OPTIONS, { cwd });

  const stdout = await util.exec(cmd, options);
  const dirs = stdout.trim().split('\n');
  if (dirs.length === 0) {
    throw new Error(`${cmd} didn't return anything.`);
  }
  return dirs;
};

//
// Fallback to gem env gemdir
//

const gemenv = async (root: string): Promise<string[]> => {
  const cmd = <string>vscode.workspace.getConfiguration('bustagem').get('gem');
  const options: any = Object.assign({}, OPTIONS, { cwd: root });

  const stdout = await util.exec(cmd, options);
  const gemdir = stdout.trim();
  if (!gemdir) {
    throw new Error(`${cmd} didn't return anything.`);
  }

  const gemdirGems = `${gemdir}/gems`;
  const dirs = fs.readdirSync(gemdirGems);
  if (dirs.length === 0) {
    throw new Error(`${gemdirGems} seems to be empty.`);
  }
  return dirs;
};
