import os
from PIL import Image

# Target quality (0-100). 80 is the ideal balance of size and quality.
QUALITY = 80 
VALID_EXTENSIONS = ('.png', '.jpg', '.jpeg', '.bmp', '.tiff')

def bulk_convert():
    converted_count = 0
    
    # Loops through all files in the current directory
    for filename in os.listdir('.'):
        if filename.lower().endswith(VALID_EXTENSIONS):
            name_without_ext, _ = os.path.splitext(filename)
            output_name = f"{name_without_ext}.webp"
            
            try:
                with Image.open(filename) as img:
                    # Convert transparent images properly for WebP
                    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                        img = img.convert('RGBA')
                        img.save(output_name, 'WEBP', quality=QUALITY)
                    else:
                        img.convert('RGB').save(output_name, 'WEBP', quality=QUALITY)
                
                # Delete the original file after successful conversion
                os.remove(filename)
                
                print(f"Replaced {filename} -> {output_name}")
                converted_count += 1
            except Exception as e:
                print(f"Error converting {filename}: {e}")
                
    print(f"\nDone! Successfully replaced {converted_count} images.")

if __name__ == "__main__":
    bulk_convert()