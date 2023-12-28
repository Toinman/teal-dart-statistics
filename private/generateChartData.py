import json
import os
import logging


def generate_chart_data(json_directory, chart_files_directory):
    # CHART 1: WIN RATIO --------------------------------------------------
    win_ratio_data = generate_win_ratio_data(json_directory)
    write_chart_data(win_ratio_data, chart_files_directory, 'win_ratio_data.json')

    # CHART 2: EVOLUTION OF AVERAGE ---------------------------------------
    average_data = generate_average_data(json_directory)
    write_chart_data(average_data, chart_files_directory, 'average_data.json')

    # CHART 3: EVOLUTION OF CHECKOUT PERCENT -------------------------------
    checkout_percent_data = generate_checkout_percent_data(json_directory)
    write_chart_data(checkout_percent_data, chart_files_directory, 'checkout_percent_data.json')

    # CHART 4: HIGHEST CHECKOUT --------------------------------------------
    highest_checkout_data = generate_highest_checkout_data(json_directory)
    write_chart_data(highest_checkout_data, chart_files_directory, 'highest_checkout_data.json')

    # CHART 5: FIRST 9 AVERAGE --------------------------------------------
    first9_average_data = generate_first9_average_data(json_directory)
    write_chart_data(first9_average_data, chart_files_directory, 'first9_average_data.json')



def generate_win_ratio_data(json_directory):
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

    return win_ratio_data

def generate_average_data(json_directory):

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

    return average_data

def generate_checkout_percent_data(json_directory):
  
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

    return checkout_percent_data

def generate_highest_checkout_data(json_directory):

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
    return highest_checkout_data

def generate_first9_average_data(json_directory):
    first9_average_data = {}

    # Read each JSON file and calculate the first 9 average
    for filename in os.listdir(json_directory):
        if filename.endswith('.json') and filename.startswith('stats_'):
            filepath = os.path.join(json_directory, filename)
            with open(filepath, 'r') as file:
                player_data = json.load(file)
                player_name = filename.replace('stats_', '').replace('.json', '')
                first9_averages = [
                    {'date': date, 'first9Average': round(day_data['average']['first9Average'], 2)}
                    for date, day_data in player_data.items() if 'average' in day_data and 'first9Average' in day_data['average']
                ]
                first9_average_data[player_name] = first9_averages

    # Sort the data by date for each player
    for player_name in first9_average_data.keys():
        first9_average_data[player_name].sort(key=lambda x: x['date'])

    return first9_average_data


def write_chart_data(data, chart_files_directory, filename):
    file_path = os.path.join(chart_files_directory, filename)
    with open(file_path, 'w') as json_file:
        json.dump(data, json_file, indent=4)
        logging.info(f"{filename} file created: {file_path}")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    json_directory = os.path.join(base_path, 'json_files')
    chart_files_directory = os.path.join(base_path, 'chart_files')

    if not os.path.exists(json_directory):
        os.makedirs(json_directory)
        logging.info(f"Created directory: {json_directory}")

    if not os.path.exists(chart_files_directory):
        os.makedirs(chart_files_directory)
        logging.info(f"Created directory: {chart_files_directory}")

    generate_chart_data(json_directory, chart_files_directory)

