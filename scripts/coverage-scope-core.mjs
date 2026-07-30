import { readdir } from "node:fs/promises";
import { resolve } from "node:path";

const productionModule = (file) =>
  /\.(?:ts|tsx)$/.test(file)
  && !/\.(?:test|spec|integration\.test)\.(?:ts|tsx)$/.test(file);

export const discoverProductionModules = async (directory, root = process.cwd()) => {
  const modules = [];
  for (const entry of await readdir(resolve(root, directory), { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) modules.push(...await discoverProductionModules(path, root));
    else if (entry.isFile() && productionModule(entry.name)) modules.push(path);
  }
  return modules;
};
