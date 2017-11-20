from flask import render_template
from scoop_analytics import app
from scoop_analytics.models import db, BaseModel, Documents, SharePrices
from sqlalchemy import *
import time

@app.route("/")
def main():
	myDocuments = Documents.query.limit(100).all()
	share_prices = SharePrices.query.limit(10).all()

	for el in share_prices:
		#tstamp_conv = time.strftime("%a, %d %b %Y %H:%M:%S", time.localtime(el.__dict__['timestamp']))
		tstamp_conv = time.strftime("%H:%M", time.localtime(el.__dict__['timestamp']))
		el.__dict__['timestamp'] = tstamp_conv

	return render_template('index.html', myDocuments=myDocuments, share_prices=share_prices)