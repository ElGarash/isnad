import os
import sqlite3
import textwrap
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from tqdm import tqdm

# TODO: Update the script to generate for Sahih Muslim as well
# Connect to the SQLite database
def get_db_connection():
    db_path = Path("data/sqlite.db")
    return sqlite3.connect(db_path)

def create_directory_if_not_exists(directory):
    """Create directory if it doesn't exist"""
    if not os.path.exists(directory):
        os.makedirs(directory)

def draw_text_with_wrapping(draw, text, font, x, y, max_width, line_height, color):
    """Draw text with word wrapping"""
    if not text:
        return y  # Return original y if no text to draw

    lines = textwrap.wrap(text, width=max_width)
    for i, line in enumerate(lines):
        draw.text((x, y + i * line_height), line, font=font, fill=color)
    return y + len(lines) * line_height

def create_base_image(width=1200, height=630, background_color="#F8F0E3"):
    """Create a base image with logo and style"""
    image = Image.new("RGB", (width, height), background_color)
    draw = ImageDraw.Draw(image)

    # Add border
    border_width = 8
    draw.rectangle(
        [(border_width//2, border_width//2), (width-border_width//2, height-border_width//2)],
        outline="#000000",
        width=border_width
    )

    # Load and place logo if available
    try:
        logo = Image.open("public/logo.png").convert("RGBA")
        logo_width = 150
        aspect_ratio = logo.height / logo.width
        logo_height = int(logo_width * aspect_ratio)
        logo = logo.resize((logo_width, logo_height), Image.LANCZOS)

        # Calculate position to place logo at bottom right
        logo_position = (width - logo_width - 40, height - logo_height - 40)

        # Create a temporary image with an alpha channel to composite the logo
        temp = Image.new("RGBA", image.size, (0, 0, 0, 0))
        temp.paste(logo, logo_position, logo)

        # Composite the temporary image onto the background
        image = Image.alpha_composite(image.convert("RGBA"), temp).convert("RGB")
    except FileNotFoundError:
        # No logo available, continue without it
        pass

    return image, ImageDraw.Draw(image)

def generate_narrator_og_image(narrator, output_path):
    """Generate OG image for narrator profile page"""
    image, draw = create_base_image()
    width, height = image.size

    # Load fonts - adjust paths to your font location
    try:
        title_font = ImageFont.truetype("scripts/fonts/static/NotoNaskhArabic-Bold.ttf", 70)
        regular_font = ImageFont.truetype("scripts/fonts/static/NotoNaskhArabic-Regular.ttf", 40)
        small_font = ImageFont.truetype("scripts/fonts/static/NotoNaskhArabic-Regular.ttf", 32)
    except IOError:
        # Fallback to default font if custom font not available
        title_font = ImageFont.load_default()
        regular_font = ImageFont.load_default()
        small_font = ImageFont.load_default()

    # Add title
    title = f"{narrator['name']}"
    draw.text((80, 80), title, font=title_font, fill="#000000")

    # Add subtitle
    draw.text((80, 180), "سيرة الراوي", font=regular_font, fill="#000000")

    # Add details about narrator
    details = []
    if narrator['full_name']:
        details.append(f"الاسم الكامل: {narrator['full_name']}")
    if narrator['grade']:
        details.append(f"الرتبة: {narrator['grade']}")
    if narrator['death_date_hijri']:
        details.append(f"تاريخ الوفاة: {narrator['death_date_hijri']} هـ")

    y_position = 250
    for detail in details:
        y_position = draw_text_with_wrapping(draw, detail, small_font, 80, y_position, 40, 45, "#000000") + 20

    # Save the image
    image.save(output_path)

def generate_hadith_og_image(hadith, output_path):
    """Generate OG image for hadith detail page"""
    image, draw = create_base_image()
    width, height = image.size

    # Load fonts
    try:
        title_font = ImageFont.truetype("scripts/fonts/NotoNaskhArabic-Bold.ttf", 60)
        subtitle_font = ImageFont.truetype("scripts/fonts/NotoNaskhArabic-Bold.ttf", 40)
        text_font = ImageFont.truetype("scripts/fonts/NotoNaskhArabic-Regular.ttf", 36)
    except IOError:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        text_font = ImageFont.load_default()

    # Add title
    title = f"حديث رقم {hadith['hadith_no']}"
    draw.text((80, 60), title, font=title_font, fill="#000000")

    # Add source
    subtitle = f"{hadith['source']}"
    draw.text((80, 140), subtitle, font=subtitle_font, fill="#000000")

    # Add hadith text - truncated if too long
    if hadith['text_ar']:
        text = hadith['text_ar']
        # Truncate text if it's too long
        if len(text) > 300:
            text = text[:300] + "..."
        draw_text_with_wrapping(draw, text, text_font, 80, 220, 30, 50, "#000000")

    # Save the image
    image.save(output_path)

def generate_chapter_og_image(source, chapter_no, chapter_name, hadith_count, output_path):
    """Generate OG image for chapter page"""
    image, draw = create_base_image()
    width, height = image.size

    # Load fonts
    try:
        title_font = ImageFont.truetype("scripts/fonts/NotoNaskhArabic-Bold.ttf", 60)
        subtitle_font = ImageFont.truetype("scripts/fonts/NotoNaskhArabic-Bold.ttf", 50)
        text_font = ImageFont.truetype("scripts/fonts/NotoNaskhArabic-Regular.ttf", 40)
    except IOError:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        text_font = ImageFont.load_default()

    # Add source as title
    draw.text((80, 80), source, font=title_font, fill="#000000")

    # Add chapter number
    draw.text((80, 180), f"باب {chapter_no}", font=subtitle_font, fill="#000000")

    # Add chapter name
    y_position = 260
    if chapter_name:
        y_position = draw_text_with_wrapping(draw, chapter_name, text_font, 80, y_position, 35, 60, "#000000") + 40

    # Add hadith count
    count_text = f"عدد الأحاديث: {hadith_count}"
    draw.text((80, y_position), count_text, font=text_font, fill="#000000")

    # Save the image
    image.save(output_path)

def generate_default_og_image(output_path):
    """Generate default fallback OG image"""
    image, draw = create_base_image()
    width, height = image.size

    # Load fonts
    try:
        title_font = ImageFont.truetype("scripts/fonts/NotoNaskhArabic-Bold.ttf", 70)
        subtitle_font = ImageFont.truetype("scripts/fonts/NotoNaskhArabic-Regular.ttf", 40)
    except IOError:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()

    # Add title
    title = "سلسلة الرواة"
    draw.text((width//2 - 200, height//2 - 100), title, font=title_font, fill="#000000")

    # Add subtitle
    subtitle = "استكشف الأحاديث وسلاسل الرواة"
    draw.text((width//2 - 250, height//2), subtitle, font=subtitle_font, fill="#000000")

    # Save the image
    image.save(output_path)

def create_index_html(og_images_dir):
    """Create an HTML index file that displays all generated images for QA"""
    html_content = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OG Images Index</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        h1, h2 { color: #333; }
        .image-container { margin-bottom: 40px; }
        .image-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
        .image-card { border: 1px solid #ddd; padding: 10px; border-radius: 5px; }
        img { max-width: 100%; height: auto; }
        .image-caption { margin-top: 10px; font-size: 0.9em; color: #555; }
    </style>
</head>
<body>
    <h1>OG Images Preview</h1>
"""

    # Add sections for each type of OG image
    image_types = {
        "narrators": "Narrator OG Images",
        "hadiths": "Hadith OG Images",
        "chapters": "Chapter OG Images"
    }

    for dir_name, section_title in image_types.items():
        dir_path = og_images_dir / dir_name
        if not dir_path.exists():
            continue

        html_content += f"<div class='image-container'>\n<h2>{section_title}</h2>\n<div class='image-grid'>\n"

        # Get sample images (limit to 50 per category to keep page size reasonable)
        sample_images = []
        for root, _, files in os.walk(dir_path):
            image_files = [f for f in files if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
            sample_paths = [os.path.join(root, f) for f in image_files[:50]]
            sample_images.extend(sample_paths)

        # Add image cards to HTML
        for img_path in sample_images:
            rel_path = os.path.relpath(img_path, start=og_images_dir.parent.parent)
            html_content += f"""    <div class='image-card'>
        <img src='/{rel_path}' alt='OG Image'>
        <div class='image-caption'>{os.path.basename(img_path)}</div>
    </div>\n"""

        html_content += "</div>\n</div>\n"

    html_content += """</body>
</html>"""

    # Write the HTML file
    with open(og_images_dir / "index.html", "w", encoding="utf-8") as f:
        f.write(html_content)

def main():
    conn = get_db_connection()

    # Create output directories
    og_images_dir = Path("public/images/og-images")
    create_directory_if_not_exists(og_images_dir)
    create_directory_if_not_exists(og_images_dir / "narrators")
    create_directory_if_not_exists(og_images_dir / "hadiths")
    create_directory_if_not_exists(og_images_dir / "chapters")

    # Generate default image for fallback
    print("Generating default OG image...")
    generate_default_og_image(og_images_dir / "og-default.png")

    # Generate narrator OG images
    print("Generating narrator OG images...")
    narrators = conn.execute("SELECT * FROM rawis").fetchall()
    narrator_columns = [desc[0] for desc in conn.execute("SELECT * FROM rawis LIMIT 1").description]

    for narrator in tqdm(narrators):
        narrator_dict = dict(zip(narrator_columns, narrator))
        # Sanitize name for use as filename
        sanitized_name = str(narrator_dict['name']).replace('/', '-').replace('\\', '-')
        output_path = og_images_dir / "narrators" / f"{sanitized_name}.png"
        try:
            generate_narrator_og_image(narrator_dict, output_path)
        except Exception as e:
            print(f"Error generating OG image for narrator {sanitized_name}: {e}")

    # Generate hadith OG images
    print("Generating hadith OG images...")
    # Only generate for Sahih Bukhari as per your static generation pattern
    hadiths = conn.execute(
        "SELECT * FROM hadiths WHERE source = 'Sahih Bukhari'"
    ).fetchall()
    hadith_columns = [desc[0] for desc in conn.execute("SELECT * FROM hadiths LIMIT 1").description]

    for hadith in tqdm(hadiths):
        hadith_dict = dict(zip(hadith_columns, hadith))
        source_dir = og_images_dir / "hadiths" / hadith_dict['source'].replace(' ', '_')
        create_directory_if_not_exists(source_dir)
        chapter_dir = source_dir / str(hadith_dict['chapter_no'])
        create_directory_if_not_exists(chapter_dir)

        # Clean hadith_no for use as filename
        sanitized_hadith_no = str(hadith_dict['hadith_no']).replace('/', '-').strip()
        output_path = chapter_dir / f"{sanitized_hadith_no}.png"

        try:
            generate_hadith_og_image(hadith_dict, output_path)
        except Exception as e:
            print(f"Error generating OG image for hadith {sanitized_hadith_no}: {e}")

    # Generate chapter OG images
    print("Generating chapter OG images...")
    # Get unique chapters from Sahih Bukhari
    chapters = conn.execute(
        """
        SELECT source, chapter_no, chapter, COUNT(*) as hadith_count
        FROM hadiths
        WHERE source = 'Sahih Bukhari'
        GROUP BY source, chapter_no, chapter
        """
    ).fetchall()

    for source, chapter_no, chapter_name, hadith_count in tqdm(chapters):
        source_dir = og_images_dir / "chapters" / source.replace(' ', '_')
        create_directory_if_not_exists(source_dir)
        output_path = source_dir / f"{chapter_no}.png"

        try:
            generate_chapter_og_image(source, chapter_no, chapter_name, hadith_count, output_path)
        except Exception as e:
            print(f"Error generating OG image for chapter {chapter_no}: {e}")

    # Create an index HTML for QA
    create_index_html(og_images_dir)

    conn.close()
    print("OG image generation complete!")
    print(f"View the preview of generated images at /images/og-images/index.html")

if __name__ == "__main__":
    main()
