import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export interface BustAGem {
  // vscode.workspace.rootPath
  rootPath: string;
  // path to TAGS file (rootPath/TAGS)
  tagsPath: string;
}

//
// Init the extension with sanity checks.
//

export const init = (): BustAGem => {
  const rootPath = vscode.workspace.rootPath;
  if (!rootPath) {
    throw new Error('you have to open a folder (not a file)');
  }
  if (!fs.existsSync(path.join(rootPath, 'Gemfile'))) {
    throw new Error('only works if you have a Gemfile in your project');
  }
  const tagsPath = path.join(rootPath, 'TAGS');
  return { rootPath, tagsPath };
};

//
// Promise wrapper around child_process.exec
//

export const exec = (command: string, options: child_process.ExecOptions): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (options.cwd) {
      console.log(`Running ${command} in ${options.cwd}...`);
    } else {
      console.log(`Running ${command}...`);
    }
    child_process.exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
};
