var twitterapi = {
	fetch: function() {
		function displayTweets(arr, imgRetweet, imgFav) {
			if(arr.length!=0){
			  	d3.select("#panel-placeholder-text").text(" ");
					d3.select("#panel-change-percentage-text").attr("opacity", 1);
				d3.select("#panel-change-value-text").attr("opacity", 1);

			    var tweetDivs = d3.select(".panel").selectAll("div.panel-body")
			    					.data(arr)
			    					.enter()
			    					.append("div")
			    					.attr("id", function(d){return "p"+d['id_str']})
			    					.classed("panel-body", true);

				var headerBlock = tweetDivs.append("p")
								  .classed("panel-tweet-header", true);

					headerBlock.append("img")
						.attr("width", 20)
						.attr("height", 20)
						.attr("src", function(d){return d['user']['profile_image_url']})
						.classed("panel-tweet-img-profile", true);

					headerBlock.append("text")
						.text(function(d){
							var tweet_created_format = d3.timeFormat("%-I:%M%p, %e %b %Y")(d3.timeParse("%a %b %d %H:%M:%S %Z %Y")(d['created_at']));
							return " @"+d['user']['screen_name']+"    ("+tweet_created_format+")";
						})
						.classed("panel-tweet-header-text", true);


				var bodyBlock = tweetDivs.append("p")
								.classed("panel-tweet-body", true);

					bodyBlock.append("text")
						.text(function(d){return d['text'];})
						.classed("panel-tweet-body-text", true);
				
				var infoBlock = tweetDivs.append("p")
								.classed("panel-tweet-info-block", true);

			        infoBlock.append("img")
			            .attr("src", imgRetweet)
			           	.classed("panel-tweet-img-retweet", true);
			        infoBlock.append("text")
			            .text(function(d){
			                return d['retweet_count'];
			            })
			            .classed("panel-tweet-text-retweet", true);

					infoBlock.append("img")
				            .attr("src", imgFav)
				            .classed("panel-tweet-img-favorite", true);
			       	infoBlock.append("text")
			            .text(function(d){
			                return d['favorite_count'];
			            })
					.classed("panel-tweet-text-favorite", true);
			}
		}

		price_changes = functions.twitterSearch().getChanges();


		function getLiveTweets(init){
			if(init) {
				tweet_ranges = functions.twitterSearch().getTwitterTimestamps();
				fetchNew(tweet_ranges);
			} else {
				var difference=[];
				temp_ranges = functions.twitterSearch().getTwitterTimestamps();
				jQuery.grep(temp_ranges, function(el) {
				        if (jQuery.inArray(el, tweet_ranges) == -1) difference.push(el);
				});
				tweet_ranges = temp_ranges;
				fetchNew(difference);
			}

			function fetchNew(ranges){
				if(ranges.length!=0) {
					var jqxhr = $.getJSON("tweet-search", {"data": JSON.stringify(ranges), "cashtag": cashtag})
								  .done(function(data) {
								  	if(data==429) {
								  		console.log("Error (429): Rate Limited");
								  		data_tweets=[];
								  	} else {
								  		console.log("Update success");
								  		if(init) data_tweets = data['tweets'];
								  		else data_tweets.push(data['tweets']);

								  		drawTweetIndicators.call(focus, {
											data_prices: data_prices,
											axis: {
												x: xAxis,
												y: yAxis,
												x2: xAxis2
											},
											gridlines: {
												x: xGridlines,
												y: yGridlines,
											},
											initialise: true
										});
								  	}
								  })
								  .fail(function() {
								    console.log( "error" );
								  })
								  .always(function() {
								    console.log( "complete" );
								  });
				}
			}
		}
		return {
			getLiveTweets: getLiveTweets,
			displayTweets: displayTweets
		}
	}
}

var googleapi = {
	fetch: function() {
		function scrapePage(market, cashtag, last_el) {
			var jqxhr = $.getJSON("google-get", {"data": JSON.stringify([market, cashtag, last_el])})
			.done(function(data) {
                console.log("Success");
                console.log(data);
                if (data['pagedata']!=null) {
                    for(result in data['pagedata']) {
                        var item = {'timestamp':data['pagedata'][result][0], 
                                         'close':data['pagedata'][result][1], 
                                         'high':data['pagedata'][result][2], 
                                         'low':data['pagedata'][result][3], 
                                         'open':data['pagedata'][result][4], 
                                         'volume':data['pagedata'][result][5], 
                                         'average':data['pagedata'][result][6],
                                     	 'market':data['pagedata'][result][7],
                                     	 'symbol':data['pagedata'][result][8]}
                        if(!data_prices.includes(item)) {
                            data_prices.push(item);
                        }
                    }
                    twitterapi.fetch([], tweet_urls[0], tweet_urls[1]).getLiveTweets(false);
                }
	                functions.chart().resetGraph();
	                discontinuityList = functions.chart().collectDiscontinuities();
	                functions.chart().setDiscontinuities(discontinuityList);
				    
				    plot.call(focus, {
						data_prices: data_prices,
						axis: {
							x: xAxis,
							y: yAxis,
							x2: xAxis2
						},
						gridlines: {
							x: xGridlines,
							y: yGridlines,
						},
						initialise: true
					});
            })
				.fail(function() {
					console.log( "error" );
				})
				.always(function() {
					// console.log( "finished" );
				});
		}
		return {
			scrapePage: scrapePage
		}
	}

}