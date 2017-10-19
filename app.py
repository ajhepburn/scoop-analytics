from flask import Flask
from models import db

app = Flask(__name__)

POSTGRES = {
    'user': 'postgres',
    'pw': 'test',
    'db': 'scoopAnalytics',
    'host': 'localhost',
    'port': '5432',
}

app.config['DEBUG'] = True
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://%(user)s:\
%(pw)s@%(host)s:%(port)s/%(db)s' % POSTGRES
db.init_app(app)

@app.route("/")
def main():
    return 'Hello World !'

if __name__ == '__main__':
    app.run()