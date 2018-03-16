import * as path from 'path';
import * as vscode from 'vscode';
import * as util from './util';

export interface Gem {
  // what is this gem called?
  label: string;

  // name without the version
  labelWithoutVersion: string;

  // where is the gem?
  dir: string;
}

//
// List gems using bundle show --paths.
//

export const list = async (rootPath: string): Promise<Gem[]> => {
  const cmd = <string>vscode.workspace.getConfiguration('bustagem.cmd').get('bundle');
  const options = { timeout: 3000, cwd: rootPath };
  const stdout = await util.exec(cmd, options);

  const dirs = stdout.trim().split('\n');
  if (dirs.length === 0) {
    throw new Error(`${cmd} didn't return anything.`);
  }

  const gems = dirs.map(dir => {
    const label = path.basename(dir);

    // attempt to strip off version info for labelWithoutVersion
    const match = label.match(/^(.*)-\d+(\.\d)+$/);
    const labelWithoutVersion = match ? match[1] : label;

    return { label, labelWithoutVersion, dir };
  });

  return gems;
};
