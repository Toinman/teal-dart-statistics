import json
import os
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Assuming all your JSON files are in the 'json_directory'
json_directory = 'json_files'  # Replace with your JSON files directory

# Directory to store chart data files
chart_files_directory = 'chart_files'


# CHART 1: WIN RATIO --------------------------------------------------
# This will hold all players' data for the win-ratio chart
win_ratio_data = {}

# Read each JSON file and calculate win ratio
for filename in os.listdir(json_directory):
    if filename.endswith('.json') and filename.startswith('stats_'):
        filepath = os.path.join(json_directory, filename)
        with open(filepath, 'r') as file:
            player_data = json.load(file)
            player_name = filename.replace('stats_', '').replace('.json', '')
            win_ratios = [
                {'date': date, 'winRatio': day_data['legsWon'] / day_data['numLegs']}
                for date, day_data in player_data.items() if day_data['numLegs'] > 0
            ]
            win_ratio_data[player_name] = win_ratios

# Sort the data by date for each player
for player_name in win_ratio_data.keys():
    win_ratio_data[player_name].sort(key=lambda x: x['date'])

# Ensure the chart_files_directory exists
if not os.path.exists(chart_files_directory):
    os.makedirs(chart_files_directory)
    logging.info(f"Created directory: {chart_files_directory}")

# Write the win ratio data to a JSON file in chart_files_directory
win_ratio_file_path = os.path.join(chart_files_directory, 'win_ratio_data.json')
with open(win_ratio_file_path, 'w') as json_file:
    json.dump(win_ratio_data, json_file, indent=4)
    logging.info(f"Win ratio data file created: {win_ratio_file_path}")


#END CHART --------------------------------------------------


# CHART 2: EVOLUTION OF AVERAGE ---------------------------------------
average_data = {}

# Read each JSON file and calculate average
for filename in os.listdir(json_directory):
    if filename.endswith('.json') and filename.startswith('stats_'):
        filepath = os.path.join(json_directory, filename)
        with open(filepath, 'r') as file:
            player_data = json.load(file)
            player_name = filename.replace('stats_', '').replace('.json', '')
            averages = [
                {'date': date, 'average': round(day_data['average']['average'], 2)}
                for date, day_data in player_data.items() if 'average' in day_data
            ]
            average_data[player_name] = averages

# Sort the data by date for each player
for player_name in average_data.keys():
    average_data[player_name].sort(key=lambda x: x['date'])

# Write the average data to a JSON file
average_file_path = os.path.join(chart_files_directory, 'average_data.json')
with open(average_file_path, 'w') as json_file:
    json.dump(average_data, json_file, indent=4)
    logging.info(f"Average data file created: {average_file_path}")

#END CHART --------------------------------------------------


# CHART 3: EVOLUTION OF CHECKOUT PERCENT -------------------------------
checkout_percent_data = {}

# Read each JSON file and calculate checkout percent
for filename in os.listdir(json_directory):
    if filename.endswith('.json') and filename.startswith('stats_'):
        filepath = os.path.join(json_directory, filename)
        with open(filepath, 'r') as file:
            player_data = json.load(file)
            player_name = filename.replace('stats_', '').replace('.json', '')
            checkout_percents = [
                {'date': date, 'checkoutPercent': round((day_data['average']['checkoutPercent']*100), 2)}
                for date, day_data in player_data.items() if 'average' in day_data and 'checkoutPercent' in day_data['average']
            ]
            checkout_percent_data[player_name] = checkout_percents

# Sort the data by date for each player
for player_name in checkout_percent_data.keys():
    checkout_percent_data[player_name].sort(key=lambda x: x['date'])

# Write the checkout percent data to a JSON file
checkout_percent_file_path = os.path.join(chart_files_directory, 'checkout_percent_data.json')
with open(checkout_percent_file_path, 'w') as json_file:
    json.dump(checkout_percent_data, json_file, indent=4)
    logging.info(f"Checkout percent data file created: {checkout_percent_file_path}")

#END CHART --------------------------------------------------


# CHART 4: HIGHEST CHECKOUT ------------------------------------------------
highest_checkout_data = {}

# Read each JSON file and find the highest checkout for the latest date
for filename in os.listdir(json_directory):
    if filename.endswith('.json') and filename.startswith('stats_'):
        filepath = os.path.join(json_directory, filename)
        with open(filepath, 'r') as file:
            player_data = json.load(file)
            player_name = filename.replace('stats_', '').replace('.json', '')

            # Find the latest date entry
            latest_date = max(player_data.keys())

            # Extract the highest checkout from the latest date
            if 'best' in player_data[latest_date] and 'checkoutPoints' in player_data[latest_date]['best']:
                highest_checkout = player_data[latest_date]['best']['checkoutPoints']
                highest_checkout_data[player_name] = highest_checkout

# Write the highest checkout data to a JSON file
highest_checkout_file_path = os.path.join(chart_files_directory, 'highest_checkout_data.json')
with open(highest_checkout_file_path, 'w') as json_file:
    json.dump(highest_checkout_data, json_file, indent=4)
    logging.info(f"Highest checkout data file created: {highest_checkout_file_path}")

# END CHART -------------------------------------------------------------

