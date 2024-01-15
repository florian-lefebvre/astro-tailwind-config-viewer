import { spawn } from "node:child_process";
import { resolve } from "node:path";

/**
 *
 * @param {string} command
 * @param  {...Array<string>} args
 *
 * @returns {Promise<void>}
 */
const run = async (command, ...args) => {
  const cwd = resolve();
  return new Promise((resolve) => {
    spawn(command, args, {
      stdio: "inherit",
      shell: true,
      cwd,
    }).on("close", () => resolve());
  });
};

const main = async () => {
  await run("pnpm changeset version");
  await run("git add .");
  await run('git commit -m "chore: update version"');
  await run("git push");
  await run("pnpm changeset publish");
};

main();
