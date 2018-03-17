import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

//
// This class parses a TAGS file.
// See https://en.wikipedia.org/wiki/Ctags#Etags_2
//

const [STATE_INIT, STATE_HEADER, STATE_TAG, STATE_ERROR] = [0, 1, 2, 3];
const HEADER_RE = /^\x0c/;
const TAG_RE = /^([^\x7f]+)\x7f([^\x01]+)\x01([^,]+)/;

export class Etags {
  readonly file: string;
  readonly mtime: Date;
  readonly tags: Map<string, Tag[]>;

  constructor(file: string) {
    this.file = file;
    this.mtime = fs.statSync(file).mtime;
    this.tags = new Map();
  }

  // run a query by looking up key in tags
  provideDefinition(key: string): vscode.Location[] {
    const base = path.dirname(this.file);
    const list = this.tags.get(key);
    if (!list) {
      return [];
    }
    return list.map(tag => {
      const file = path.join(base, tag.file);
      return new vscode.Location(vscode.Uri.file(file), new vscode.Position(tag.line - 1, 0));
    });
  }

  // add a tag to this.tags (used below)
  private addTag(key: string, tag: Tag) {
    let array = this.tags.get(key);
    if (!array) {
      array = [];
      this.tags.set(key, array);
    }
    array.push(tag);
  }

  //
  // load the file
  //

  async load(): Promise<{}> {
    // parse state
    let state = STATE_INIT;
    let header: Header;

    return new Promise((resolve, reject) => {
      const input = fs.createReadStream(this.file, { encoding: 'utf8' });
      const lineReader = readline.createInterface({ input });

      const onLine = (line: string) => {
        switch (state) {
          case STATE_INIT: {
            if (HEADER_RE.exec(line)) {
              state = STATE_HEADER;
            } else {
              throw new Error(`${this.file} isn't an etags file.`);
            }
            break;
          }

          case STATE_HEADER: {
            const split = line.split(',');
            const file = split[0];
            const size = parseInt(split[1], 10);
            header = new Header(file, size);
            state = STATE_TAG;
            break;
          }

          case STATE_TAG: {
            // are we starting a new header?
            if (HEADER_RE.exec(line)) {
              state = STATE_HEADER;
              return;
            }

            // text, tag, lineno, offset
            const match = TAG_RE.exec(line);
            if (!match) {
              throw new Error(`couldn't parse line '${line}'`);
            }

            // append
            const key = match[2];
            const lineno = parseInt(match[3], 10);
            this.addTag(key, new Tag(header, lineno));

            break;
          }
        }
      };

      lineReader
        .on('line', line => {
          try {
            onLine(line);
          } catch (error) {
            reject(error);
            state = STATE_ERROR;
          }
        })
        .on('close', () => {
          input.close();
          if (state !== STATE_ERROR) {
            resolve();
          }
        });
    });
  }
}

// a header line from the file
class Header {
  readonly file: string;
  readonly size: number;

  constructor(file: string, size: number) {
    this.file = file;
    this.size = size;
  }
}

// one tag from the file
export class Tag {
  readonly file: string;
  readonly line: number;

  constructor(header: Header, line: number) {
    this.file = header.file;
    this.line = line;
  }
}
