from __future__ import print_function
from flask import render_template, json, jsonify, request, redirect, url_for, Response
from flask_dance.contrib.twitter import twitter
from scoop_analytics import app
from scoop_analytics.models import db, BaseModel, Documents, SharePrices
from sqlalchemy import *
import time
import sys

# @app.route("/twitter")
# def twitter_login():
# 	if not twitter.authorized:
# 		return redirect(url_for('twitter.login'))
# 	account_info = twitter.get('account/settings.json')
# 	if account_info.ok:
# 		account_info_json = account_info.json()
# 		return '<h1>Your twitter name is @{}'.format(account_info_json['screen_name'])
# 	return '<h1>Request failed!</h1>'

# @app.route('/receiver', methods = ['POST'])
# def worker():
# 	data = request.form['id']
# 	tweet_info = twitter.get('statuses/show/'+data+'.json')
# 	tweet_info_json = tweet_info.json()
# 	# result = json.dumps(tweet_info_json)
# 	result = json.dumps(tweet_info_json)

# 	return result

# @app.route('/stream', methods=['POST'])
# class StdOutListener(StreamListener):
#     def on_data(self, data):
#         decoded = json.loads(data)
#         print (decoded['user']['screen_name'], decoded['text'].encode('ascii', 'ignore'))
#         return True

#     def on_error(self, status):
#         print(status)

@app.route('/tweet-stream', methods=['POST'])
def streamer():
	# data = json.loads(request.args.get('data'))
	result = {"Hello": "Test"}
	return json.dumps(result)

@app.route('/tweet-get', methods=['GET'])
def worker():
	data = json.loads(request.args.get('data'))
	tweet_arr = []
	for item in data:
		tweet_info = twitter.get('statuses/show/'+str(item['id_str'])+'.json')
		tweet_arr.append(json.loads(tweet_info.text))

	return jsonify({"tweets": tweet_arr})

@app.route("/")
def main():
	prices_result = db.engine.execute("SELECT symbol, timestamp, open, close, high, low, volume FROM share_prices WHERE (close >= 1.025 * open) AND volume <> 0 AND symbol LIKE 'HMNY';")
	docs_result = db.engine.execute("SELECT * FROM documents, jsonb_array_elements(data->'entities'->'symbols') where value->>'text' in ('HMNY');")
	# docs_result = db.engine.execute("SELECT DISTINCT data->'id' as tweet_id, data->'text' as tweet_text, data->'timestamp_s' as tweet_created, value as cashtag FROM documents, jsonb_array_elements(data->'entities'->'symbols') where value->>'text' in ('HMNY');")
	
	docs = json.dumps([dict(r) for r in docs_result])
	prices = json.dumps([dict(r) for r in prices_result])

	if not twitter.authorized:
		return redirect(url_for('twitter.login'))
	# account_info = twitter.get('account/settings.json')
	# if account_info.ok:
	# 	account_info_json = account_info.json()

	return render_template('index.html', documents=docs, share_prices=prices)