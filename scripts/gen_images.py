import os
import sqlite3
import textwrap
import time
import concurrent.futures
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from tqdm import tqdm


def get_db_connection():
    db_path = Path("data/sqlite.db")
    return sqlite3.connect(db_path)


def create_directory_if_not_exists(directory):
    """Create directory if it doesn't exist"""
    try:
        os.makedirs(directory, exist_ok=True)
    except Exception:
        pass


def draw_text_with_wrapping(draw, text, font, x, y, max_width, line_height, color):
    """Draw text with word wrapping"""
    if not text:
        return y

    lines = textwrap.wrap(text, width=max_width)
    for i, line in enumerate(lines):
        draw.text((x, y + i * line_height), line, font=font, fill=color)
    return y + len(lines) * line_height


class FontLoader:
    """Singleton for loading and caching fonts"""

    _instance = None
    _fonts: dict[str, ImageFont.FreeTypeFont] = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FontLoader, cls).__new__(cls)
            cls._instance._load_fonts()
        return cls._instance

    def _load_fonts(self):
        try:
            self._fonts = {
                "title_bold": ImageFont.truetype(
                    "scripts/fonts/static/NotoNaskhArabic-Bold.ttf", 70
                ),
                "title_medium": ImageFont.truetype(
                    "scripts/fonts/static/NotoNaskhArabic-Bold.ttf", 60
                ),
                "subtitle_bold": ImageFont.truetype(
                    "scripts/fonts/static/NotoNaskhArabic-Bold.ttf", 50
                ),
                "subtitle": ImageFont.truetype(
                    "scripts/fonts/static/NotoNaskhArabic-Bold.ttf", 40
                ),
                "regular": ImageFont.truetype(
                    "scripts/fonts/static/NotoNaskhArabic-Regular.ttf", 40
                ),
                "text": ImageFont.truetype(
                    "scripts/fonts/static/NotoNaskhArabic-Regular.ttf", 36
                ),
                "small": ImageFont.truetype(
                    "scripts/fonts/static/NotoNaskhArabic-Regular.ttf", 32
                ),
            }
        except IOError:
            print("Warning: Could not load custom fonts, falling back to default")
            default = ImageFont.load_default()
            self._fonts = {
                "title_bold": default,
                "title_medium": default,
                "subtitle_bold": default,
                "subtitle": default,
                "regular": default,
                "text": default,
                "small": default,
            }

    def get(self, font_key):
        return self._fonts.get(font_key, ImageFont.load_default())


