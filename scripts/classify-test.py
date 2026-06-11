"""
Prueba de precisión del modelo TFLite con imágenes reales.

Uso:
    python scripts/classify-test.py tests/fixtures/images/botella.jpg Botella plastica
    python scripts/classify-test.py tests/fixtures/images/papel.jpg Papel
    python scripts/classify-test.py tests/fixtures/images/*.jpg

Requisitos (instalar uno de los dos):
    pip install tflite-runtime pillow numpy      # liviano, recomendado
    pip install tensorflow pillow numpy          # si ya tenés tensorflow

Corre desde la raíz del proyecto (reciclame-mobile-app/).
"""

import sys
import json
import numpy as np
from pathlib import Path
from PIL import Image

try:
    import tflite_runtime.interpreter as tflite
except ImportError:
    try:
        import tensorflow.lite as tflite
    except ImportError:
        print("ERROR: instala tflite-runtime o tensorflow:")
        print("  pip install tflite-runtime pillow numpy")
        sys.exit(1)

MODEL_PATH = Path("assets/model/model.tflite")
LABELS_PATH = Path("assets/model/labels.json")
CONFIDENCE_THRESHOLD = 80  # mismo que RECYCLE_CONFIDENCE_THRESHOLD * 100

if not MODEL_PATH.exists():
    print(f"ERROR: no se encontró el modelo en {MODEL_PATH}")
    print("Corré este script desde la carpeta reciclame-mobile-app/")
    sys.exit(1)

labels: list[str] = json.loads(LABELS_PATH.read_text(encoding="utf-8"))

interp = tflite.Interpreter(model_path=str(MODEL_PATH))
interp.allocate_tensors()
inp  = interp.get_input_details()[0]
out  = interp.get_output_details()[0]

print(f"Modelo cargado  — input dtype: {inp['dtype'].__name__}, shape: {inp['shape']}")
print(f"Labels ({len(labels)}): {labels}\n")

args = sys.argv[1:]
if not args:
    print("Uso: python scripts/classify-test.py <imagen1.jpg> [imagen2.jpg ...]")
    sys.exit(0)

ok = 0
total = 0

for img_path in args:
    p = Path(img_path)
    if not p.exists():
        print(f"  ⚠  {img_path}: archivo no encontrado, se omite")
        continue

    img = Image.open(p).convert("RGB").resize((224, 224), Image.BILINEAR)
    arr = np.array(img, dtype=np.uint8).reshape(1, 224, 224, 3)

    # Si el modelo espera float32 (sin cuantización), normalizar
    if inp["dtype"] == np.float32:
        arr = (arr / 255.0).astype(np.float32)

    interp.set_tensor(inp["index"], arr)
    interp.invoke()

    probs = interp.get_tensor(out["index"])[0]
    idx   = int(np.argmax(probs))
    conf  = round(float(probs[idx]) * 100)
    label = labels[idx] if conf >= CONFIDENCE_THRESHOLD else "Desconocido"

    bar = "█" * (conf // 5) + "░" * (20 - conf // 5)
    print(f"  {p.name:<30} → {label:<20} {conf:>3}%  [{bar}]")

    total += 1
    if conf >= CONFIDENCE_THRESHOLD:
        ok += 1

print(f"\n{ok}/{total} con confianza ≥ {CONFIDENCE_THRESHOLD}%")
