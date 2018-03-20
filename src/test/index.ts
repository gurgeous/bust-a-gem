import * as testRunner from 'vscode/lib/testrunner';
testRunner.configure({ ui: 'bdd', useColors: true });
module.exports = testRunner;

//
// TESTING TODO
//
// goto
// ----
// provideDefinition will rip, then answer
// provideDefinition picks up ::
// provideDefinition won't rip twice
//
// rebuild: creates new TAGS
//
// guard: don't be reentrant (running)
// guard: errors should be displayed in the window
// guard: 'command not found' translates to nice error
//
//
// dirsToRip: translation for gems (with and without versions)
// dirsToRip: skipping of unknown gem dirs
//
// don't whine too often
//
// open
// ----
// errors should propogate to vscode.window
//
