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

const provideDefinition = (document, position, token) => {
  //
  // find tags
  //

  const root = util.rootDir();
  if (!root) {
    return;
  }
  const gemfile = util.findFileUp(root, 'Gemfile');
  if (!gemfile) {
    vscode.window.showErrorMessage(
      'Bust-A-Gem: Go To Definition only works if you have a Gemfile.'
    );
    return;
  }

  const tagsPath = path.join(path.dirname(gemfile), 'TAGS');
  if (!fs.existsSync(tagsPath)) {
    vscode.window.showErrorMessage(`Bust-A-Gem: ${tagsPath} does not exist.`);
    return;
  }

  //
  // load tags
  //

  etags(tagsPath).then(
    etags => {
      const elapsed = new Date().getTime() - tm;

      const query = document.getText(document.getWordRangeAtPosition(position));
      const locations = etags.tags.get(query);
      if (locations) {
        console.log(locations);
      }
      // return result
    },
    error => {
      console.error(error);
      vscode.window.showErrorMessage(`Bust-A-Gem: ${error.message}`);
    }
  );

  //
  // go to definition
  //

  console.log(query);

  // return locate.find(txt).then(matches => matches.map(locationConverter));
  // const locationConverter = match => new vscode.Location(vscode.Uri.file(match.file), new vscode.Position(match.l
  //   ine, match.char));
  // load tags

  // build tags for project
  // build tags for gems (if set in config)
  // load (or reload) tags
  // now complete with tags data
};

const goToDefinition = { provideDefinition };
module.exports = goToDefinition;

// block ; time ripper-tags -f TAGS -R . /Users/amd/.rbenv/versions/2.5.0/lib/ruby/gems/2.5.0/gems/activerecord-5.1.5 /Users/amd/.rbenv/versions/2.5.0/lib/ruby/gems/2.5.0/gems/nokogiri-1.8.2
