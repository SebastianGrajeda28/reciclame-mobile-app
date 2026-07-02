/**
 * Patches @shopify/react-native-skia Container.native.js to avoid calling
 * Skia.Picture.MakePicture(null), which throws "Expected arraybuffer as first
 * parameter" in release builds with Hermes (Skia v2.6.5 JSI null-handling bug).
 *
 * Run automatically via the root postinstall script after every `bun install`.
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const root = join(fileURLToPath(import.meta.url), '..', '..');
const target = join(root, 'node_modules/@shopify/react-native-skia/lib/commonjs/sksg/Container.native.js');

const OLD = 'this.picture = Skia.Picture.MakePicture(null);';
const NEW = `// MakePicture(null) throws in release builds with Hermes (v2.6.5 JSI bug).
    // beginRecording() without bounds also throws — must pass a valid SkRect.
    const _r = Skia.PictureRecorder();
    _r.beginRecording(Skia.XYWHRect(0, 0, 1, 1));
    this.picture = _r.finishRecordingAsPicture();
    _r.dispose();`;

let content;
try {
  content = readFileSync(target, 'utf8');
} catch {
  console.warn('[patch-skia] File not found, skipping:', target);
  process.exit(0);
}

if (content.includes(OLD)) {
  writeFileSync(target, content.replace(OLD, NEW));
  console.log('[patch-skia] Container.native.js patched ✓');
} else if (content.includes('_r.finishRecordingAsPicture()')) {
  console.log('[patch-skia] Container.native.js already patched, skipping.');
} else {
  console.warn('[patch-skia] Could not find patch target — Skia API may have changed.');
}
