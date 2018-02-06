from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask import render_template
from flask_dance.contrib.twitter import make_twitter_blueprint, twitter
from scoop_analytics.models import db, BaseModel, Documents, SharePrices
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SECRET_KEY'] = 'thisisasecret'
socketio = SocketIO(app)

import scoop_analytics.views

POSTGRES = {
    'user': 'postgres',
    'pw': 'test',
    'db': 'scoopAnalytics',
    'host': 'localhost',
    'port': '5432',
}

twitter_blueprint = make_twitter_blueprint(api_key='7u1DrWrcqlRb3shnmSV271YAC', api_secret='BjP4LEUDaDp7oSg7H5P1i9jRPtDAnGWxN7dZCfPpqel2n7P4Mc')
app.register_blueprint(twitter_blueprint, url_prefix='/twitter')

app.config['DEBUG'] = True
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://%(user)s:\
%(pw)s@%(host)s:%(port)s/%(db)s' % POSTGRES
db.init_app(app)

if __name__ == '__main__':
    # app.run(debug=True)
    socketio.run(app)