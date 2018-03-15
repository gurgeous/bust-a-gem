const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('./util');
const vscode = require('vscode');

//
// main command
//

const providerDefinition = (document, position, token) => {
  // build tags for project
  // build tags for gems (if set in config)
  // load (or reload) tags
  // now complete with tags data
};

const goToDefinition = { providerDefinition };
module.exports = goToDefinition;
