from flask import Flask
from flask_socketio import SocketIO

async_mode = None
app = Flask(__name__)
#app.config['SECRET_KEY'] = 'thisisasecret'
socketio = SocketIO(app, async_mode=async_mode, engineio_logger=True)

import scoop_analytics.views