const readline = require('readline');
const fs = require('fs');

const [STATE_INIT, STATE_HEADER, STATE_TAG, STATE_ERROR] = [0, 1, 2, 3];
const HEADER_RE = /^\x0c/;
const TAG_RE = /^([^\x7f]+)\x7f([^\x01]+)\x01([^,]+),(.*)/;

const etags = path => {
  // this is what we return
  const { mtime } = fs.statSync(path);
  const etags = {
    path,
    mtime,
    tags: new Map(),
  };
  const tags = etags.tags;

  // parse state
  let state = STATE_INIT;
  let header;

  return new Promise((resolve, reject) => {
    const input = fs.createReadStream(path, { encoding: 'utf8' });
    const lineReader = readline.createInterface({ input });

    const onLine = line => {
      switch (state) {
        case STATE_INIT:
          if (HEADER_RE.exec(line)) {
            state = STATE_HEADER;
          } else {
            throw new Error(`${etags.path} isn't an etags file.`);
          }
          break;

        case STATE_HEADER:
          const split = line.split(',');
          const path = split[0];
          const size = parseInt(split[1], 10);
          header = { path, size };
          state = STATE_TAG;
          break;

        case STATE_TAG:
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

          // this is what we append
          const tag = match[2];
          const lineno = parseInt(match[3], 10);
          const element = [header.path, lineno];

          // append to etags
          let a = tags.get(tag);
          if (a === undefined) {
            a = [];
            tags.set(tag, a);
          }
          a.push(element);

          break;
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
        if (state != STATE_ERROR) {
          resolve(etags);
        }
      });
  });
};

module.exports = etags;
