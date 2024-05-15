#!/usr/bin/env node

const sade = require("sade");
import { fetchCommand } from "src/commands/fetch";
import { version } from "../package.json";

const cli = sade("playbooks-tar <url>", true)
  .version(version)
  .command("fetch <url>")
  .describe("Fetch a Github repository or subdirectory.")
  .option("-c, --clone", "Perform clone after download is complete.")
  .option("-d, --destination", "Path to destination directory.")
  .option("-t, --token", "Add your token")
  .option("-v, --version", "Specify tarball version (optional).")
  .example("fetch vercel/vercel")
  .example("fetch vercel/vercel/examples/angular")
  .example("fetch vercel/vercel/examples/angular --directory storage")
  .example("fetch vercel/vercel/examples/angular --directory ~/storage")
  .action(fetchCommand);

cli.parse(process.argv);
