import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import * as vscode from 'vscode';

//
// This class parses a TAGS file and has a helper for provideDefinition.
//
// See https://en.wikipedia.org/wiki/Ctags#Etags_2
//

const [STATE_INIT, STATE_HEADER, STATE_TAG, STATE_ERROR] = [0, 1, 2, 3];
const HEADER_RE = /^\x0c/;
const TAG_RE = /^([^\x7f]+)\x7f([^\x01]+)\x01([^,]+)/;

export class Etags {
  readonly file: string;
  readonly tags = new Map<string, Tag[]>();

  constructor(file: string) {
    this.file = file;
  }

  // Run a query by looking up key in tags.
  provideDefinition(key: string): vscode.Location[] {
    const base = path.dirname(this.file);
    const list = this.tags.get(key);
    if (!list) {
      return [];
    }
    return list.map((tag) => {
      let file = tag.file;
      if (!file.startsWith('/')) {
        file = path.join(base, file);
      }
      return new vscode.Location(vscode.Uri.file(file), new vscode.Position(tag.line - 1, 0));
    });
  }

  // Add a tag to this.tags (used below)
  private addTag(key: string, tag: Tag) {
    let array = this.tags.get(key);
    if (!array) {
      array = [];
      this.tags.set(key, array);
    }
    array.push(tag);
  }

  //
  // Load the file. We use a state machine to keep track of what's happening in
  // the stream.
  //

  async load(): Promise<{}> {
    // parse state
    let state = STATE_INIT;
    let header: Header;

    return new Promise((resolve, reject) => {
      const input = fs.createReadStream(this.file, { encoding: 'utf8' });
      input.on('error', (error: Error) => {
        reject(error);
      });
      const lineReader = readline.createInterface({ input });

      const onLine = (line: string) => {
        switch (state) {
          case STATE_INIT: {
            if (HEADER_RE.exec(line)) {
              state = STATE_HEADER;
            } else {
              throw new Error(`${this.file} isn't an etags file. I can't parse it.`);
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
            const match = TAG_RE.exec(line);
            if (!match) {
              // are we starting a new header? (I put this in here for
              // performance, since most lines are tags)
              if (HEADER_RE.exec(line)) {
                state = STATE_HEADER;
                return;
              }
              throw new Error(`while reading ${this.file}, couldn't parse line '${line}'.`);
            }

            // now append the tag
            // text, tag, lineno, offset
            const key = match[2];
            const lineno = parseInt(match[3], 10);
            this.addTag(key, new Tag(header, lineno));

            break;
          }
        }
      };

      lineReader
        .on('line', (line) => {
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

// A header line from the TAGS file
class Header {
  readonly file: string;
  readonly size: number;

  constructor(file: string, size: number) {
    this.file = file;
    this.size = size;
  }
}

// A single tag from the TAGS file
export class Tag {
  readonly file: string;
  readonly line: number;

  constructor(header: Header, line: number) {
    this.file = header.file;
    this.line = line;
  }
}
