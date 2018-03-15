const cp = require('child_process');
const etags = require('./etags');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const util = require('./util');
const vscode = require('vscode');

//
// main command
//

const provideDefinition = (document, position) => {
  const query = document.getText(document.getWordRangeAtPosition(position));

  return new Promise((resolve, reject) => {
    //
    // find tags
    //

    const root = util.rootDir();
    if (!root) {
      reject();
    }
    const gemfile = util.findFileUp(root, 'Gemfile');
    if (!gemfile) {
      vscode.window.showErrorMessage(
        'Bust-A-Gem: Go To Definition only works if you have a Gemfile in your project.'
      );
      reject();
    }

    const tagsFile = path.join(path.dirname(gemfile), 'TAGS');
    if (!fs.existsSync(tagsFile)) {
      vscode.window.showErrorMessage(`Bust-A-Gem: ${tagsFile} does not exist.`);
      reject();
    }

    //
    // load tags
    //

    etags(tagsFile).then(
      etags => {
        const tags = etags.tags.get(query);
        const locations = tags.map(tag => {
          console.log(tag);
          const file = path.join(root, tag.file);
          return new vscode.Location(vscode.Uri.file(file), new vscode.Position(tag.line - 1, 0));
        });
        resolve(locations);
      },
      error => {
        vscode.window.showErrorMessage(`Bust-A-Gem: ${error.message}`);
        reject();
      }
    );
  });
};

const goToDefinition = { provideDefinition };
module.exports = goToDefinition;

// block ; time ripper-tags -f TAGS -R . /Users/amd/.rbenv/versions/2.5.0/lib/ruby/gems/2.5.0/gems/activerecord-5.1.5 /Users/amd/.rbenv/versions/2.5.0/lib/ruby/gems/2.5.0/gems/nokogiri-1.8.2

// build tags for project
// build tags for gems (if set in config)
// load (or reload) tags
