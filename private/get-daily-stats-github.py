from keycloak import KeycloakOpenID
import requests
import os
import json
from datetime import datetime

# Configuration details
AUTODART_AUTH_URL = "https://login.autodarts.io/"
AUTODART_AUTH_TICKET_URL = "https://api.autodarts.io/ms/v0/ticket"
AUTODART_CLIENT_ID = "autodarts-app"
AUTODART_REALM_NAME = "autodarts"
AUTODART_USER_EMAIL = os.environ.get('AUTODART_USER_EMAIL')
AUTODART_USER_PASSWORD = os.environ.get('AUTODART_USER_PASSWORD')


# If the script is in the 'private' folder, you need to navigate up one level to the parent directory
base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Define the base path for JSON files relative to the base_path
json_files_base_path = os.path.join(base_path, 'json_files')

# Define the path to the players.json file within the json_files directory
players_file_path = os.path.join(json_files_base_path, 'players.json')

# Make sure to create the directory if it does not exist
if not os.path.exists(json_files_base_path):
    os.makedirs(json_files_base_path)

# Import the function from generateChartData.py
from generateChartData import generate_chart_data

def getAllPlayers():
    authorize()
    url = "https://api.autodarts.io/as/v0/matches/filter?size=100&page=0&sort=-finished_at"
    response = requests.get(url, headers=headers)  # Now headers is defined
    json_resp = response.json()
    players = {}
    for item in json_resp['items']:
        for player in item['players']:
            if player['name'] not in players:
                players[player['name']] = player['userId']
    
    # Write the players dictionary to the players.json file
    with open(players_file_path, 'w') as fp:
        json.dump(players, fp, indent=2)

def getPlayer(name, first=True):
    # Correctly use os.path.isfile instead of path.isfile
    if not os.path.isfile(players_file_path):
        getAllPlayers()
    with open(players_file_path, 'r') as f:
        players = json.load(f)
        if name in players:
            return players[name]
        elif first:
            getAllPlayers()
            return getPlayer(name, False)
        else:
            print(f"No player found with the name: {name}")
            return None


def authorize():
    try:
        global headers
        # Configure client
        keycloak_openid = KeycloakOpenID(
            server_url=AUTODART_AUTH_URL,
            client_id=AUTODART_CLIENT_ID,
            realm_name=AUTODART_REALM_NAME,
            verify=True,
        )
        token = keycloak_openid.token(AUTODART_USER_EMAIL, AUTODART_USER_PASSWORD)
        accessToken = token["access_token"]
        headers = {"Authorization": f"Bearer {accessToken}"}
    except Exception as e:
        print("Receive token failed", e)

def get_daily_stats_for_player(player_name):
    authorize()
    player_id = getPlayer(player_name)
    if player_id:
        url = f"https://api.autodarts.io/as/v0/users/{player_id}/stats/x01?limit=100"
        response = requests.get(url, headers=headers)
        json_resp = response.json()

        # Define the filename using the json_files_base_path
        filename = os.path.join(json_files_base_path, f'stats_{player_name}.json')

        # Check if the file exists and read existing data
        if os.path.exists(filename):
            with open(filename, 'r') as file:
                player_data = json.load(file)
        else:
            player_data = {}

        # Get the current date
        current_date = datetime.now().strftime('%Y-%m-%d')

        # Update the data for the current date
        player_data[current_date] = json_resp

        # Write updated data back to the file
        with open(filename, 'w') as file:
            json.dump(player_data, file, indent=2)
        print(f"Updated stats for {player_name}.")

def get_daily_stats():
    # Read the players.json file
    if not os.path.isfile(players_file_path):
        getAllPlayers()

    with open(players_file_path, 'r') as file:
        players_data = json.load(file)

    # Iterate through each player in the JSON data
    for player_name, player_id in players_data.items():
        if player_id:
            get_daily_stats_for_player(player_name)

if __name__ == "__main__":
    authorize()
    get_daily_stats()

   # Adjust the base path to go up one level from the current script's directory
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    json_directory = os.path.join(base_path, 'json_files')
    chart_files_directory = os.path.join(base_path, 'chart_files')

    # Call the function to generate chart data
    generate_chart_data(json_directory, chart_files_directory)

    # Generate timestamp
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    last_updated_file = os.path.join(base_path, 'last_updated.json')
    with open(last_updated_file, 'w') as f:
        json.dump({'last_updated': timestamp}, f)