import * as child_process from 'child_process';

//
// quiet - only used for test
//

let quiet = false;
export const setQuiet = () => {
  quiet = true;
};
export const isQuiet = () => {
  return quiet;
};

// Promise adapter for child_process.exec
export const exec = (command: string, options: child_process.ExecOptions): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!isQuiet()) {
      if (options.cwd) {
        console.log(`Running ${command} in ${options.cwd}...`);
      } else {
        console.log(`Running ${command}...`);
      }
    }

    const tm = Date.now();
    child_process.exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        if (!isQuiet()) {
          console.log(`success, ${Date.now() - tm}ms`);
        }
        resolve(stdout);
      }
    });
  });
};

// time
export const seconds = (i: number) => i * 1000;
export const minutes = (i: number) => i * seconds(60);
export const hours = (i: number) => i * minutes(60);
export const days = (i: number) => i * hours(24);