def create_base_image(width=1200, height=630, background_color="#F8F0E3"):
    """Create a base image with logo and style"""
    image = Image.new("RGB", (width, height), background_color)
    draw = ImageDraw.Draw(image)

    border_width = 8
    draw.rectangle(
        [
            (border_width // 2, border_width // 2),
            (width - border_width // 2, height - border_width // 2),
        ],
        outline="#000000",
        width=border_width,
    )

    try:
        logo = Image.open("public/logo.png").convert("RGBA")
        logo_width = 150
        aspect_ratio = logo.height / logo.width
        logo_height = int(logo_width * aspect_ratio)
        logo = logo.resize((logo_width, logo_height), Image.LANCZOS)

        logo_position = (width - logo_width - 40, height - logo_height - 40)

        temp = Image.new("RGBA", image.size, (0, 0, 0, 0))
        temp.paste(logo, logo_position, logo)

        image = Image.alpha_composite(image.convert("RGBA"), temp).convert("RGB")
    except FileNotFoundError:
        pass

    return image, ImageDraw.Draw(image)


def generate_narrator_og_image(narrator, output_path, fonts):
    """Generate OG image for narrator profile page"""
    image, draw = create_base_image()

    title = f"{narrator['name']}"
    draw.text((80, 80), title, font=fonts.get("title_bold"), fill="#000000")
    draw.text((80, 180), "سيرة الراوي", font=fonts.get("regular"), fill="#000000")

    details = []
    if narrator["full_name"]:
        details.append(f"الاسم الكامل: {narrator['full_name']}")
    if narrator["grade"]:
        details.append(f"الرتبة: {narrator['grade']}")
    if narrator["death_date_hijri"]:
        details.append(f"تاريخ الوفاة: {narrator['death_date_hijri']} هـ")

    y_position = 250
    for detail in details:
        y_position = (
            draw_text_with_wrapping(
                draw, detail, fonts.get("small"), 80, y_position, 40, 45, "#000000"
            )
            + 20
        )

    image.save(output_path)


def generate_hadith_og_image(hadith, output_path, fonts):
    """Generate OG image for hadith detail page"""
    image, draw = create_base_image()

    title = f"حديث رقم {hadith['hadith_no']}"
    draw.text((80, 60), title, font=fonts.get("title_medium"), fill="#000000")

    subtitle = f"{hadith['source']}"
    draw.text((80, 140), subtitle, font=fonts.get("subtitle"), fill="#000000")

    if hadith["text_ar"]:
        text = hadith["text_ar"]
        if len(text) > 300:
            text = text[:300] + "..."
        draw_text_with_wrapping(
            draw, text, fonts.get("text"), 80, 220, 30, 50, "#000000"
        )

    image.save(output_path)


def generate_chapter_og_image(
    source, chapter_no, chapter_name, hadith_count, output_path, fonts
):
    """Generate OG image for chapter page"""
    image, draw = create_base_image()

    draw.text((80, 80), source, font=fonts.get("title_medium"), fill="#000000")
    draw.text(
        (80, 180), f"باب {chapter_no}", font=fonts.get("subtitle_bold"), fill="#000000"
    )

    y_position = 260
    if chapter_name:
        y_position = (
            draw_text_with_wrapping(
                draw, chapter_name, fonts.get("text"), 80, y_position, 35, 60, "#000000"
            )
            + 40
        )

    count_text = f"عدد الأحاديث: {hadith_count}"
    draw.text((80, y_position), count_text, font=fonts.get("text"), fill="#000000")

    image.save(output_path)


def generate_default_og_image(output_path, fonts):
    """Generate default fallback OG image"""
    image, draw = create_base_image()
    width, height = image.size

    title = "سلسلة الرواة"
    draw.text(
        (width // 2 - 200, height // 2 - 100),
        title,
        font=fonts.get("title_bold"),
        fill="#000000",
    )

    subtitle = "استكشف الأحاديث وسلاسل الرواة"
    draw.text(
        (width // 2 - 250, height // 2),
        subtitle,
        font=fonts.get("regular"),
        fill="#000000",
    )

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
        .metrics { background: #f5f5f5; padding: 15px; margin-bottom: 30px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>OG Images Preview</h1>
    <div class="metrics">
        <h3>Generation Metrics</h3>
"""

    image_types = {
        "narrators": "Narrator OG Images",
        "hadiths": "Hadith OG Images",
        "chapters": "Chapter OG Images",
    }

    for dir_name, section_title in image_types.items():
        dir_path = og_images_dir / dir_name
        if not dir_path.exists():
            continue

        html_content += f"<div class='image-container'>\n<h2>{section_title}</h2>\n<div class='image-grid'>\n"

        sample_images = []
        for root, _, files in os.walk(dir_path):
            image_files = [
                f for f in files if f.lower().endswith((".png", ".jpg", ".jpeg"))
            ]
            sample_paths = [os.path.join(root, f) for f in image_files[:50]]
            sample_images.extend(sample_paths)

        for img_path in sample_images:
            rel_path = os.path.relpath(img_path, start=og_images_dir.parent.parent)
            html_content += f"""    <div class='image-card'>
        <img src='/{rel_path}' alt='OG Image'>
        <div class='image-caption'>{os.path.basename(img_path)}</div>
    </div>\n"""

        html_content += "</div>\n</div>\n"

    html_content += """</body>
</html>"""

    with open(og_images_dir / "index.html", "w", encoding="utf-8") as f:
        f.write(html_content)

    return html_content


def main():
    start_time = time.time()
    conn = get_db_connection()

    og_images_dir = Path("public/images/og-images")
    create_directory_if_not_exists(og_images_dir)
    create_directory_if_not_exists(og_images_dir / "narrators")
    create_directory_if_not_exists(og_images_dir / "hadiths")
    create_directory_if_not_exists(og_images_dir / "chapters")

    fonts = FontLoader()

    print("Generating default OG image...")
    generate_default_og_image(og_images_dir / "og-default.png", fonts)

    narrator_columns = [
        desc[0] for desc in conn.execute("SELECT * FROM rawis LIMIT 1").description
    ]
    hadith_columns = [
        desc[0] for desc in conn.execute("SELECT * FROM hadiths LIMIT 1").description
    ]

    print("Fetching narrators from database...")
    narrators = conn.execute(
        """
        SELECT DISTINCT r.*
        FROM rawis r
        JOIN hadith_chains hc ON r.scholar_indx = hc.scholar_indx
        ORDER BY r.scholar_indx
    """
    ).fetchall()

    narrator_count = len(narrators)
    print(f"Found {narrator_count} narrators with hadiths")

    print("Fetching hadiths from database...")
    hadiths = conn.execute(
        """
        SELECT * FROM hadiths
        WHERE explanation IS NOT NULL
        AND source IN ('Sahih Bukhari', 'Sahih Muslim')
        ORDER BY source, chapter_no, hadith_no
    """
    ).fetchall()

    hadith_count = len(hadiths)
    print(f"Found {hadith_count} hadiths with explanations")

    print("Fetching chapters from database...")
    chapters = conn.execute(
        """
        SELECT source, chapter_no, chapter, COUNT(*) as hadith_count
        FROM hadiths
        WHERE source IN ('Sahih Bukhari', 'Sahih Muslim')
        GROUP BY source, chapter_no, chapter
        ORDER BY source, chapter_no
        """
    ).fetchall()

    chapter_count = len(chapters)
    print(f"Found {chapter_count} chapters")

    # Close the database connection before parallelizing
    conn.close()

    # Create required directories for all sources and chapters up front to avoid race conditions
    for hadith in hadiths:
        hadith_dict = dict(zip(hadith_columns, hadith))
        source_dir = og_images_dir / "hadiths" / hadith_dict["source"].replace(" ", "_")
        chapter_dir = source_dir / str(hadith_dict["chapter_no"])
        create_directory_if_not_exists(source_dir)
        create_directory_if_not_exists(chapter_dir)

    for chapter_data in chapters:
        source = chapter_data[0]
        source_dir = og_images_dir / "chapters" / source.replace(" ", "_")
        create_directory_if_not_exists(source_dir)

    def process_narrator(narrator):
        narrator_dict = dict(zip(narrator_columns, narrator))
        sanitized_name = (
            str(narrator_dict["name"])
            .replace("/", "-")
            .replace("\\", "-")
            .replace(":", "_")
        )
        output_path = og_images_dir / "narrators" / f"{sanitized_name}.png"
        try:
            generate_narrator_og_image(narrator_dict, output_path, fonts)
            return True
        except Exception as e:
            print(f"Error generating OG image for narrator {sanitized_name}: {e}")
            return False

    def process_hadith(hadith):
        hadith_dict = dict(zip(hadith_columns, hadith))
        source_dir = og_images_dir / "hadiths" / hadith_dict["source"].replace(" ", "_")
        chapter_dir = source_dir / str(hadith_dict["chapter_no"])
        sanitized_hadith_no = (
            str(hadith_dict["hadith_no"]).replace("/", "-").replace(":", "_").strip()
        )
        output_path = chapter_dir / f"{sanitized_hadith_no}.png"

        try:
            generate_hadith_og_image(hadith_dict, output_path, fonts)
            return True
        except Exception as e:
            print(f"Error generating OG image for hadith {sanitized_hadith_no}: {e}")
            return False

    def process_chapter(chapter_data):
        source, chapter_no, chapter_name, hadith_count = chapter_data
        source_dir = og_images_dir / "chapters" / source.replace(" ", "_")
        output_path = source_dir / f"{chapter_no}.png"

        try:
            generate_chapter_og_image(
                source, chapter_no, chapter_name, hadith_count, output_path, fonts
            )
            return True
        except Exception as e:
            print(f"Error generating OG image for chapter {chapter_no}: {e}")
            return False

    max_workers = min(32, os.cpu_count() * 4)
    print(f"Using {max_workers} parallel workers for image generation")

    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = []

        # Submit all tasks at once
        for narrator in narrators:
            futures.append(executor.submit(process_narrator, narrator))

        for hadith in hadiths:
            futures.append(executor.submit(process_hadith, hadith))

        for chapter in chapters:
            futures.append(executor.submit(process_chapter, chapter))

        # Track progress for all tasks together
        success_count = 0
        total_count = len(futures)

        for future in tqdm(
            concurrent.futures.as_completed(futures),
            total=total_count,
            desc="Generating images",
        ):
            if future.result():
                success_count += 1

    duration = round(time.time() - start_time, 2)
    print("OG image generation complete!")
    print(f"Successfully generated {success_count}/{total_count} images")
    print(f"Total generation time: {duration} seconds")

    metrics_html = f"""
        <p>Total images generated: {success_count}/{total_count}</p>
        <p>Generation time: {duration} seconds</p>
    </div>
    """

    html_content = create_index_html(og_images_dir)
    if html_content:
        metrics_pos = html_content.find('<div class="metrics">') + len(
            '<div class="metrics">'
        )
        html_content = (
            html_content[:metrics_pos] + metrics_html + html_content[metrics_pos:]
        )

        with open(og_images_dir / "index.html", "w", encoding="utf-8") as f:
            f.write(html_content)

    print("View the preview of generated images at /images/og-images/index.html")


if __name__ == "__main__":
    main()
