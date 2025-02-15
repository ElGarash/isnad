import requests
from bs4 import BeautifulSoup
import csv
import time

def clean_text(text):
  # Remove extra whitespace and newlines
  return ' '.join(text.strip().split())

def clean_html_for_csv(html_str):
  if not html_str:
    return ''
  # Replace newlines and carriage returns with space
  cleaned = html_str.replace('\n', ' ').replace('\r', ' ')
  # Replace double quotes with escaped double quotes
  cleaned = cleaned.replace('"', '""')
  # Remove multiple spaces
  cleaned = ' '.join(cleaned.split())
  # Remove/replace other problematic characters
  cleaned = cleaned.replace('\x00', '')  # null bytes
  cleaned = cleaned.replace('\x1a', '')  # ctrl+Z
  cleaned = cleaned.replace('\x1c', '')  # file separator
  cleaned = cleaned.replace('\x1d', '')  # group separator
  cleaned = cleaned.replace('\x1e', '')  # record separator
  cleaned = cleaned.replace('\x1f', '')  # unit separator
  return cleaned

def extract_scholar_info(url):
  try:
    # Add delay to be respectful to the server
    time.sleep(1)

    response = requests.get(url)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, 'html.parser')

    # Get scholar ID
    scholar_id = url.split('ID=')[1]

    # Initialize dictionary to store scholar info
    scholar_info = {
      'ID': scholar_id,
      'Full Name': '',
      'Parents': '',
      'Siblings': '',
      'Spouse(s)': '',
      'Children': '',
      'Sources': '',
      'Thadeeb-al-Kamal': ''
    }

    # Extract div contents
    hideshow_div = soup.find('div', id=f'hideshow{scholar_id}')
    if hideshow_div:
      scholar_info['Sources'] = clean_html_for_csv(str(hideshow_div))

    kamal_div = soup.find('div', id=f'kamal{scholar_id}')
    if kamal_div:
      scholar_info['Thadeeb-al-Kamal'] = clean_html_for_csv(str(kamal_div))

    # Find all table rows
    rows = soup.find_all('tr')

    # Extract information from rows
    for row in rows:
      cells = row.find_all('td')
      if not cells:
        continue

      first_cell = cells[0].get_text().strip()
      if 'Full Name:' in first_cell:
        scholar_info['Full Name'] = clean_text(cells[1].get_text())
      elif 'Parents:' in first_cell:
        scholar_info['Parents'] = clean_text(cells[1].get_text())
      elif 'Siblings:' in first_cell:
        scholar_info['Siblings'] = clean_text(cells[1].get_text())
      elif 'Spouse(s):' in first_cell:
        scholar_info['Spouse(s)'] = clean_text(cells[1].get_text())
      elif 'Children :' in first_cell:
        scholar_info['Children'] = clean_text(cells[1].get_text())

    return scholar_info

  except Exception as e:
    print(f"Error processing URL {url}: {str(e)}")
    return None

def main():
  base_url = "https://muslimscholars.info/manage.php?submit=scholar&ID="
  output_file = "scholars_data.csv"

  # Define field names for CSV
  fieldnames = ['ID', 'Full Name', 'Parents', 'Siblings', 'Spouse(s)',
         'Children', 'Sources', 'Thadeeb-al-Kamal']

  # Open CSV file for writing
  with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames,
                quoting=csv.QUOTE_ALL)
    writer.writeheader()

    # Iterate through IDs
    for scholar_id in range(2, 40024):
      url = f"{base_url}{scholar_id}"
      print(f"Processing ID: {scholar_id}")

      scholar_info = extract_scholar_info(url)
      if scholar_info:
        writer.writerow(scholar_info)

if __name__ == "__main__":
  main()
