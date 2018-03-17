import { Etags } from './etags';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as util from './util';
import * as vscode from 'vscode';
import BustAGem from './bustAGem';
import Gem from './gem';

//
// main command, wraps provideDefinition0 with try/catch
//

const provideDefinition = async (
  document: vscode.TextDocument,
  position: vscode.Position
): Promise<vscode.Definition> => {
  try {
    return await provideDefinition0(document, position);
  } catch (error) {
    vscode.window.showErrorMessage(`Bust-A-Gem: ${error.message}`);
    return [];
  }
};
export const goTo = { provideDefinition };

//
// this is it
//

const provideDefinition0 = async (
  document: vscode.TextDocument,
  position: vscode.Position
): Promise<vscode.Definition> => {
  const bustAGem = BustAGem.singleton();

  // rip & load if necessary
  if (!bustAGem.etags) {
    if (!fs.existsSync(bustAGem.tagsFile)) {
      await rip(bustAGem);
    }

    const tm = _.now();
    const etags = new Etags(bustAGem.tagsFile);
    await etags.load();
    bustAGem.etags = etags;
    console.log(`loaded TAGS in ${_.now() - tm}ms`);
  }

  // query
  const query = document.getText(document.getWordRangeAtPosition(position));
  return bustAGem.etags.provideDefinition(query);
};

//
// Run ripper-tags to create TAGS file.
//

const rip = async (bustAGem: BustAGem) => {
  // get dirs
  const unescapedDirs = await dirsToRip(bustAGem);
  const dirs = unescapedDirs.map(i => `'${i}'`);

  // go!
  const tm = _.now();
  const rip = <string>vscode.workspace.getConfiguration('bustagem.cmd').get('rip');
  const cmd = `${rip} ${dirs.join(' ')}`;
  await util.exec(cmd, { cwd: bustAGem.rootPath });
  console.log(`rip took ${_.now() - tm}ms`);
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

export const rebuild = () => {
  console.log('rebuild');
};
