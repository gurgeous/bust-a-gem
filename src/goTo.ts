import { Etags } from './etags';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as util from './util';
import * as vscode from 'vscode';
import BustAGem from './bustAGem';
import Gem from './gem';

const SILENCE = 'silence!';

// Are we already running? We avoid being reentrant because it can do nasty
// things like ripping TAGS twice simultaneously.
let running = false;

//
// main provideDefinition, wraps provideDefinition0 with try/catch and running
// guard
//

const provideDefinition = async (
  document: vscode.TextDocument,
  position: vscode.Position
): Promise<vscode.Definition> => {
  if (running) {
    vscode.window.showInformationMessage(`Bust-A-Gem: rip in progress, please wait`);
    return [];
  }
  running = true;

  try {
    const result = await provideDefinition0(document, position);
    running = false;
    return result;
  } catch (error) {
    running = false;

    // silent failure?
    if (error.message === SILENCE) {
      return [];
    }

    console.error(error);
    vscode.window.showErrorMessage(`Bust-A-Gem: ${error.message}`);
    return [];
  }
};
export const goTo = { provideDefinition };

//
// Manually rebuild tags. Users do this periodically. Includes running guard.
//

export const rebuild = async () => {
  if (running) {
    vscode.window.showInformationMessage(`Bust-A-Gem: rip in progress, please wait`);
    return [];
  }
  running = true;

  try {
    const bustAGem = BustAGem.singleton();
    bustAGem.etags = undefined;
    await rip(bustAGem);
    running = false;
  } catch (error) {
    running = false;

    // silent failure?
    if (error.message === SILENCE) {
      return [];
    }

    console.error(error);
    vscode.window.showErrorMessage(`Bust-A-Gem: ${error.message}`);
  }
};

//
// provide definition
//

const provideDefinition0 = async (
  document: vscode.TextDocument,
  position: vscode.Position
): Promise<vscode.Definition> => {
  const bustAGem = BustAGem.singleton();

  if (!bustAGem.etags) {
    // rip (can be slow)
    if (!fs.existsSync(bustAGem.tagsFile)) {
      await rip(BustAGem.singleton());
    }

    // load (quite fast)
    const etags = new Etags(bustAGem.tagsFile);
    await etags.load();
    bustAGem.etags = etags;
  }

  // query
  const query = document.getText(document.getWordRangeAtPosition(position));
  return bustAGem.etags.provideDefinition(query);
};

//
// Run ripper-tags to create TAGS file.
//

let lastInstallWarning = 0;

const rip = async (bustAGem: BustAGem) => {
  // get dirs
  const unescapedDirs = await dirsToRip(bustAGem);
  const dirs = unescapedDirs.map(i => `'${i}'`);

  // go!
  const rip = <string>vscode.workspace.getConfiguration('bustagem.cmd').get('rip');
  const cmd = `${rip} ${dirs.join(' ')}`;

  const progressOptions = {
    location: vscode.ProgressLocation.Window,
    title: 'Bust-A-Gem ripping...',
  };

  const tm = _.now();
  await vscode.window.withProgress(progressOptions, async () => {
    try {
      await util.exec(cmd, { cwd: bustAGem.rootPath });
    } catch (error) {
      // show a nice error about ripper-tags, but not too often
      if (error.message.match(/command not found/)) {
        const now = _.now();
        if (now - lastInstallWarning < 60 * 60 * 1000) {
          throw new Error(SILENCE);
        }
        lastInstallWarning = now;
        throw new Error('Go To Definition requires the ripper-tags gem.');
      }

      throw error;
    }
  });
  console.log(`ripper-tags took ${_.now() - tm}ms`);
};

//
// Get list of dirs to rip when creating TAGS. In order to do this we have to
// take gem names from the bustagem.gems setting and turn them into directories
// to rip.
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
