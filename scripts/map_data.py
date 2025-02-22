import csv
from rapidfuzz import fuzz
import os


# Function to read and parse open_hadiths.csv (no headers)
def read_open_hadiths(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        reader = csv.reader(file)
        open_hadiths = [row for row in reader]
    return open_hadiths


# Function to read and parse hadiths.csv (with headers)
def read_hadiths(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        hadiths = [row for row in reader]
    return hadiths


# Function to read and parse explanations.csv (no headers)
def read_explanations(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        reader = csv.reader(file)
        explanations = {row[0]: row[2] for row in reader}  # Map ID to explanation
    return explanations


# Function to filter Hadiths by source
def filter_hadiths_by_source(hadiths, source):
    # Strip leading/trailing spaces from column names and values
    filtered_hadiths = []
    for h in hadiths:
        # Ensure the 'source' column exists and strip spaces
        if "source" in h:
            h_source = h["source"].strip()
            if h_source == source:
                filtered_hadiths.append(h)
        else:
            raise KeyError("The 'source' column is missing in the Hadiths file.")
    return filtered_hadiths


# Function to match Hadiths based on text similarity
def match_hadiths(open_hadiths, hadiths, explanations):
    matched = []
    unmatched_hadiths = hadiths.copy()  # Start with all hadiths as unmatched

    for oh in open_hadiths:
        oh_id = oh[0]  # ID from open_hadith.csv
        oh_text = oh[1]  # Text from open_hadith.csv

        # Skip if explanation is empty
        if oh_id not in explanations or not explanations[oh_id].strip():
            continue

        # Find the best match in hadiths.csv
        best_match = None
        best_score = 0

        for h in hadiths:
            # Calculate text similarity using rapidfuzz
            score = fuzz.ratio(oh_text, h["text_ar"])
            if score > best_score:
                best_score = score
                best_match = h

        # If a match is found, add it to the matched list and remove from unmatched
        if best_match and best_score > 80:  # Adjust similarity threshold as needed
            matched.append((oh_id, best_match["hadith_no"]))
            if best_match in unmatched_hadiths:
                unmatched_hadiths.remove(best_match)

    return matched, unmatched_hadiths


# Function to write matched Hadiths to a CSV file
def write_matched(matched, file_path):
    with open(file_path, "w", encoding="utf-8", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["open_hadith_id", "hadith_no"])  # Write header
        writer.writerows(matched)  # Write matched rows


# Function to write unmatched Hadiths to a CSV file
def write_unmatched(unmatched, file_path):
    with open(file_path, "w", encoding="utf-8", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["hadith_no"])  # Write header
        for h in unmatched:
            writer.writerow([h["hadith_no"]])  # Write unmatched hadith_no


# Function to process a single source
def process_source(source, folder_name, data_dir):
    # Define file paths
    hadiths_dataset_path = os.path.join(data_dir, "hadiths_dataset.csv")
    open_hadiths_path = os.path.join(data_dir, folder_name, "hadiths.csv")
    explanations_path = os.path.join(data_dir, folder_name, "explanations.csv")
    matched_path = os.path.join(data_dir, folder_name, "matched_hadiths.csv")
    unmatched_path = os.path.join(data_dir, folder_name, "unmatched_hadiths.csv")

    # Read data
    open_hadiths = read_open_hadiths(open_hadiths_path)
    explanations = read_explanations(explanations_path)
    hadiths_dataset = read_hadiths(hadiths_dataset_path)

    # Filter Hadiths by source
    filtered_hadiths = filter_hadiths_by_source(hadiths_dataset, source)

    # Match Hadiths
    matched, unmatched = match_hadiths(open_hadiths, filtered_hadiths, explanations)

    # Write results
    write_matched(matched, matched_path)
    write_unmatched(unmatched, unmatched_path)

    print(f"Processed {source}: {len(matched)} matches, {len(unmatched)} unmatched")


# Main function
def main():
    # Define folder names and their corresponding sources
    source_mapping = {
        "bukhari": "Sahih Bukhari",
        "muslim": "Sahih Muslim",
    }

    # Define data directory
    data_dir = "data"

    # Process each source
    for folder_name, source in source_mapping.items():
        process_source(source, folder_name, data_dir)


if __name__ == "__main__":
    main()
