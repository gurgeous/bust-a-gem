import * as _ from 'lodash';
import * as fs from 'fs';
import * as path from 'path';
import * as util from './util';
import * as vscode from 'vscode';

import { Etags } from './etags';
import { NoWhine } from './noWhine';
import { Gem } from './gem';

//
// This class handles Go to Definition and Rebuild.
//

export class GoTo implements vscode.DefinitionProvider {
  // Are we already running? We strive to avoid being reentrant because it will
  // result in nasty things like ripping TAGS twice simultaneously.
  running = false;

  // used to prevent excessive whining about ripper-tags not found
  readonly noWhine = new NoWhine();

  // currently loaded tags
  etags: Etags | null = null;

  //
  // This generic helper function wraps something else and provides a few services:
  //
  //   * prevents reentrancy
  //   * reports errors
  //

  guard = async (returnOnError: any, f: () => Promise<any>): Promise<any> => {
    let result = returnOnError;

    // guard against running twice
    if (this.running) {
      return result;
    }
    this.running = true;

    try {
      result = await f();
    } catch (error) {
      let message = error.message;

      if (message.match(/command not found/)) {
        this.noWhine.onError();
        message =
          'ripper-tags not found (see [Installation](https://marketplace.visualstudio.com/items?itemName=gurgeous.bust-a-gem#user-content-installation)).';
      }

      if (!util.isQuiet) {
        console.error(error);
      }
      vscode.window.showErrorMessage(`Bust-A-Gem: ${message}`);
    }

    this.running = false;
    return result;
  };

  get rootPath(): string {
    return <string>vscode.workspace.rootPath;
  }

  //
  // Go To Definition entry point.
  //

  provideDefinition = async (
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<vscode.Definition> => {
    // Try not to whine about ripper-tags too often.
    if (this.noWhine.tooSoon()) {
      return [];
    }

    return await this.guard([], async () => {
      // similar to standard Ruby wordPattern, but allow :
      const wordPattern = /(:?[A-Za-z][^-`~@#%^&()=+[{}|;'",<>/.*\]\s\\!?]*[!?]?)/;
      const query = document.getText(document.getWordRangeAtPosition(position, wordPattern));
      return await this.provideDefinition0(query);
    });
  };

  //
  // Rebuild entry point. Users invoke this manually when TAGS gets out of date.
  // Includes running guard. It wraps rip with a guard, which does a few things
  // for us - reports errors, makes sure we aren't already running, etc.
  //

  rebuild = async () => {
    // This is a good time to start whining again.
    this.noWhine.reset();

    this.guard(undefined, async () => {
      this.etags = null;
      await this.rip(false);
    });
  };

  //
  // internal provide definition
  //

  provideDefinition0 = async (query: string): Promise<vscode.Definition> => {
    //
    // rip/load if necessary
    //

    if (!this.etags) {
      const tagsFile = path.join(this.rootPath, 'TAGS');

      // rip (can be slow)
      if (!fs.existsSync(tagsFile)) {
        await this.rip(true);
      }

      // load (quite fast)
      const etags = new Etags(tagsFile);
      await etags.load();
      this.etags = etags;
    }

    // now query
    return this.etags.provideDefinition(query);
  };

  //
  // Run ripper-tags to create TAGS file.
  //

  rip = async (failSilently: boolean) => {
    // get dirs to rip from config
    const unescapedDirs = await this.dirsToRip();
    const dirs = unescapedDirs.map(i => `'${i}'`);

    // get ready
    const rip = <string>vscode.workspace.getConfiguration('bustagem.cmd').get('rip');
    const cmd = `${rip} ${dirs.join(' ')}`;

    const progressOptions = {
      location: vscode.ProgressLocation.Window,
      title: 'Bust-A-Gem ripping...',
    };

    await vscode.window.withProgress(progressOptions, async () => {
      await util.exec(cmd, { cwd: this.rootPath });
    });
  };

  //
  // Get list of dirs to rip when creating TAGS. We take gem names from the
  // bustagem.gems config and turn them into directories to rip.
  //

  dirsToRip = async (): Promise<string[]> => {
    const dirs = ['.'];
    const gemNames = <string[]>vscode.workspace.getConfiguration('bustagem').get('gems');
    if (gemNames.length !== 0) {
      const gems = await Gem.list();
      const map = Object.assign(_.keyBy(gems, 'label'), _.keyBy(gems, 'labelWithoutVersion'));
      for (const name of gemNames) {
        const g = map[name];
        if (!g) {
          // bad gem name - not fatal
          vscode.window.showWarningMessage(
            `you asked me to index gem '${name}', but I can't find it. Skipping.`
          );
          continue;
        }
        dirs.push(g.dir);
      }
    }
    return dirs;
  };
}
