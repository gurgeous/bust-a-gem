import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

//
// Look in dir and parents for filename. Returns full path when found.
//

export const findFileUp = (dir: string, filename: string): string | null => {
  const maybe = path.join(dir, filename);
  if (fs.existsSync(maybe)) {
    return maybe;
  }

  const parent = path.dirname(dir);
  if (parent && parent !== dir) {
    return findFileUp(parent, filename);
  }

  // failure
  return null;
};

//
// Find root dir for current project or file.
//

export const rootDir = (): string => {
  // is a project open? use that
  if (vscode.workspace.rootPath) {
    return vscode.workspace.rootPath;
  }

  // which file is active?
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    return path.dirname(editor.document.fileName);
  }

  // failure
  throw new Error('you have to open a file or project first.');
};

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
