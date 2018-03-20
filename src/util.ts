import * as child_process from 'child_process';

let quiet = false;

export const setQuiet = () => {
  quiet = true;
};

// Promise adapter for child_process.exec
export const exec = (command: string, options: child_process.ExecOptions): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!quiet) {
      if (options.cwd) {
        console.log(`Running ${command} in ${options.cwd}...`);
      } else {
        console.log(`Running ${command}...`);
      }
    }
    child_process.exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
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
