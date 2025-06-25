import os
import sqlite3
import time
import concurrent.futures
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from tqdm import tqdm
import arabic_reshaper


def get_db_connection():
    db_path = Path("data/sqlite.db")
    return sqlite3.connect(db_path)


def create_directory_if_not_exists(directory):
    """Create directory if it doesn't exist"""
    try:
        os.makedirs(directory, exist_ok=True)
    except Exception:
        pass


def prepare_arabic_text(text):
    """Prepare Arabic text for RTL display"""
    if not text:
        return ""

    # For OG images, we might need to use only reshaping without bidi
    # to ensure compatibility with social media platforms
    try:
        # Only reshape Arabic text to connect letters properly
        # Don't apply bidi algorithm as it might cause issues in some contexts
        reshaped_text = arabic_reshaper.reshape(text)
        return reshaped_text
    except Exception as e:
        print(f"Error processing Arabic text '{text}': {e}")
        return text


def draw_text_with_wrapping_rtl(
    draw, text, font, x, y, max_width, line_height, color, direction="rtl"
):
    """Draw text with word wrapping and RTL support"""
    if not text:
        return y

    # Prepare Arabic text for RTL display
    prepared_text = prepare_arabic_text(text)

    # Calculate text dimensions to determine wrapping
    lines = []
    words = prepared_text.split(" ")
    current_line = ""

    for word in words:
        test_line = current_line + " " + word if current_line else word
        bbox = draw.textbbox((0, 0), test_line, font=font)
        line_width = bbox[2] - bbox[0]

        if line_width <= max_width:
            current_line = test_line
        else:
            if current_line:
                lines.append(current_line)
                current_line = word
            else:
                lines.append(word)

    if current_line:
        lines.append(current_line)

    # Draw each line
    for i, line in enumerate(lines):
        line_y = y + i * line_height
        if direction == "rtl":
            # Get line width for right alignment
            bbox = draw.textbbox((0, 0), line, font=font)
            line_width = bbox[2] - bbox[0]
            line_x = x + max_width - line_width
        else:
            line_x = x

        draw.text((line_x, line_y), line, font=font, fill=color)

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


def create_base_image(width=1200, height=630, background_color="#e6ded1"):
    """Create an elegant, minimal base image with borders and corners"""
    # Elegant color scheme
    parchment = "#e6ded1"
    navy = "#1b2b3b"
    gold = "#c49b66"

    # Create clean background
    image = Image.new("RGB", (width, height), parchment)
    draw = ImageDraw.Draw(image)

    # Add elegant corner accents
    corner_size = 40

    # Top right corner accent
    draw.polygon(
        [(width - corner_size, 0), (width, 0), (width, corner_size)], fill=gold
    )

    # Bottom left corner accent
    draw.polygon(
        [(0, height - corner_size), (corner_size, height), (0, height)], fill=navy
    )

    # Elegant border frame
    border_margin = 15
    draw.rectangle(
        [
            border_margin,
            border_margin,
            width - border_margin - 1,
            height - border_margin - 1,
        ],
        outline=navy,
        width=2,
    )

    return image, draw


