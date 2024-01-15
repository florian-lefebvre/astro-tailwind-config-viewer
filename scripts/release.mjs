import { spawn } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 *
 * @param {string} command
 * @param  {...Array<string>} args
 *
 * @returns {Promise<void>}
 */
const runCommand = async (command, ...args) => {
  const cwd = dirname(fileURLToPath(import.meta.url));
  console.log(cwd)
  return new Promise((resolve) => {
    spawn(command, args, {
      stdio: "inherit",
      shell: true,
      cwd,
    }).on("close", () => resolve());
  });
};

const main = async () => {
  await asyncExec("pnpm changeset version")
  await asyncExec("git add .")
  await asyncExec('git commit -m "chore: update version"')
  await asyncExec("git push")
  await asyncExec("pnpm changeset publish")
};

main();
