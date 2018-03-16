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

export const rootDir = (): string | null => {
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
  vscode.window.showErrorMessage('Bust-A-Gem: you have to open a file or project first.');
  return null;
};
