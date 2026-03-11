import { copyFileSync } from "fs";
import { join } from "path";

const dist = join(process.cwd(), "dist");
copyFileSync(join(dist, "index.html"), join(dist, "404.html"));
console.log("postbuild-pages: copied dist/index.html -> dist/404.html");
