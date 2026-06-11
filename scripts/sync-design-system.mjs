import fs from "node:fs";
import path from "node:path";

const mobileRoot = process.cwd();
const source = path.resolve(mobileRoot, "../reciclame-design-system/src/theme.ts");
const target = path.resolve(mobileRoot, "src/ui/theme.ts");

if (!fs.existsSync(source)) {
  console.error(
    `[design-system] No se encontró el repo compartido en: ${source}\n` +
      "Esperado: ../reciclame-design-system como repo hermano de reciclame-mobile-app."
  );
  process.exit(1);
}

fs.copyFileSync(source, target);
console.log("[design-system] Theme sincronizado en src/ui/theme.ts");
