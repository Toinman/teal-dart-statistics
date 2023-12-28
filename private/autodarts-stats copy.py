from keycloak import KeycloakOpenID
import requests
from os import path
import json
import argparse
AUTODART_AUTH_URL = "https://login.autodarts.io/"
AUTODART_AUTH_TICKET_URL = "https://api.autodarts.io/ms/v0/ticket"
AUTODART_CLIENT_ID = "autodarts-app"
AUTODART_REALM_NAME = "autodarts"
AUTODART_USER_EMAIL = "teal"
AUTODART_USER_PASSWORD = "Zondag01!"
BOARD_ID = "40e525b8-f2c0-41ff-b97d-b85227d3b099"

def getAllPlayers():
    url = "https://api.autodarts.io/as/v0/matches/filter?size=100&page=0&sort=-finished_at"
    response = requests.request("GET", url, headers=headers, data={})
    jsonResp = response.json()
    players = {}
    for item in jsonResp['items']:
        for player in item['players']:
            if player['name'] not in players:
                players[player['name']] = player['userId']
    with open('players.json', 'w') as fp:
        json.dump(players, fp, indent=2)


def getPlayer(name, first=True):
    
    if not path.isfile('players.json'):
        getAllPlayers()
    with open('players.json', 'r') as f:
        players = json.load(f)
        if name in players:
            return players[name]
        elif first:
            getAllPlayers()
            getPlayer(name, False)
        else:
            print(f"no player found with the name: {name}")
            



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
        # ppi(token)
    except Exception as e:
        print("Receive token failed", e)

    
parser = argparse.ArgumentParser(description='Get stats for player.')
parser.add_argument('player_name', type=str, help='The name of the player to get stats from')

args = parser.parse_args()


playerName = args.player_name
authorize()
playerId = getPlayer(playerName)
if(playerId is not None):
    url = f"https://api.autodarts.io/as/v0/users/{playerId}/stats/x01?limit=100"
    response = requests.request("GET", url, headers=headers, data={})
    jsonResp = response.json()
    with open(f'result_{playerName}.json', 'w') as fp:
        json.dump(jsonResp, fp, indent=2)


