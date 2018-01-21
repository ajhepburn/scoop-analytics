from __future__ import print_function
from flask import render_template, json, redirect, url_for
from flask_dance.contrib.twitter import twitter
from scoop_analytics import app
from scoop_analytics.models import db, BaseModel, Documents, SharePrices
from sqlalchemy import *
import time
import sys

@app.route("/twitter")
def twitter_login():
	if not twitter.authorized:
		return redirect(url_for('twitter.login'))
	account_info = twitter.get('account/settings.json')
	if account_info.ok:
		account_info_json = account_info.json()
		return '<h1>Your twitter name is @{}'.format(account_info_json['screen_name'])
	return '<h1>Request failed!</h1>'



@app.route("/")
def main():
	prices_result = db.engine.execute("SELECT symbol, timestamp, open, close, high, low, volume FROM share_prices WHERE (close >= 1.025 * open) AND volume <> 0 AND symbol LIKE 'HMNY';")
	docs_result = db.engine.execute("SELECT * FROM documents, jsonb_array_elements(data->'entities'->'symbols') where value->>'text' in ('HMNY');")
	# docs_result = db.engine.execute("SELECT DISTINCT data->'id' as tweet_id, data->'text' as tweet_text, data->'timestamp_s' as tweet_created, value as cashtag FROM documents, jsonb_array_elements(data->'entities'->'symbols') where value->>'text' in ('HMNY');")
	
	docs = json.dumps([dict(r) for r in docs_result])
	prices = json.dumps([dict(r) for r in prices_result])

	return render_template('index.html', documents=docs, share_prices=prices)