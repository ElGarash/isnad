from bs4 import BeautifulSoup
import json
import pandas as pd
from tqdm import tqdm
import logging
from pathlib import Path
import concurrent.futures
from typing import Dict, List, Optional

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler("scholar_processing.log"), logging.StreamHandler()],
)


class ScholarSourceProcessor:
    def __init__(self, csv_path: str, output_path: str):
        self.csv_path = Path(csv_path)
        self.output_path = Path(output_path)
        self.scholars_data = {}

    def process_single_scholar(self, row: pd.Series) -> Dict:
        """Process sources for a single scholar entry."""
        try:
            scholar_id = row["ID"]
            html_content = row["Sources"]

            # Skip if no sources
            if pd.isna(html_content) or not html_content.strip():
                return {
                    "scholar_id": scholar_id,
                    "name": row["Full Name"],
                    "sources": [],
                }

            # Parse HTML content
            soup = BeautifulSoup(html_content, "html.parser")
            hr_tags = soup.find_all("hr")
            sources = []

            # Handle content before first hr tag
            if hr_tags:
                first_content = self._extract_first_source_content(soup, hr_tags[0])
                if first_content:
                    sources.append(first_content)

                # Process content between hr tags
                for i in range(len(hr_tags) - 1):
                    source_data = self._extract_source_content(
                        hr_tags[i], hr_tags[i + 1]
                    )
                    if source_data:
                        sources.append(source_data)

            return {
                "scholar_id": scholar_id,
                "name": row["Full Name"],
                "sources": sources,
            }

        except Exception as e:
            logging.error(f"Error processing scholar ID {row['ID']}: {str(e)}")
            return {
                "scholar_id": row["ID"],
                "name": row["Full Name"],
                "sources": [],
                "error": str(e),
            }

    def _extract_first_source_content(
        self, soup: BeautifulSoup, first_hr: BeautifulSoup
    ) -> Optional[Dict]:
        """Extract source and content before the first hr tag."""
        try:
            # Get the book source
            book_source = ""
            content = ""
            current_element = soup.find("div").contents[0]

            # Process until we hit the first br tag for book source
            while current_element and (
                not hasattr(current_element, "name") or current_element.name != "br"
            ):
                if isinstance(current_element, str):
                    book_source += current_element
                else:
                    book_source += current_element.get_text()
                current_element = current_element.next_sibling

            # Process from br tag until first hr for content
            while current_element and current_element != first_hr:
                if isinstance(current_element, str):
                    content += current_element
                elif hasattr(current_element, "name") and current_element.name == "br":
                    content += "\n"
                else:
                    content += current_element.get_text()
                current_element = current_element.next_sibling

            # Clean up strings
            book_source = book_source.strip()
            content = content.strip()

            return (
                {"book_source": book_source, "content": content}
                if book_source and content
                else None
            )

        except Exception as e:
            logging.error(f"Error extracting first source content: {str(e)}")
            return None

    def _extract_source_content(
        self, current_hr: BeautifulSoup, next_hr: BeautifulSoup
    ) -> Optional[Dict]:
        """Extract source and content between two hr tags."""
        try:
            # Get the book source
            book_source = ""
            next_element = current_hr.next_sibling
            while next_element and (
                not hasattr(next_element, "name") or next_element.name != "br"
            ):
                if isinstance(next_element, str):
                    book_source += next_element
                else:
                    book_source += next_element.get_text()
                next_element = next_element.next_sibling

            # Get the content
            content = ""
            while next_element and next_element != next_hr:
                if isinstance(next_element, str):
                    content += next_element
                elif hasattr(next_element, "name") and next_element.name == "br":
                    content += "\n"
                else:
                    content += next_element.get_text()
                next_element = next_element.next_sibling

            # Clean up strings
            book_source = book_source.strip()
            content = content.strip()

            return (
                {"book_source": book_source, "content": content}
                if book_source and content
                else None
            )

        except Exception as e:
            logging.error(f"Error extracting source content: {str(e)}")
            return None

    def process_all_scholars(self) -> None:
        """Process all scholars in the CSV file."""
        try:
            # Read CSV file
            df = pd.read_csv(self.csv_path)
            logging.info(f"Processing {len(df)} scholars...")

            # Process scholars in parallel
            with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
                future_to_row = {
                    executor.submit(self.process_single_scholar, row): row
                    for _, row in df.iterrows()
                }

                results = []
                for future in tqdm(
                    concurrent.futures.as_completed(future_to_row), total=len(df)
                ):
                    result = future.result()
                    # Only add results that have valid data
                    if (
                        not pd.isna(result["name"])
                        and result["sources"]
                        and not (  # Has sources
                            isinstance(result.get("error"), str) and result["error"]
                        )  # No errors
                    ):
                        results.append(result)

            # Save results
            self._save_results(results)
            logging.info(
                f"Processing completed successfully. Saved {len(results)} valid entries."
            )

        except Exception as e:
            logging.error(f"Error processing scholars: {str(e)}")
            raise

    def _save_results(self, results: List[Dict]) -> None:
        """Save processed results to JSON file."""
        try:
            with open(self.output_path, "w", encoding="utf-8") as f:
                json.dump(results, f, ensure_ascii=False, indent=4)
            logging.info(f"Results saved to {self.output_path}")
        except Exception as e:
            logging.error(f"Error saving results: {str(e)}")
            raise


def main():
    # Configuration
    CSV_PATH = "data/scholars_data.csv"
    OUTPUT_PATH = "data/scholars_sources.json"

    # Process scholars
    processor = ScholarSourceProcessor(CSV_PATH, OUTPUT_PATH)
    processor.process_all_scholars()


if __name__ == "__main__":
    main()
