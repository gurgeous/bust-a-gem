import * as etags from './etags';
import * as fs from 'fs';
import * as path from 'path';
import * as util from './util';
import * as vscode from 'vscode';

// TODO
//
// config for gems to index
// turn gem names into gem dirs
// status bar status
// great error handling (ripper-tags, bad gem names, escaping, etc.)
// reload
// README
// release

// state
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
  // where is the TAGS file?
  const tagsFile = findTagsFile();

  // create/load if necessary
  if (!data || data.file !== tagsFile) {
    if (!fs.existsSync(tagsFile)) {
      await createTagsFile(tagsFile);
    }
    data = await etags.load(tagsFile);
  }

  // query
  const query = document.getText(document.getWordRangeAtPosition(position));
  const tags = data.tags.get(query);
  if (!tags) {
    return [];
  }

  // return results
  return tags.map(tag => {
    const root = path.dirname(data.file);
    const file = path.join(root, tag.file);
    return new vscode.Location(vscode.Uri.file(file), new vscode.Position(tag.line - 1, 0));
  });
};

// path to TAGS file for this project or currently open file
const findTagsFile = (): string => {
  const root = util.rootDir();
  const gemfile = util.findFileUp(root, 'Gemfile');
  if (!gemfile) {
    throw new Error('Go To Definition only works if you have a Gemfile in your project.');
  }
  return path.join(path.dirname(gemfile), 'TAGS');
};

const createTagsFile = async (tagsFile: string) => {
  const cmd = <string>vscode.workspace.getConfiguration('bustagem').get('rip');
  const cwd = path.dirname(tagsFile);
  const options = { cwd };

  const dirs = [
    '.',
    '/Users/amd/.rbenv/versions/2.5.0/lib/ruby/gems/2.5.0/gems/activerecord-5.1.5',
    '/Users/amd/.rbenv/versions/2.5.0/lib/ruby/gems/2.5.0/gems/nokogiri-1.8.2',
  ];
  const escapedDirs = dirs.map(i => `${i}`);
  const fullCommand = `${cmd} ${escapedDirs.join(' ')}`;

  const tm = new Date().getTime();
  await util.exec(fullCommand, options);
  const elapsed = new Date().getTime() - tm;
  console.log(`rip took ${elapsed}ms`);
