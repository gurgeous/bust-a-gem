import * as child_process from 'child_process';

// Promise adapter for child_process.exec
export const exec = (command: string, options: child_process.ExecOptions): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (options.cwd) {
      console.log(`Running ${command} in ${options.cwd}...`);
    } else {
      console.log(`Running ${command}...`);
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
