import * as etags from './etags';
import * as fs from 'fs';
import * as path from 'path';
import * as util from './util';
import * as vscode from 'vscode';

//
// main command
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

const provideDefinition0 = async (
  document: vscode.TextDocument,
  position: vscode.Position
): Promise<vscode.Definition> => {
  //
  // find TAGS file
  //

  const root = util.rootDir();
  const gemfile = util.findFileUp(root, 'Gemfile');
  if (!gemfile) {
    throw new Error('Go To Definition only works if you have a Gemfile in your project.');
  }

  const tagsFile = path.join(path.dirname(gemfile), 'TAGS');
  if (!fs.existsSync(tagsFile)) {
    throw new Error(`${tagsFile} does not exist.`);
  }

  //
  // load tags
  //

  const et = await etags.load(tagsFile);

  //
  // query
  //

  const query = document.getText(document.getWordRangeAtPosition(position));
  const tags = et.tags.get(query);
  if (!tags) {
    return [];
  }

  //
  // return results
  //

  return tags.map(tag => {
    const file = path.join(root, tag.file);
    return new vscode.Location(vscode.Uri.file(file), new vscode.Position(tag.line - 1, 0));
  });
};

const goToDefinition: vscode.DefinitionProvider = { provideDefinition };
export default goToDefinition;

// block ; time ripper-tags -f TAGS -R . /Users/amd/.rbenv/versions/2.5.0/lib/ruby/gems/2.5.0/gems/activerecord-5.1.5 /Users/amd/.rbenv/versions/2.5.0/lib/ruby/gems/2.5.0/gems/nokogiri-1.8.2

// build tags for project
// build tags for gems (if set in config)
// load (or reload) tags
