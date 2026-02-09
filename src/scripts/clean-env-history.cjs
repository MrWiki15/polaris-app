const { execSync } = require("child_process");

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

try {
  // Asegurar que .env esté ignorado
  run("git rm --cached .env || true");

  // Reescribir historial eliminando .env de todos los commits
  run(`
    git filter-branch --force --index-filter \
    "git rm --cached --ignore-unmatch .env" \
    --prune-empty --tag-name-filter cat -- --all
  `);

  // Limpiar referencias antiguas
  run(
    "git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin",
  );
  run("git reflog expire --expire=now --all");
  run("git gc --prune=now --aggressive");

  console.log("\n✔ .env eliminado del historial completo.");
  console.log(
    "⚠ Ahora debe hacer: git push --force --all && git push --force --tags",
  );
} catch (e) {
  console.error("Error:", e.message);
}
