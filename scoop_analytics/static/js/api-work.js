var twitterapi = {
	fetch: function() {
		function getTweets(arr, imgRetweet, imgFav){
			var jqxhr = $.getJSON("tweet-get", {"data": JSON.stringify(arr)})
			  .done(function(data) {
			    var tweet_list = data['tweets'];
			    var tweetDivs = d3.select(".panel").selectAll("div.panel-body")
			    					.data(tweet_list)
			    					.enter()
			    					.append("div")
			    					.attr("id", function(d){return "p"+d['id_str']})
			    					.classed("panel-body", true);

				tweetDivs.append("img")
					.attr("width", 20)
					.attr("height", 20)
					.attr("src", function(d){return d['user']['profile_image_url']})
					.classed("panel-tweet-img-profile", true);

				tweetDivs.append("p")
					.text(function(d){
						var tweet_created_format = d3.timeFormat("%-I:%M%p, %e %b %Y")(d3.timeParse("%a %b %d %H:%M:%S %Z %Y")(d['created_at']));
						return "@"+d['user']['screen_name']+"    ("+tweet_created_format+")";
					})
					.classed("panel-tweet-text-header", true);

				tweetDivs.append("p")
					.text(function(d){return d['text'];})
					.classed("panel-tweet-text-body", true);

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

			  })
			  .fail(function() {
			    console.log( "error" );
			  })
			  .always(function() {
			    console.log( "complete" );
			  });
		}

		function postStream(cashtag) {
			var jqxhr = $.post("tweet-stream", {"data": cashtag})
				.done(function() {
					console.log( "second success" );
				})
				.fail(function() {
					console.log( "error" );
				})
				.always(function() {
					console.log( "finished" );
				});
		}
		return {
			getTweets: getTweets,
			postStream: postStream
		}
	}
}