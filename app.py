from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask import render_template
from models import db, BaseModel, Documents, SharePrices

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
    myDocuments = Documents.query.all()
    share_prices = SharePrices.query.all()
    # print(share_prices)
    return render_template('test.html', myDocuments=myDocuments, share_prices=share_prices)

if __name__ == '__main__':
    app.run()