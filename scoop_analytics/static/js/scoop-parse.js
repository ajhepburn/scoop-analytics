var parseData = {

	parseFlaskJSON: function(json_prices, json_docs) {
		var prices = JSON.parse(json_prices);
		var docs = JSON.parse(json_docs);

		function parsePrices(){
			var data_prices = [];

			for(var i in prices) data_prices.push(prices[i]);

			return data_prices.sort(function(a,b){
				return a.timestamp-b.timestamp;
			});
		}

		function parseTweets(){
			var data_tweets = [];
			var dateParser = d3.timeParse("%s");

			for(var i in docs) {
				var obj = docs[i]['data'];
				obj['text'] = obj['text'].replace(/\n/g, " ");
				data_tweets.push(obj);
			}
			return data_tweets;
		}
		return {
		    parsePrices: parsePrices,
		    parseTweets: parseTweets
		};
	}


}