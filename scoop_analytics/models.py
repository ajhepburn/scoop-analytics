from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class BaseModel(db.Model):
    """Base data model for all objects"""
    __abstract__ = True

    def __init__(self, *args):
        super().__init__(*args)

    def __repr__(self):
        """Define a base way to print models"""
        return '%s(%s)' % (self.__class__.__name__, {
            column: value
            for column, value in self._to_dict().items()
        })

    def json(self):
        """
                Define a base way to jsonify models, dealing with datetime objects
        """
        return {
            column: value if not isinstance(value, datetime.date) else value.strftime('%Y-%m-%d')
            for column, value in self._to_dict().items()
        }

class Documents(BaseModel, db.Model):
    __tablename__ = 'documents'
    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.String(120))

    # def __init__(self, id=None, data=None):
    #     self.id = id
    #     self.data = data

    def __repr__(self):
        return '<Documents %r>' % (self.id)

class SharePrices(BaseModel, db.Model):
    __tablename__ = 'share_prices'
    symbol = db.Column(db.String)
    timestamp = db.Column(db.Integer, primary_key=True)
    open = db.Column(db.Integer)
    close = db.Column(db.Integer)
    high = db.Column(db.Integer)
    low = db.Column(db.Integer)
    volume = db.Column(db.Integer)

    # def __init__(self, id=None, data=None):
    #     self.id = id
    #     self.data = data

    def __repr__(self):
        return '<SharePrices %r>' % (self.symbol)

class GooglePrices(BaseModel, db.Model):
    __tablename__ = 'google_prices'
    symbol = db.Column(db.String)
    timestamp = db.Column(db.Integer, primary_key=True)
    close = db.Column(db.Float)
    high = db.Column(db.Float)
    low = db.Column(db.Float)
    open = db.Column(db.Float)
    volume = db.Column(db.Integer)

    def __init__(self, symbol, timestamp, close, high, low, open, volume):
        self.symbol = symbol
        self.timestamp = timestamp
        self.close = close
        self.high = high
        self.low = low
        self.open = open
        self.volume = volume

    def __repr__(self):
        return '<GooglePrices %r>' % (self.symbol)