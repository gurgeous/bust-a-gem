import * as _ from 'lodash';
import * as fs from 'fs';
import * as path from 'path';
import * as util from './util';
import * as vscode from 'vscode';

import BustAGem from './bustAGem';
import { Etags } from './etags';
import Gem from './gem';

//
// This file handles Go to Definition and Rebuild.
//

//
// VS Code can call provideDefinition quite aggressively, so bail right away if
// we showed an error recently. Try not to be annoying.
//

class NoWhine {
  // When did we last show the 'ripper-tags not found' error?
  private errorAt = 0;

  // reset when the user rebuilds
  reset() {
    this.errorAt = 0;
  }

  // should we bail early because an error occurred recently?
  tooSoon() {
    return _.now() - this.errorAt < util.seconds(10);
  }

  // note that an install error occurred
  onError() {
    this.errorAt = _.now();
  }
}

let noWhine = new NoWhine();

//
// Go To Definition entry point. It wraps provideDefinition0 with a guard, which
// does a few things for us - reports errors, makes sure we aren't already
// running, etc.
//

const provideDefinition = async (
  document: vscode.TextDocument,
  position: vscode.Position
): Promise<vscode.Definition> => {
  // Try not to whine about ripper-tags too often.
  if (noWhine.tooSoon()) {
    return [];
  }

  return await guard<vscode.Definition>([], async () => {
    const query = document.getText(document.getWordRangeAtPosition(position));
    return await provideDefinition0(query);
  });
};
export const goTo = { provideDefinition };

//
// Rebuild entry point. Users invoke this manually when TAGS gets out of date.
// Includes running guard. It wraps rip with a guard, which does a few things
// for us - reports errors, makes sure we aren't already running, etc.
//

export const rebuild = async () => {
  // This is a good time to start whining again.
  noWhine.reset();

  guard(undefined, async () => {
    const bustAGem = BustAGem.singleton();
    bustAGem.etags = null;
    await rip(bustAGem, false);
  });
};

//
// provide definition
//

const provideDefinition0 = async (query: string): Promise<vscode.Definition> => {
  //
  // rip/load if necessary
  //

  const bustAGem = BustAGem.singleton();
  if (!bustAGem.etags) {
    const tagsFile = path.join(bustAGem.rootPath, 'TAGS');

    // rip (can be slow)
    if (!fs.existsSync(tagsFile)) {
      await rip(BustAGem.singleton(), true);
    }

    // load (quite fast)
    const etags = new Etags(tagsFile);
    await etags.load();
    bustAGem.etags = etags;
  }

  // now query
  return bustAGem.etags.provideDefinition(query);
};

//
// Run ripper-tags to create TAGS file.
//

const rip = async (bustAGem: BustAGem, failSilently: boolean) => {
  // get dirs to rip from config
  const unescapedDirs = await dirsToRip(bustAGem);
  const dirs = unescapedDirs.map(i => `'${i}'`);

  // get ready
  const tm = _.now();
  const rip = <string>vscode.workspace.getConfiguration('bustagem.cmd').get('rip');
  const cmd = `${rip} ${dirs.join(' ')}`;

  const progressOptions = {
    location: vscode.ProgressLocation.Window,
    title: 'Bust-A-Gem ripping...',
  };

  await vscode.window.withProgress(progressOptions, async () => {
    await util.exec(cmd, { cwd: bustAGem.rootPath });
  });
  console.log(`ripper-tags success ${_.now() - tm}ms`);
};

//
// Get list of dirs to rip when creating TAGS. We take gem names from the
// bustagem.gems config and turn them into directories to rip.
//

const dirsToRip = async (bustAGem: BustAGem): Promise<string[]> => {
  const dirs = ['.'];
  const gemNames = <string[]>vscode.workspace.getConfiguration('bustagem').get('gems');
  if (gemNames.length !== 0) {
    const gems = await Gem.list(bustAGem.rootPath);
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

// Are we already running? We strive to avoid being reentrant because it will
// result in nasty things like ripping TAGS twice simultaneously.
let running = false;

//
// This generic helper function wraps something else and provides a few services:
//
//   * prevents reentrancy
//   * reports errors
//

async function guard<T>(returnOnError: T, f: () => Promise<T>): Promise<T> {
  let result = returnOnError;

  // guard against running twice
  if (running) {
    return result;
  }
  running = true;

  try {
    result = await f();
  } catch (error) {
    let message = error.message;

    if (message.match(/command not found/)) {
      noWhine.onError();
      message =
        'ripper-tags not found (see [Installation](https://marketplace.visualstudio.com/items?itemName=gurgeous.bust-a-gem#user-content-installation)).';
    }

    console.error(error);
    vscode.window.showErrorMessage(`Bust-A-Gem: ${message}`);
  }

  running = false;
  return result;
}
