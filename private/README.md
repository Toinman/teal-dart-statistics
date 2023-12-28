#1 RUN THIS DAILY TO UPDATE EACH PLAYERS JSON FILE
python3 get-daily-stats.py


#2 TO UPDATE THE GRAPH PAGE
python3 generateChartData.py

#3 SERVE THE PAGE
python3 -m http.server

#4 VISIT
http://[::]:8000/allCharts.html


CHATGTP CONVERSATION:
https://chat.openai.com/c/405feacd-315d-4550-bd38-3e4771401b20