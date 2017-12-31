from __future__ import print_function
from flask import render_template
from flask import json
from scoop_analytics import app
from scoop_analytics.models import db, BaseModel, Documents, SharePrices
from sqlalchemy import *
import time
import sys

@app.route("/")
def main():
	#my_documents = Documents.query.limit(40).all()
	share_prices = SharePrices.query.filter(SharePrices.symbol == 'AAOI').limit(50).all()

	# docs=[]
	# for el in result:
	# 	d = dict(el.items())
	# 	d['tweet_text'] = d['tweet_text'].replace("\n", " ")
	# 	docs.append(d);

	prices_result = db.engine.execute("SELECT symbol, timestamp, open, close, high, low, volume FROM share_prices WHERE (close >= 1.05 * open) AND volume <> 0 AND symbol LIKE 'ITUS' ORDER BY timestamp;")
	docs_result = db.engine.execute("SELECT DISTINCT data->'id' as tweet_id, data->'text' as tweet_text, data->'created_at' as tweet_created, value as cashtag FROM documents, jsonb_array_elements(data->'entities'->'symbols') where value->>'text' in ('ITUS');")
	
	docs = json.dumps([dict(r) for r in docs_result])
	prices = json.dumps([dict(r) for r in prices_result])

	# for el in share_prices:
	# 	tstamp_conv = time.strftime("%a, %d %b %Y %H:%M:%S", time.localtime(el.__dict__['timestamp']))
	# 	#tstamp_conv = time.strftime("%H:%M", time.localtime(el.__dict__['timestamp']))
	# 	el.__dict__['timestamp'] = tstamp_conv

	return render_template('index.html', documents=docs, share_prices=prices)