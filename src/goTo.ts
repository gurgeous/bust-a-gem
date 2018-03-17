import { Etags } from './etags';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as path from 'path';
import * as util from './util';
import * as vscode from 'vscode';
import BustAGem from './bustAGem';
import Gem from './gem';

//
// This file handles Go to Definition and Rebuild.
//

// Typically we report error messages to the user loudly. This will be annoying
// if VS Code is calling Go To Definition frequently and ripper-tags isn't
// installed. This special quiet error class tells the caller not to say
// anything to the user.
class QuietError extends Error {}

//
// Go To Definition entry point. It wraps provideDefinition0 with a guard, which
// does a few things for us - reports errors, makes sure we aren't already
// running, etc.
//

const provideDefinition = async (
  document: vscode.TextDocument,
  position: vscode.Position
): Promise<vscode.Definition> => {
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

// When did we last whine about ripper-tags?
let lastInstallWarning = 0;

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
    try {
      // go!
      await util.exec(cmd, { cwd: bustAGem.rootPath });
    } catch (error) {
      // whine about ripper-tags, but not too often
      if (error.message.match(/command not found/)) {
        if (failSilently) {
          const WHINE_EVERY = 60 * 60 * 1000;
          if (_.now() - lastInstallWarning < WHINE_EVERY) {
            throw new QuietError();
          }
        }
        lastInstallWarning = _.now();
        throw new Error('Go To Definition requires the ripper-tags gem.');
      }

      throw error;
    }
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
        throw new Error(`couldn't find gem ${name} in gem list`);
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
//   * handles QuietError
//

async function guard<T>(returnOnError: T, f: () => Promise<T>): Promise<T> {
  let result = returnOnError;

  // guard against running twice
  if (running) {
    vscode.window.showInformationMessage(`Bust-A-Gem: rip in progress, please wait`);
    return result;
  }
  running = true;

  try {
    result = await f();
  } catch (error) {
    // report an error if not quiet
    if (!(error instanceof QuietError)) {
      console.error(error);
      vscode.window.showErrorMessage(`Bust-A-Gem: ${error.message}`);
    }
  }

  running = false;
  return result;
}
