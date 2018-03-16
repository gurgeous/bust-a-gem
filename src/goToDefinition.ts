import * as etags from './etags';
import * as fs from 'fs';
import * as gem from './gem';
import * as path from 'path';
import * as util from './util';
import * as vscode from 'vscode';

// TODO
//
// status bar
// reload / rebuild
// great error handling (ripper-tags, bad gem names, escaping, etc.)
// detect if gem list is out of date or Gemfile.lock changed
// README
// release
//

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

const goToDefinition: vscode.DefinitionProvider = { provideDefinition };
export default goToDefinition;

//
// helper that can throw exceptions
//

const provideDefinition0 = async (
  document: vscode.TextDocument,
  position: vscode.Position
): Promise<vscode.Definition> => {
  const bg = util.init();

  // rip & load if necessary
  if (!data || data.file !== bg.tagsPath) {
    if (!fs.existsSync(bg.tagsPath)) {
      await rip(bg);
    }
    data = await etags.load(bg.tagsPath);
  }

  // query
  const query = document.getText(document.getWordRangeAtPosition(position));
  const tags = data.tags.get(query);
  if (!tags) {
    return [];
  }

  // return results
  return tags.map(tag => {
    const file = path.join(bg.rootPath, tag.file);
    return new vscode.Location(vscode.Uri.file(file), new vscode.Position(tag.line - 1, 0));
  });
};

const rip = async (bg: util.BustAGem) => {
  const dirs = ['.'];

  //
  // append dirs from bustagem.gems
  //

  const gemNames = <string[]>vscode.workspace.getConfiguration('bustagem').get('gems');
  if (gemNames.length > 0) {
    const map = new Map<string, gem.Gem>();
    const gems = await gem.list(bg.rootPath);
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

  const options = { cwd: bg.rootPath };

  const tm = new Date().getTime();
  await util.exec(fullCommand, options);
  const elapsed = new Date().getTime() - tm;
  console.log(`rip took ${elapsed}ms`);
};
