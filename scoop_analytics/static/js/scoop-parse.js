var parseData = {

	parseFlaskJSON: function() {
		function parsePrices(json_prices){
			var prices = JSON.parse(json_prices);
			var data_prices = [];

			for(var i in prices) data_prices.push(prices[i]);

			return data_prices.sort(function(a,b){
				return a.timestamp-b.timestamp;
			});
		}

		function parseTweets(json_docs){
			var docs = JSON.parse(json_docs);
			var data_tweets = [];
			var dateParser = d3.timeParse("%s");

			for(var i in docs) {
				var obj = docs[i]['data'];
				obj['text'] = obj['text'].replace(/\n/g, " ");
				data_tweets.push(obj);
			}
			return data_tweets;
		}

		function parseTwitterAPI(json_api){
			var api = JSON.parse(json_api);
			console.log(api);

		}
		return {
		    parsePrices: parsePrices,
		    parseTweets: parseTweets,
		    parseTwitterAPI: parseTwitterAPI
		};
	}


}