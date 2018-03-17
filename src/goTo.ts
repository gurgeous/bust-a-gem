import * as etags from './etags';
import * as fs from 'fs';
import * as path from 'path';
import * as util from './util';
import * as vscode from 'vscode';

import BustAGem from './bustAGem';
import Gem from './gem';

// in-memory state
let data: etags.Etags;

//
// main command, wraps helper with try/catch
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
// helper that can throw exceptions
//

const provideDefinition0 = async (
  document: vscode.TextDocument,
  position: vscode.Position
): Promise<vscode.Definition> => {
  // rip & load if necessary
  const bustAGem = BustAGem.singleton();
  if (!data || data.file !== bustAGem.tagsFile) {
    if (!fs.existsSync(bustAGem.tagsFile)) {
      await rip(bustAGem);
    }
    data = await etags.load(bustAGem.tagsFile);
  }

  // query
  const query = document.getText(document.getWordRangeAtPosition(position));
  const tags = data.tags.get(query);
  if (!tags) {
    return [];
  }

  // return results
  return tags.map(tag => {
    const file = path.join(bustAGem.rootPath, tag.file);
    return new vscode.Location(vscode.Uri.file(file), new vscode.Position(tag.line - 1, 0));
  });
};

const rip = async (bustAGem: BustAGem) => {
  const dirs = ['.'];

  //
  // append dirs from bustagem.gems
  //

  const gemNames = <string[]>vscode.workspace.getConfiguration('bustagem').get('gems');
  if (gemNames.length > 0) {
    const map = new Map<string, Gem>();
    const gems = await Gem.list(bustAGem.rootPath);
    for (const gem of gems) {
      map.set(gem.label, gem);
      map.set(gem.labelWithoutVersion, gem);
    }
    for (const name of gemNames) {
      const g = map.get(name);
      if (!g) {
        throw new Error(`couldn't find gem ${name} in list of gems for project`);
      }
      dirs.push(g.dir);
    }
  }

  //
  // rip!
  //

  const cmd = <string>vscode.workspace.getConfiguration('bustagem.cmd').get('rip');
  const escapedDirs = dirs.map(i => `${i}`);
  const fullCommand = `${cmd} ${escapedDirs.join(' ')}`;

  const options = { cwd: bustAGem.rootPath };

  const tm = new Date().getTime();
  await util.exec(fullCommand, options);
  const elapsed = new Date().getTime() - tm;
  console.log(`rip took ${elapsed}ms`);
};

export const rebuild = () => {
  console.log('rebuild');
};
