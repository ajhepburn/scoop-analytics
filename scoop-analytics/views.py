@app.route("/")
def main():
    myDocuments = Documents.query.all()
    share_prices = SharePrices.query.all()
    # print(share_prices)
    return render_template('index.html', myDocuments=myDocuments, share_prices=share_prices)