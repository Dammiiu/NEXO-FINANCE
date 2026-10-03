const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
// Render may install with --omit=dev, so the bundler the build script needs
// must be a runtime dependency.
if (pkg.devDependencies && pkg.devDependencies.esbuild) {
  pkg.dependencies.esbuild = pkg.devDependencies.esbuild;
  delete pkg.devDependencies.esbuild;
}
pkg.dependencies = Object.keys(pkg.dependencies).sort().reduce((a,k)=>(a[k]=pkg.dependencies[k],a),{});
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n", "utf8");
console.log("dependencies   :", Object.keys(pkg.dependencies).join(", "));
console.log("devDependencies:", Object.keys(pkg.devDependencies).join(", "));
console.log("build:server   :", pkg.scripts["build:server"]);
console.log("start          :", pkg.scripts.start);
