from __future__ import print_function
import eventlet
eventlet.monkey_patch()
from flask import render_template, json, jsonify, request, redirect, url_for, Response
# from flask_dance.contrib.twitter import twitter
from TwitterAPI import TwitterAPI
# from __init__ import socketio
from scoop_analytics.models import db, BaseModel, Documents, SharePrices, GooglePrices, StreamPrices
from sqlalchemy import *
from flask_socketio import SocketIO, send, emit
from threading import Lock
from lxml import html
from scoop_analytics.app import app, socketio
import requests
import time

# socketio = SocketIO(app, async_mode="threading")
api = TwitterAPI('7u1DrWrcqlRb3shnmSV271YAC', 'BjP4LEUDaDp7oSg7H5P1i9jRPtDAnGWxN7dZCfPpqel2n7P4Mc', '2837005903-xUCqnbARCn25DbXTaRtUBLhS2r9wFLywoMoaiGc', '8QrgDtohRvv3tiP0hWWCYnvJensFMNcLMcGqEu72FSCCI')

# scrape_ticks must be in multiples of 1,5 or 10.
scrape_ticks = 10
stream_json = {}

worker = None

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
	raw_content = [c.decode() for c in page.content.splitlines()]
	content = raw_content[7:]
	output = []

	for i, c in enumerate(content):
		content[i] = c.split(",")
		if content[i][0].startswith('a'):
			current_epoch = int(content[i][0][1:])
			content[i][0] = current_epoch
			content[i][1:] = [float(x) for x in content[i][1:]]
			output.append(content[i])
		else:
			if content[i][0].startswith('TIMEZONE'):
				continue
			count = int(content[i][0])
			content[i][0] = current_epoch + (count*60)
			content[i][1:] = [float(x) for x in content[i][1:]]
			if count % scrape_ticks == 0:
				output.append(content[i])

	def db_insert():
		new_points = []
		marketExists = db.session.query(exists().where(StreamPrices.market==market)).scalar()
		stockExists = db.session.query(exists().where(StreamPrices.symbol==cashtag)).scalar()
		index_check = False
		if marketExists and stockExists:
			obj = db.session.query(StreamPrices).filter(StreamPrices.market.like(market),StreamPrices.symbol.like(cashtag)).order_by(StreamPrices.timestamp.desc()).first()
			for i, c in enumerate(output):
				if c[0]==obj.timestamp:
					try:
						next_pos = i+1
						index_check = True
					except IndexError:
						index_check = False
			if index_check:
				for c in output[next_pos:len(output)]:
					line = StreamPrices(market=''+market+'',symbol=''+cashtag+'',timestamp=c[0],close=c[1],high=c[2],low=c[3],open=c[4],volume=c[5],average=((c[1]+c[2]+c[3]+c[4])/4))
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
						c.append(market)
						c.append(cashtag)
						new_points.append(c)

		else:
			for c in output:
				line = StreamPrices(market=''+market+'',symbol=''+cashtag+'',timestamp=c[0],close=c[1],high=c[2],low=c[3],open=c[4],volume=c[5],average=((c[1]+c[2]+c[3]+c[4])/4))
				db.session.add(line)
				db.session.commit()

		if new_points!=[]:
			return new_points

	result = db_insert()
	return jsonify({"pagedata": result})

@app.route('/change-mkt-stock', methods=['GET'])
def changer(*args):
	result = ''
	data = json.loads(request.args.get('data'))
	
	page = requests.get('https://finance.google.com/finance/getprices?f=d,o,h,l,c,v&df=cpct&x='+data[0]+'&q='+data[1]+'&i=60s&p=10d')
	content = [c.decode() for c in page.content.splitlines()]
	if (content[len(content)-1].startswith("DATA")):
		result = 'INVALID'
	else:
		scraper(data[0], data[1])
		prices_result = db.engine.execute("SELECT * FROM stream_prices WHERE symbol like '"+data[1]+"' ORDER BY timestamp desc;")
		result = json.dumps([dict(r) for r in prices_result])
		return jsonify(result)

@app.route('/tweet-search', methods=['GET'])
def tweet_search():
	result=[]
	data = json.loads(request.args.get('data'))
	cashtag = request.args.get('cashtag')

	def utc2snowflake(stamp):
		return (int(round(stamp * 1000)) - 1288834974657) << 22

	for t_range in data:
		tweet_arr=[]
		range_from = t_range[0]
		range_to = t_range[1]

		r = api.request('search/tweets', {'q':cashtag, 'since_id': utc2snowflake(range_from), 'max_id': utc2snowflake(range_to), 'count':7, 'result_type':'mixed'})
		if r.status_code == 429:
			return "429"
		for item in r:
			tweet_arr.insert(0,item)
		for item in tweet_arr:
			result.append(item)

	return jsonify({"tweets": result})

@app.route("/")
def main():
	scraper('NASDAQ', 'HMNY')
	# prices_result = db.engine.execute("SELECT symbol, timestamp, open, close, high, low, volume FROM share_prices WHERE (close >= 1.025 * open) AND volume <> 0 AND symbol LIKE 'HMNY';")
	# docs_result = db.engine.execute("SELECT * FROM documents, jsonb_array_elements(data->'entities'->'symbols') where value->>'text' in ('HMNY');")
	gprices_result = db.engine.execute("SELECT * FROM stream_prices WHERE symbol like 'HMNY' ORDER BY timestamp desc;")
	
	# docs = json.dumps([dict(r) for r in docs_result])
	# prices = json.dumps([dict(r) for r in prices_result])
	gprices = json.dumps([dict(r) for r in gprices_result])

	return render_template('index.html', google_prices=gprices)

class WorkerThread(object):
	switch = False
	r = None

	def __init__(self, socketio):
		self.socketio = socketio
		self.switch = True

	def do_work(self, args):

		while self.switch:
			self.socketio.sleep(5)
			self.r = api.request('user', args)
			# print(args)
			if self.r.status_code == 420:
				print("Error (420): Rate Limited")
				time.sleep(60*15)
			else:
				for item in self.r.get_iterator():
					# print("Tweet found!", item)
					if 'text' in item:
						json_data = {'data': item}
						with app.test_request_context('/'):
							self.socketio.emit('stream-response',json_data, namespace='/tweets')
					elif 'limit' in item:
						print ('%d tweets missed') % item['limit'].get('track')
					elif 'disconnect' in item:
						print ('disconnecting because %s') % item['disconnect'].get('reason')
						break

			eventlet.sleep(2)

	def stop(self):
		print("Terminating thread...")
		self.r.close()
		self.switch = False

@socketio.on('stream', namespace='/tweets')
def handle_stream(json):
	global worker
	worker = WorkerThread(socketio)

	socketio.start_background_task(target=worker.do_work, args=json)

@socketio.on('disconnect', namespace='/tweets')
def handle_disconnect():
	print("Client disconnected")
	worker.stop()