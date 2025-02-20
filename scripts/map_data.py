import csv
from rapidfuzz import process, fuzz

# Function to read and parse open_hadith.csv
def read_open_hadith(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        reader = csv.reader(file)
        open_hadiths = [row for row in reader]
    return open_hadiths

# Function to read and parse hadiths.csv
def read_hadiths(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        hadiths = [row for row in reader]
    return hadiths

# Function to filter Hadiths by source (Sahih Bukhari)
def filter_sahih_bukhari(hadiths):
    return [h for h in hadiths if h['source'] == ' Sahih Bukhari ']

# Function to match Hadiths based on text similarity
def match_hadiths(open_hadiths, hadiths):
    matched = []
    unmatched_hadiths = hadiths.copy()  # Start with all hadiths as unmatched

    for oh in open_hadiths:
        oh_id = oh[0]  # ID from open_hadith.csv
        oh_text = oh[1]  # Text from open_hadith.csv

        # Find the best match in hadiths.csv
        best_match = None
        best_score = 0

        for h in hadiths:
            # Calculate text similarity using rapidfuzz
            score = fuzz.ratio(oh_text, h['text_ar'])
            if score > best_score:
                best_score = score
                best_match = h

        # If a match is found, add it to the matched list and remove from unmatched
        if best_match and best_score > 80:  # Adjust similarity threshold as needed
            matched.append((oh_id, best_match['hadith_no']))
            if best_match in unmatched_hadiths:
                unmatched_hadiths.remove(best_match)

    return matched, unmatched_hadiths

# Function to write matched Hadiths to a CSV file
def write_matched(matched, file_path):
    with open(file_path, 'w', encoding='utf-8', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['open_hadith_id', 'hadith_no'])  # Write header
        writer.writerows(matched)  # Write matched rows

# Function to write unmatched Hadiths to a CSV file
def write_unmatched(unmatched, file_path):
    with open(file_path, 'w', encoding='utf-8', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['hadith_no'])  # Write header
        for h in unmatched:
            writer.writerow([h['hadith_no']])  # Write unmatched hadith_no

# Main function
def main():
    open_hadiths = read_open_hadith('data/open_hadith.csv')
    hadiths = read_hadiths('data/hadiths.csv')

    # Filter Hadiths to only include Sahih Bukhari
    sahih_bukhari_hadiths = filter_sahih_bukhari(hadiths)

    matched, unmatched = match_hadiths(open_hadiths, sahih_bukhari_hadiths)

    write_matched(matched, 'data/matched_hadiths.csv')
    write_unmatched(unmatched, 'data/unmatched_hadiths.csv')

if __name__ == "__main__":
    main()