def generate_narrator_og_image(narrator, output_path, fonts):
    """Generate elegant minimal OG image for narrator profile page"""
    image, draw = create_base_image()
    width, height = image.size

    # Elegant color scheme
    primary_text = "#1b2b3b"  # Navy
    accent_color = "#c49b66"  # Gold

    # Simple centered layout
    # Title with elegant typography
    title = prepare_arabic_text(narrator["name"])
    title_font = fonts.get("title_bold")

    # Center the title (moved higher)
    title_bbox = draw.textbbox((0, 0), title, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (width - title_width) // 2
    title_y = height // 2 - 120

    draw.text((title_x, title_y), title, font=title_font, fill=primary_text)

    # Subtle subtitle
    subtitle = prepare_arabic_text("راوي حديث")
    subtitle_font = fonts.get("subtitle")
    subtitle_bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
    subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
    subtitle_x = (width - subtitle_width) // 2
    subtitle_y = title_y + 120

    draw.text((subtitle_x, subtitle_y), subtitle, font=subtitle_font, fill=accent_color)

    # Minimal decorative element
    decoration_y = subtitle_y + 60
    decoration_width = 120
    decoration_x = (width - decoration_width) // 2
    draw.rectangle(
        [decoration_x, decoration_y, decoration_x + decoration_width, decoration_y + 3],
        fill=accent_color,
    )

    image.save(output_path)


def generate_hadith_og_image(hadith, output_path, fonts):
    """Generate elegant minimal OG image for hadith detail page"""
    image, draw = create_base_image()
    width, height = image.size

    # Elegant colors
    primary_text = "#1b2b3b"
    accent_color = "#c49b66"

    # Convert numbers to Arabic numerals
    def to_arabic_numerals(num):
        arabic_digits = "٠١٢٣٤٥٦٧٨٩"
        return "".join(arabic_digits[int(d)] for d in str(num))

    # Convert source names to Arabic
    def get_arabic_source(source):
        source_mapping = {"Sahih Bukhari": "صحيح البخاري", "Sahih Muslim": "صحيح مسلم"}
        return source_mapping.get(source, source)

    # Content area with proper margins
    margin = 80
    content_width = width - (margin * 2)
    content_x = margin

    # Title - centered and elegant (ABOVE the line)
    title = prepare_arabic_text("حديث شريف")
    title_font = fonts.get("title_bold")
    title_bbox = draw.textbbox((0, 0), title, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (width - title_width) // 2
    draw.text((title_x, 90), title, font=title_font, fill=primary_text)

    # Elegant separator line (BELOW the title)
    line_y = 190
    line_width = 200
    line_x = (width - line_width) // 2
    draw.rectangle([line_x, line_y, line_x + line_width, line_y + 2], fill=accent_color)

    # Information section with proper spacing (BELOW the line)
    info_start_y = 240
    info_font = fonts.get("text")
    line_spacing = 45

    # All text right-aligned (RTL)

    # Source (using Arabic names)
    arabic_source = get_arabic_source(hadith["source"])
    source_text = prepare_arabic_text(f"المصدر: {arabic_source}")
    source_bbox = draw.textbbox((0, 0), source_text, font=info_font)
    source_width = source_bbox[2] - source_bbox[0]
    source_x = content_x + content_width - source_width
    draw.text((source_x, info_start_y), source_text, font=info_font, fill=primary_text)

    # Chapter number
    if hadith.get("chapter_no"):
        chapter_num = to_arabic_numerals(hadith["chapter_no"])
        chapter_text = prepare_arabic_text(f"رقم الباب: {chapter_num}")
        chapter_bbox = draw.textbbox((0, 0), chapter_text, font=info_font)
        chapter_width = chapter_bbox[2] - chapter_bbox[0]
        chapter_x = content_x + content_width - chapter_width
        draw.text(
            (chapter_x, info_start_y + line_spacing),
            chapter_text,
            font=info_font,
            fill=primary_text,
        )

    # Hadith number
    hadith_num = to_arabic_numerals(hadith["hadith_no"])
    hadith_text = prepare_arabic_text(f"رقم الحديث: {hadith_num}")
    hadith_bbox = draw.textbbox((0, 0), hadith_text, font=info_font)
    hadith_width = hadith_bbox[2] - hadith_bbox[0]
    hadith_x = content_x + content_width - hadith_width
    draw.text(
        (hadith_x, info_start_y + line_spacing * 2),
        hadith_text,
        font=info_font,
        fill=primary_text,
    )

    # Subtle watermark at bottom
    watermark = prepare_arabic_text("إسناد")
    watermark_font = fonts.get("small")
    watermark_bbox = draw.textbbox((0, 0), watermark, font=watermark_font)
    watermark_width = watermark_bbox[2] - watermark_bbox[0]
    watermark_x = (width - watermark_width) // 2
    draw.text(
        (watermark_x, height - 75), watermark, font=watermark_font, fill=accent_color
    )

    image.save(output_path)


def generate_chapter_og_image(
    source, chapter_no, chapter_name, hadith_count, output_path, fonts
):
    """Generate modern RTL-compliant OG image for chapter page"""
    image, draw = create_base_image()
    width, height = image.size

    # Colors
    primary_text = "#1F2937"
    secondary_text = "#6B7280"
    accent_color = "#059669"

    # Source title
    source_text = prepare_arabic_text(source)
    source_font = fonts.get("title_medium")
    source_bbox = draw.textbbox((0, 0), source_text, font=source_font)
    source_width = source_bbox[2] - source_bbox[0]
    source_x = width - 80 - source_width
    draw.text((source_x, 60), source_text, font=source_font, fill=primary_text)

    # Chapter number
    chapter_text = prepare_arabic_text(f"الباب {chapter_no}")
    chapter_font = fonts.get("subtitle_bold")
    chapter_bbox = draw.textbbox((0, 0), chapter_text, font=chapter_font)
    chapter_width = chapter_bbox[2] - chapter_bbox[0]
    chapter_x = width - 80 - chapter_width
    draw.text((chapter_x, 140), chapter_text, font=chapter_font, fill=accent_color)

    # Decorative line
    line_start_x = width - 80 - max(source_width, chapter_width)
    draw.rectangle([line_start_x - 10, 200, width - 80, 205], fill=accent_color)

    y_position = 230

    # Chapter name with RTL support
    if chapter_name:
        prepared_name = prepare_arabic_text(chapter_name)
        name_font = fonts.get("text")

        # Create a card-like background for chapter name
        name_bbox = draw.textbbox((0, 0), prepared_name, font=name_font)
        name_width = name_bbox[2] - name_bbox[0]
        name_height = name_bbox[3] - name_bbox[1]

        # Wrap text if too long
        if name_width > width - 160:
            words = prepared_name.split()
            lines = []
            current_line = ""

            for word in words:
                test_line = current_line + " " + word if current_line else word
                test_bbox = draw.textbbox((0, 0), test_line, font=name_font)
                test_width = test_bbox[2] - test_bbox[0]

                if test_width <= width - 160:
                    current_line = test_line
                else:
                    if current_line:
                        lines.append(current_line)
                        current_line = word
                    else:
                        lines.append(word)

            if current_line:
                lines.append(current_line)

            # Background for text area
            text_height = len(lines) * 45 + 20
            draw.rectangle(
                [80, y_position - 10, width - 80, y_position + text_height],
                fill="#F8FAFC",
                outline="#E2E8F0",
                width=1,
            )

            # Draw lines with RTL alignment
            for i, line in enumerate(lines[:3]):  # Limit to 3 lines
                line_bbox = draw.textbbox((0, 0), line, font=name_font)
                line_width = line_bbox[2] - line_bbox[0]
                line_x = width - 90 - line_width
                draw.text(
                    (line_x, y_position + i * 45),
                    line,
                    font=name_font,
                    fill=primary_text,
                )

            y_position += len(lines[:3]) * 45 + 40
        else:
            # Single line
            name_x = width - 80 - name_width
            draw.text(
                (name_x, y_position), prepared_name, font=name_font, fill=primary_text
            )
            y_position += name_height + 40

    # Hadith count with modern styling
    count_text = prepare_arabic_text(f"عدد الأحاديث: {hadith_count}")
    count_font = fonts.get("subtitle")

    # Background for count
    count_bbox = draw.textbbox((0, 0), count_text, font=count_font)
    count_width = count_bbox[2] - count_bbox[0]
    count_height = count_bbox[3] - count_bbox[1]

    count_bg_x = width - 80 - count_width - 20
    draw.rectangle(
        [count_bg_x - 15, y_position - 5, width - 65, y_position + count_height + 5],
        fill=accent_color + "20",
        outline=accent_color,
        width=2,
    )

    count_x = width - 80 - count_width
    draw.text((count_x, y_position), count_text, font=count_font, fill=accent_color)

    # Add watermark at bottom
    watermark = prepare_arabic_text("إسناد - مجموعة الأحاديث")
    watermark_font = fonts.get("small")
    watermark_bbox = draw.textbbox((0, 0), watermark, font=watermark_font)
    watermark_width = watermark_bbox[2] - watermark_bbox[0]
    watermark_x = width - 40 - watermark_width
    draw.text(
        (watermark_x, height - 50), watermark, font=watermark_font, fill=secondary_text
    )

    image.save(output_path)


def generate_default_og_image(output_path, fonts):
    """Generate elegant minimal default OG image"""
    image, draw = create_base_image()
    width, height = image.size

    # Elegant colors
    primary_text = "#1b2b3b"
    accent_color = "#c49b66"

    # Simple centered logo/title (moved higher for better spacing)
    title = prepare_arabic_text("إسناد")
    title_font = fonts.get("title_bold")
    title_bbox = draw.textbbox((0, 0), title, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (width - title_width) // 2
    title_y = height // 2 - 100

    draw.text((title_x, title_y), title, font=title_font, fill=primary_text)

    # Subtle tagline (with more breathing space)
    subtitle = prepare_arabic_text("سلسلة الرواة")
    subtitle_font = fonts.get("subtitle")
    subtitle_bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
    subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
    subtitle_x = (width - subtitle_width) // 2
    subtitle_y = title_y + 120

    draw.text((subtitle_x, subtitle_y), subtitle, font=subtitle_font, fill=accent_color)

    image.save(output_path)


def generate_search_og_image(output_path, fonts):
    """Generate elegant minimal search page OG image"""
    image, draw = create_base_image()
    width, height = image.size

    # Elegant colors
    primary_text = "#1b2b3b"
    accent_color = "#c49b66"

    # Simple search icon in center
    center_x = width // 2
    center_y = height // 2 - 20

    # Elegant search circle
    radius = 40
    draw.ellipse(
        [center_x - radius, center_y - radius, center_x + radius, center_y + radius],
        outline=accent_color,
        width=4,
    )

    # Search handle
    handle_start = center_x + radius - 10
    handle_end = center_x + radius + 20
    draw.line(
        [handle_start, center_y + radius - 10, handle_end, center_y + radius + 20],
        fill=accent_color,
        width=4,
    )

    # Title below
    title = prepare_arabic_text("البحث")
    title_font = fonts.get("title_bold")
    title_bbox = draw.textbbox((0, 0), title, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (width - title_width) // 2
    title_y = center_y + 80

    draw.text((title_x, title_y), title, font=title_font, fill=primary_text)

    image.save(output_path)


def generate_home_og_image(output_path, fonts):
    """Generate elegant minimal home page OG image"""
    image, draw = create_base_image()
    width, height = image.size

    # Elegant colors
    primary_text = "#1b2b3b"
    accent_color = "#c49b66"

    # Simple centered welcome (moved higher for better spacing)
    title = prepare_arabic_text("إسناد")
    title_font = fonts.get("title_bold")
    title_bbox = draw.textbbox((0, 0), title, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (width - title_width) // 2
    title_y = height // 2 - 120

    draw.text((title_x, title_y), title, font=title_font, fill=primary_text)

    # Tagline (updated text with more breathing space)
    subtitle = prepare_arabic_text("سلسلة الأحاديث النبوية")
    subtitle_font = fonts.get("subtitle")
    subtitle_bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
    subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
    subtitle_x = (width - subtitle_width) // 2
    subtitle_y = title_y + 120

    draw.text((subtitle_x, subtitle_y), subtitle, font=subtitle_font, fill=accent_color)

    # Minimal decorative element
    decoration_y = subtitle_y + 60
    decoration_width = 150
    decoration_x = (width - decoration_width) // 2
    draw.rectangle(
        [decoration_x, decoration_y, decoration_x + decoration_width, decoration_y + 3],
        fill=accent_color,
    )

    image.save(output_path)


def generate_narrators_list_og_image(output_path, fonts):
    """Generate elegant minimal narrators list OG image with person icon"""
    image, draw = create_base_image()
    width, height = image.size

    # Elegant colors
    primary_text = "#1b2b3b"
    accent_color = "#c49b66"

    # Title (moved higher to avoid overlap with icon)
    title = prepare_arabic_text("الرواة")
    title_font = fonts.get("title_bold")
    title_bbox = draw.textbbox((0, 0), title, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (width - title_width) // 2
    title_y = height // 2 - 120

    draw.text((title_x, title_y), title, font=title_font, fill=primary_text)

    # Simple, elegant person icon - clean and minimal (made smaller)
    center_x = width // 2
    icon_y = height // 2 + 20

    # Head (smaller circle)
    head_radius = 18
    draw.ellipse(
        [
            center_x - head_radius,
            icon_y - head_radius,
            center_x + head_radius,
            icon_y + head_radius,
        ],
        fill=accent_color,
    )

    # Body (smaller rounded rectangle)
    body_width = 30
    body_height = 40
    body_y = icon_y + head_radius + 8

    # Body as a simple rounded shape
    draw.ellipse(
        [center_x - body_width, body_y, center_x + body_width, body_y + body_height],
        fill=accent_color,
    )

    # Subtitle
    subtitle = prepare_arabic_text("سلسلة الرواة")
    subtitle_font = fonts.get("text")
    subtitle_bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
    subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
    subtitle_x = (width - subtitle_width) // 2
    subtitle_y = body_y + body_height + 30

    draw.text((subtitle_x, subtitle_y), subtitle, font=subtitle_font, fill=primary_text)

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
    create_directory_if_not_exists(og_images_dir / "sources")

    fonts = FontLoader()

    print("Generating OG images...")

    # Generate specific page OG images
    generate_default_og_image(og_images_dir / "og-default.png", fonts)
    generate_home_og_image(og_images_dir / "og-home.png", fonts)
    generate_search_og_image(og_images_dir / "og-search.png", fonts)
    generate_narrators_list_og_image(og_images_dir / "og-narrators.png", fonts)

    # Generate source-specific OG images
    sources = ["Sahih_Bukhari", "Sahih_Muslim"]
    for source in sources:
        source_path = og_images_dir / "sources" / f"{source}.png"
        # Use default for now, could be customized per source
        generate_default_og_image(source_path, fonts)

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
