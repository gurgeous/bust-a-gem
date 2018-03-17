import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

//
// Main extension class that stores our state. This gets initalized once per
// editor, then hangs around as a singleton.
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

  constructor() {
    const rootPath = vscode.workspace.rootPath;
    if (!rootPath) {
      throw new Error('you must open a directory (not a file)');
    }
    this.rootPath = rootPath;
    if (!fs.existsSync(path.join(rootPath, 'Gemfile'))) {
      throw new Error('only works if you have a Gemfile in your project');
    }
  }

  // path to rootPath/TAGS
  get tagsFile() {
    if (!this._tagsFile) {
      this._tagsFile = path.join(this.rootPath, 'TAGS');
    }
    return this._tagsFile;
  }
  private _tagsFile: string | undefined;
}
