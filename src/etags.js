const readline = require('readline');
const fs = require('fs');

// https://en.wikipedia.org/wiki/Ctags#Etags_2
const [STATE_INIT, STATE_HEADER, STATE_TAG, STATE_ERROR] = [0, 1, 2, 3];
const HEADER_RE = /^\x0c/;
const TAG_RE = /^([^\x7f]+)\x7f([^\x01]+)\x01([^,]+)/;

const etags = file => {
  // this is what we return
  const { mtime } = fs.statSync(file);
  const results = {
    file,
    mtime,
    tags: new Map(),
  };
  const tags = results.tags;

  // parse state
  let state = STATE_INIT;
  let header;

  return new Promise((resolve, reject) => {
    const input = fs.createReadStream(file, { encoding: 'utf8' });
    const lineReader = readline.createInterface({ input });

    const onLine = line => {
      switch (state) {
        case STATE_INIT: {
          if (HEADER_RE.exec(line)) {
            state = STATE_HEADER;
          } else {
            throw new Error(`${results.file} isn't an etags file.`);
          }
          break;
        }

        case STATE_HEADER: {
          const split = line.split(',');
          const file = split[0];
          const size = parseInt(split[1], 10);
          header = { file, size };
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

          // this is what we append
          const key = match[2];
          const lineno = parseInt(match[3], 10);
          const element = {
            file: header.file,
            line: lineno,
          };

          // append to results
          let array = tags.get(key);
          if (!array) {
            array = [];
            tags.set(key, array);
          }
          array.push(element);

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
        if (state != STATE_ERROR) {
          resolve(results);
        }
      });
  });
};

module.exports = etags;
