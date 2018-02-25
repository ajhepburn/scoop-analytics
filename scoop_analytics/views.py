from __future__ import print_function
from flask import render_template, json, jsonify, request, redirect, url_for, Response
from flask_dance.contrib.twitter import twitter
from TwitterAPI import TwitterAPI
from scoop_analytics import app
from scoop_analytics.models import db, BaseModel, Documents, SharePrices, GooglePrices, StreamPrices
from sqlalchemy import *
from flask_socketio import SocketIO, send, emit
from lxml import html
import requests
import eventlet

socketio = SocketIO(app, async_mode="threading")
api = TwitterAPI('7u1DrWrcqlRb3shnmSV271YAC', 'BjP4LEUDaDp7oSg7H5P1i9jRPtDAnGWxN7dZCfPpqel2n7P4Mc', '2837005903-xUCqnbARCn25DbXTaRtUBLhS2r9wFLywoMoaiGc', '8QrgDtohRvv3tiP0hWWCYnvJensFMNcLMcGqEu72FSCCI')

# scrape_ticks must be in multiples of 1,5 or 10.
scrape_ticks = 10
# @app.route("/twitter")
# def twitter_login():
# 	if not twitter.authorized:
# 		return redirect(url_for('twitter.login'))
# 	account_info = twitter.get('account/settings.json')
# 	if account_info.ok:
# 		account_info_json = account_info.json()
# 		return '<h1>Your twitter name is @{}'.format(account_info_json['screen_name'])
# 	return '<h1>Request failed!</h1>'

@app.route('/google-get', methods=['GET'])
def scraper(*args):
	data = request.args.get('data')

	if len(args) == 2:
		market = args[0]
		cashtag = args[1]
		on_init = True
	elif data is not None:
		data = json.loads(data)
		market = data[0]
		cashtag = data[1]
		last_el = data[2]
		on_init = False

	page = requests.get('https://finance.google.com/finance/getprices?f=d,o,h,l,c,v&df=cpct&x='+market+'&q='+cashtag+'&i=60s&p=10d')
	content = [c.decode() for c in page.content.splitlines()]
	content = content[7:]
	output = []

	for i, c in enumerate(content):
		content[i] = c.split(",")
		if content[i][0].startswith('a'):
			count = 0
			current_epoch = int(content[i][0][1:])
			content[i][0] = current_epoch
			content[i][1:] = [float(x) for x in content[i][1:]]
			output.append(content[i])
		else:
			count+=1
			content[i][0] = current_epoch + (count*60)
			content[i][1:] = [float(x) for x in content[i][1:]]
			if not count % scrape_ticks:
				output.append(content[i])

	def db_insert():
		new_points = []
		obj = db.session.query(StreamPrices).order_by(StreamPrices.timestamp.desc()).first()
		isEmpty = db.session.query(StreamPrices).first()
		index_check = False
		if isEmpty is not None:
			for i, c in enumerate(output):
				if c[0]==obj.timestamp:
					try:
						next_pos = i+1
						index_check = True
					except IndexError:
						index_check = False
			if index_check:
				for c in output[next_pos:len(output)]:
					line = StreamPrices(symbol=''+cashtag+'',timestamp=c[0],close=c[1],high=c[2],low=c[3],open=c[4],volume=c[5],average=((c[1]+c[2]+c[3]+c[4])/4))
					db.session.add(line)
					db.session.commit()
			if not on_init:
				index_check = False
				for i,c in enumerate(output):
					if c[0]==last_el['timestamp']:
						try:
							next_pos = i+1
							index_check = True
						except IndexError:
							index_check = False
				if index_check:
					for c in output[next_pos:len(output)]:
						c.append((c[1]+c[2]+c[3]+c[4])/4)
						new_points.append(c)

		else:
			for c in output:
				line = StreamPrices(symbol=''+cashtag+'',timestamp=c[0],close=c[1],high=c[2],low=c[3],open=c[4],volume=c[5],average=((c[1]+c[2]+c[3]+c[4])/4))
				db.session.add(line)
				db.session.commit()
		
		if new_points!=[]:
			return new_points

	result = db_insert()
	return jsonify({"pagedata": result})

@app.route('/tweet-get', methods=['GET'])
def worker():
	data = json.loads(request.args.get('data'))
	tweet_arr = []
	for item in data:
		tweet_info = twitter.get('statuses/show/'+str(item)+'.json')
		print(tweet_info.text)
		tweet_arr.append(json.loads(tweet_info.text))

	return jsonify({"tweets": tweet_arr})

@app.route("/")
def main():
	# scraper('NASDAQ', 'HMNY')
	prices_result = db.engine.execute("SELECT symbol, timestamp, open, close, high, low, volume FROM share_prices WHERE (close >= 1.025 * open) AND volume <> 0 AND symbol LIKE 'HMNY';")
	docs_result = db.engine.execute("SELECT * FROM documents, jsonb_array_elements(data->'entities'->'symbols') where value->>'text' in ('HMNY');")
	gprices_result = db.engine.execute("SELECT * FROM stream_prices ORDER BY timestamp desc;")
	# docs_result = db.engine.execute("SELECT DISTINCT data->'id' as tweet_id, data->'text' as tweet_text, data->'timestamp_s' as tweet_created, value as cashtag FROM documents, jsonb_array_elements(data->'entities'->'symbols') where value->>'text' in ('HMNY');")
	
	docs = json.dumps([dict(r) for r in docs_result])
	prices = json.dumps([dict(r) for r in prices_result])
	gprices = json.dumps([dict(r) for r in gprices_result])

	if not twitter.authorized:
		return redirect(url_for('twitter.login'))
	# account_info = twitter.get('account/settings.json')
	# if account_info.ok:
	# 	account_info_json = account_info.json()

	return render_template('index.html', documents=docs, share_prices=prices, google_prices=gprices)

@socketio.on('my event')
def handle_my_custom_event(json):
	json['track'] = 'vodka'
	r = api.request('statuses/filter', json)
	for item in r.get_iterator():
		if 'text' in item:
			json_data = {'data': item}
			emit('my response',json_data)
		elif 'limit' in item:
			print ('%d tweets missed') % item['limit'].get('track')
		elif 'disconnect' in item:
			print ('disconnecting because %s') % item['disconnect'].get('reason')
			break