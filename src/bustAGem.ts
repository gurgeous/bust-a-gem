import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { Etags } from './etags';

//
// A helper class that stores our state as a singleton. Once initialized it
// never goes away. This also enforces our requirement to only work with
// projects and Gemfiles.
//

export default class BustAGem {
  // singleton
  static singleton(): BustAGem {
    if (!this._singleton) {
      this._singleton = new BustAGem();
    }
    return this._singleton;
  }
  static _singleton: BustAGem | undefined;

  // vscode.workspace.rootPath
  readonly rootPath: string;

  // etags state
  etags: Etags | null = null;

  private constructor() {
    const rootPath = vscode.workspace.rootPath;
    if (!rootPath) {
      throw new Error('you must open a directory, not a file.');
    }
    this.rootPath = rootPath;
    if (!fs.existsSync(path.join(rootPath, 'Gemfile'))) {
      throw new Error('only works if you have a Gemfile in your project.');
    }
  }
}
