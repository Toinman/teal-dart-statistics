import json
import os
from datetime import datetime

def generate_html_page(output_html):
    player_stats = {}
    json_directory = os.getcwd()  # Gets the current working directory
    print(f"Looking for JSON files in the current directory: {json_directory}")

    # Read each JSON file and extract the latest numLegs stat for each player
    for filename in os.listdir(json_directory):
        if filename.endswith('.json') and filename.startswith('stats_'):
            filepath = os.path.join(json_directory, filename)
            print(f"Processing file: {filepath}")
            
            try:
                with open(filepath, 'r') as file:
                    data = json.load(file)
                if not data:
                    print(f"File {filename} contains no data.")
                    continue
                latest_date = max(data.keys())
                num_legs = data[latest_date].get('numLegs', 'Data not available')
                player_name = filename.split('stats_')[1].split('.json')[0]
                player_stats[player_name] = num_legs
                print(f"Extracted numLegs for {player_name} on {latest_date}: {num_legs}")
            except Exception as e:
                print(f"Error processing file {filename}: {e}")

    if not player_stats:
        print("No player stats found. Exiting.")
        return

    # Generate HTML content
    html_content = '<!DOCTYPE html>\n<html>\n<head>\n<title>Player Stats</title>\n</head>\n<body>\n<h1>Player Stats</h1>\n<ul>\n'
    for player, num_legs in player_stats.items():
        html_content += f'  <li>{player}: {num_legs}</li>\n'
    html_content += '</ul>\n</body>\n</html>'

    # Write the HTML content to a file
    with open(output_html, 'w') as html_file:
        html_file.write(html_content)
    print(f"HTML page generated successfully: {output_html}")

# Usage
output_html = 'player_stats.html'
generate_html_page(output_html)
