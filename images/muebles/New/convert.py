import os
import json
from PIL import Image

# Target quality (0-100). 80 is the ideal balance of size and quality.
QUALITY = 80
VALID_EXTENSIONS = ('.png', '.jpg', '.jpeg', '.bmp', '.tiff')

def bulk_convert():
    converted_count = 0
    dimensions = []  # list of (filename, width, height)

    for filename in os.listdir('.'):
        if filename.lower().endswith(VALID_EXTENSIONS):
            name_without_ext, _ = os.path.splitext(filename)
            output_name = f"{name_without_ext}.webp"

            try:
                with Image.open(filename) as img:
                    width, height = img.size

                    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                        img = img.convert('RGBA')
                        img.save(output_name, 'WEBP', quality=QUALITY)
                    else:
                        img.convert('RGB').save(output_name, 'WEBP', quality=QUALITY)

                os.remove(filename)

                dimensions.append((output_name, width, height))
                print(f"Replaced {filename} -> {output_name}  ({width}x{height})")
                converted_count += 1
            except Exception as e:
                print(f"Error converting {filename}: {e}")

    # Write products_template.json (one line per image, ready to paste into productos.json)
    lines = []
    for name, w, h in dimensions:
        base = os.path.splitext(name)[0]
        path = f"images/muebles/{base}.webp"
        lines.append(
            f'{{ "id": , "image": "{path}", "w": {w}, "h": {h}, "price": 0, "tags": []}},'
        )

    with open('products_template.json', 'w', encoding='utf-8') as f:
        f.write("\n".join(lines))

    print(f"\nDone! Successfully replaced {converted_count} images.")
    print(f"Wrote products_template.json with {len(lines)} entries.")

if __name__ == "__main__":
    bulk_convert()