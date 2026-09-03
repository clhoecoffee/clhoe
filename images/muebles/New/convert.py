import os
from PIL import Image

# Target quality (0-100). 80 is the ideal balance of size and quality.
QUALITY = 80 
VALID_EXTENSIONS = ('.png', '.jpg', '.jpeg', '.bmp', '.tiff')

def bulk_convert()
    converted_count = 0
    
    # Loops through all files in the current directory
    for filename in os.listdir('.')
        if filename.lower().endswith(VALID_EXTENSIONS)
            # Split the name from the extension (e.g., 'photo.jpg' - 'photo')
            name_without_ext, _ = os.path.splitext(filename)
            output_name = f{name_without_ext}.webp
            
            try
                with Image.open(filename) as img
                    # Convert RGBA (PNG) to RGB if saving as lossy webp, or let Pillow handle it
                    if img.mode in ('RGBA', 'LA')
                        img.save(output_name, 'webp', quality=QUALITY, keep_rgb=True)
                    else
                        img.save(output_name, 'webp', quality=QUALITY)
                
                print(fConverted {filename} - {output_name})
                converted_count += 1
            except Exception as e
                print(fError converting {filename} {e})
                
    print(fnDone! Successfully converted {converted_count} images.)

if __name__ == __main__
    bulk_convert()
