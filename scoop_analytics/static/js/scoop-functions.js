var functions = {

	arithmetic: function() {
		function getPercentageChange(oldNumber, newNumber){
		    var value = newNumber - oldNumber;
		    return ((value / oldNumber) * 100).toFixed(2);
		}
		return {
			getPercentageChange: getPercentageChange
		}
	},

	twitterSearch: function() {
		function getChanges(){
			var total=[];
			for(var i=0; i<data_prices.length; i++) {
				if(i==data_prices.length-1) break;
				total.push([functions.arithmetic().getPercentageChange(data_prices[i].close, data_prices[i+1].close), data_prices[i], data_prices[i+1]]);
			}
			total = total.sort(function(a,b){return a[0]-b[0];});
			total = _.uniqBy(total, function (e) {
						return e[0];
					});
			return {
				"increases": _.takeRight(_.filter(total, number => number[0] > 0),5),
				"decreases": _.takeRight(_.filter(total, number => number[0] < 0).reverse(),5)
			};
		}
		function getTwitterTimestamps(){
			var result=[];
			price_changes.decreases.forEach((val)=>{
				result.push([val[1].timestamp, val[2].timestamp]);
			});
			price_changes.increases.forEach((val)=>{
				result.push([val[1].timestamp, val[2].timestamp]);
			});
			return result;
		}
		return {
			getChanges: getChanges,
			getTwitterTimestamps: getTwitterTimestamps
		}
	},

	chart: function() {
		function collectDiscontinuities(){
			var disc_list = []

			for(var i=0; i < data_prices.length; i++) {
				if(!i) continue;
				var curr_el = timeParser(data_prices[i].timestamp).getTime();
				var prev_el = timeParser(data_prices[i-1].timestamp).getTime();

				if(((curr_el - prev_el)/1000)>3600) disc_list.push([d3.timeParse('%Q')(prev_el), d3.timeParse('%Q')(curr_el)]);
			}

			return disc_list;
		}
		function setDiscontinuities(){
			x.discontinuityProvider(fc.discontinuityRange.apply(this,discontinuityList));
			x2.discontinuityProvider(fc.discontinuityRange.apply(this,discontinuityList));
		}
		function resetGraph() {
		    d3.select(".focus").selectAll("*").remove();
		    d3.select(".context").selectAll("*").remove();
		    d3.select(".volume").selectAll("*").remove();
		    d3.select(".analytics").selectAll("*").remove();

		    d3.selectAll("#chart-header-text").remove();
		    d3.selectAll(".axis-label").remove();
		    d3.selectAll(".gridline").remove();
		    d3.selectAll(".m-data").remove();
		    d3.selectAll(".m-labels").remove();
		    d3.selectAll(".tooltip").remove();
		    d3.selectAll(".vol-tooltip").remove();
		    d3.selectAll(".hover-rect-group-x").remove();
		    d3.selectAll(".hover-rect-group-y").remove();
		    d3.selectAll(".daterange-group").remove();
		    d3.select(".lastupdated").remove();
		    d3.select(".rect-group-lastval").remove();

		    market = data_prices[data_prices.length-1]['market'];
			cashtag = data_prices[data_prices.length-1]['symbol'];

			data_tweets=[];

		    x.domain([d3.min(data_prices, function(d){
				    	var time = timeParser(d.timestamp);
						return time;
					}), d3.max(data_prices, function(d){
				    	var time = timeParser(d.timestamp);
						return time;
					})]);

		    y.domain([d3.min(data_prices, function(d) { return d.close; }), d3.max(data_prices, function(d) { return d.close; })]).nice()

		    x2.domain(x.domain());
		    y2.domain(y.domain());

		    x3.domain(x.domain());
			y3.domain([d3.min(data_prices, function(d) { return d.volume; }), d3.max(data_prices, function(d) { return d.volume; })]).nice();
		}
		function brushed() {
			if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;
			var selection = d3.event.selection;
			var ext = selection.map(x2.invert, x2);
			init_brush = selection;
			x.domain(selection.map(x2.invert, x2));
			y.domain([
		          d3.min(data_prices.map(function(d) { return (timeParser(d.timestamp) >= ext[0] && timeParser(d.timestamp) <= ext[1]) ? d.close : d3.max(data_prices.map(function(d) { return d.close; })); })),
		          d3.max(data_prices.map(function(d) { return (timeParser(d.timestamp) >= ext[0] && timeParser(d.timestamp) <= ext[1]) ? d.close : d3.min(data_prices.map(function(d) { return d.close; })); }))
		        ]);
			y3.domain([
		          d3.min(data_prices.map(function(d) { return (timeParser(d.timestamp) >= ext[0] && timeParser(d.timestamp) <= ext[1]) ? d.volume : d3.max(data_prices.map(function(d) { return d.volume; })); })),
		          d3.max(data_prices.map(function(d) { return (timeParser(d.timestamp) >= ext[0] && timeParser(d.timestamp) <= ext[1]) ? d.volume : d3.min(data_prices.map(function(d) { return d.volume; })); }))
		        ]);
			d3.select(".x.axis-label")
				.text(function(){
					if(d3.timeFormat("%b %d, %Y")(x.domain()[0]) == d3.timeFormat("%b %d, %Y")(x.domain()[1])) return d3.timeFormat("%b %d, %Y")(x.domain()[0]);
					else return d3.timeFormat("%b %d, %Y")(x.domain()[0])+" - "+d3.timeFormat("%b %d, %Y")(x.domain()[1]);
				})
				.attr("transform", function(){
					if(d3.timeFormat("%b %d, %Y")(x.domain()[0]) == d3.timeFormat("%b %d, %Y")(x.domain()[1])) return "translate("+width+",60)";
					else return "translate("+(width-70)+",60)";
				});

			focus.selectAll(".pointLine")
			.attr("x1", function(d){
				var time = timeParser(d.timestamp);
				return x(time);	
			})
			.attr("x2", function(d){
				var time = timeParser(d.timestamp);
				return x(time);	
			})
			.attr("y1", function(d){
				return y(d.close);
			})
			.attr("y2", function(d){
				return y(d3.min(data_prices, function(d) { return d.close; }));
			});

			focus.selectAll(".point")
			.attr("cx", function(d){
				var time = timeParser(d.timestamp);
				return x(time);
			})
			.attr("cy", function(d){
				return y(d.close);
			});

			focus.selectAll(".trendline")
				.attr("d", function(d){
					return line(d);
				});
			focus.selectAll(".avgLine")
				.attr("d", function(d){
					return line(d);
				});
			focus.selectAll(".area")
				.attr("d", function(d){
					return area(d);
				})
				.attr("fill", "url(#areaGradient)");
			volumes.selectAll(".bar")
				.attr("x", function(d) { 
					var time = timeParser(d.timestamp);
					return x(time); 
				})
				.attr("y", function(d) { return y3(d.volume); })
				.attr("height", function(d) { 
					if((height2 - y3(d.volume))<0) return height2;
					else return height2 - y3(d.volume); });
			focus.select(".axis.x").call(xAxis);
			focus.select(".axis.y").call(yAxis);
			d3.select(".focus").call(zoom.transform, d3.zoomIdentity
			 	.scale(width / (selection[1] - selection[0]))
			 	.translate(-selection[0], 0));
			d3.select("#x-fake-text0").text(d3.timeFormat("%H:%M")(x.domain()[0]));
			d3.select("#x-fake-text1").text(d3.timeFormat("%H:%M")(x.domain()[1]));

			if (data_prices[data_prices.length-1].close > y.domain()[0] && data_prices[data_prices.length-1].close < y.domain()[1]) {
				d3.select(".rect-group-lastval").attr("visibility", "visible");
				d3.select("#lastval-rect").attr("y",y(data_prices[data_prices.length-1].close));
				d3.select("#lastval-text").attr("y",y(data_prices[data_prices.length-1].close)+12);
				d3.select("#lastval-line").attr("y1", y(data_prices[data_prices.length-1].close)+9).attr("y2", y(data_prices[data_prices.length-1].close)+9);
			} else d3.select(".rect-group-lastval").attr("visibility", "hidden");
		}

		function zoomed() {
			if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return;
			var t = d3.event.transform;
			var ext = t.rescaleX(x2).domain();
			x.domain(t.rescaleX(x2).domain());
			y.domain([
		          d3.min(data_prices.map(function(d) { return (timeParser(d.timestamp) >= ext[0] && timeParser(d.timestamp) <= ext[1]) ? d.close : d3.max(data_prices.map(function(d) { return d.close; })); })),
		          d3.max(data_prices.map(function(d) { return (timeParser(d.timestamp) >= ext[0] && timeParser(d.timestamp) <= ext[1]) ? d.close : d3.min(data_prices.map(function(d) { return d.close; })); }))
		        ]);
			y3.domain([
		          d3.min(data_prices.map(function(d) { return (timeParser(d.timestamp) >= ext[0] && timeParser(d.timestamp) <= ext[1]) ? d.volume : d3.max(data_prices.map(function(d) { return d.volume; })); })),
		          d3.max(data_prices.map(function(d) { return (timeParser(d.timestamp) >= ext[0] && timeParser(d.timestamp) <= ext[1]) ? d.volume : d3.min(data_prices.map(function(d) { return d.volume; })); }))
		        ]);
			d3.select(".x.axis-label")
				.text(function(){
					if(d3.timeFormat("%b %d, %Y")(x.domain()[0]) == d3.timeFormat("%b %d, %Y")(x.domain()[1])) return d3.timeFormat("%b %d, %Y")(x.domain()[0]);
					else return d3.timeFormat("%b %d, %Y")(x.domain()[0])+" - "+d3.timeFormat("%b %d, %Y")(x.domain()[1]);
				})
				.attr("transform", function(){
					if(d3.timeFormat("%b %d, %Y")(x.domain()[0]) == d3.timeFormat("%b %d, %Y")(x.domain()[1])) return "translate("+width+",60)";
					else return "translate("+(width-70)+",60)";
				});

			focus.selectAll(".pointLine")
			.attr("x1", function(d){
				var time = timeParser(d.timestamp);
				return x(time);	
			})
			.attr("x2", function(d){
				var time = timeParser(d.timestamp);
				return x(time);	
			})
			.attr("y1", function(d){
				return y(d.close);
			})
			.attr("y2", function(d){
				return y(d3.min(data_prices, function(d) { return d.close; }));
			});


			focus.selectAll(".point")
			.attr("cx", function(d){
				var time = timeParser(d.timestamp);
				return x(time);
			})
			.attr("cy", function(d){
				return y(d.close);
			});

			volumes.selectAll(".bar")
				.attr("x", function(d) { 
					var time = timeParser(d.timestamp);
					return x(time); 
				})
				.attr("y", function(d) { return y3(d.volume); })
				.attr("height", function(d) { 
					if((height2 - y3(d.volume))<0) return height2;
					else return height2 - y3(d.volume); });
			focus.selectAll(".trendline")
				.attr("d", function(d){
					return line(d);
				});
			focus.selectAll(".avgLine")
				.attr("d", function(d){
					return line(d);
				});
			focus.selectAll(".area")
				.attr("d", function(d){
					return area(d);
				})
				.attr("fill", "url(#areaGradient)");
				
			init_brush = x.range().map(t.invertX, t);
			focus.select(".axis.x").call(xAxis);
			focus.select(".axis.y").call(yAxis);
			context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
			d3.select("#x-fake-text0").text(d3.timeFormat("%H:%M")(x.domain()[0]));
			d3.select("#x-fake-text1").text(d3.timeFormat("%H:%M")(x.domain()[1]));
			
			if (data_prices[data_prices.length-1].close > y.domain()[0] && data_prices[data_prices.length-1].close < y.domain()[1]) {
				d3.select(".rect-group-lastval").attr("visibility", "visible");
				d3.select("#lastval-rect").attr("y",y(data_prices[data_prices.length-1].close));
				d3.select("#lastval-text").attr("y",y(data_prices[data_prices.length-1].close)+12);
				d3.select("#lastval-line").attr("y1", y(data_prices[data_prices.length-1].close)+9).attr("y2", y(data_prices[data_prices.length-1].close)+9);
			} else d3.select(".rect-group-lastval").attr("visibility", "hidden");
		}
		function mousemove() {
			var timeParser = d3.timeParse("%s");
			var timestamp_parse = function(d){var time = timeParser(d.timestamp);return time;}
			var bisectDate = d3.bisector(function(d) { var time = timeParser(d.timestamp); return time; }).left,
			    formatValue = d3.format(",.2f"),
			    formatCurrency = function(d) { return "$" + formatValue(d); };

			var x0 = x.invert(d3.mouse(this)[0]),
			    i = bisectDate(data_prices, x0, 1),
			    d0 = data_prices[i - 1],
			    d1 = data_prices[i],
			    d = x0 - d0.timestamp > d1.timestamp - x0 ? d1 : d0;

			function checkPrev(key){
				var prev = data_prices[data_prices.indexOf(key)-1].close;
				var curr = key.close;

				var change = (curr-prev).toFixed(2);
				var changePct = functions.arithmetic().getPercentageChange(prev, curr);
				return [change,changePct];
			}

			d3.select("#panel-change-percentage-text").text(function(){
				if((data_prices.indexOf(d)-1)>=0) {
					var changePct = checkPrev(d)[1];

					if(changePct>0) return "▲ +"+changePct+"%";
					else if(changePct==0) return changePct+"%";
					else return "▼ "+changePct+"%";
				}
			}).style("fill", function(){
				var changePct = checkPrev(d)[1];
				return colorise(changePct);
			});

			d3.select("#panel-change-value-text").text(function(){
				if((data_prices.indexOf(d)-1)>=0) {
					var change = checkPrev(d)[0];

					if(change>0) return "+"+change;
					else if(change==0) return change;
					else if(change<0) return change;
				}
			}).style("fill", function(){
				var change = checkPrev(d)[0];
				return colorise(change);
			});

			d3.select(".lineTrackC").attr("transform", "translate(" + x(timeParser(d.timestamp)) + "," + y(d.close) + ")");
			d3.select(".lineTrackA").attr("transform", "translate(" + x(timeParser(d.timestamp)) + "," + y(d.average) + ")");
		    d3.select(".lineTrackC").select("text").text(formatCurrency(d.close));
		    d3.select(".lineTrackA").select("text").text(formatCurrency(d.average));

			var xpos = d3.mouse(this)[0];
			var ypos = d3.mouse(this)[1];
			d3.select("#hover-line-x").attr("x1", xpos-4).attr("x2", xpos-4).style("opacity", 1);
			d3.select("#hover-line-y").attr("y1", ypos-4).attr("y2", ypos-4).style("opacity", 1);
			d3.select("#hover-rect-x").attr("x", xpos-24);
			d3.select("#hover-text-x").attr("x", xpos+19).attr("y",12.5).text(d3.timeFormat('%d-%m-%y %H:%M')(x.invert(xpos)));
			d3.select("#hover-rect-y").attr("y", ypos-12);
			d3.select("#hover-text-y").attr("y", ypos).attr("x",-32).text(y.invert(ypos).toFixed(2));

			function fill(key){
				var index = data_prices.findIndex(x => x.timestamp==d.timestamp);
				if (index==0) return;
				var val = (d[key] - data_prices[index-1][key]).toFixed(2);

				if(val>0) return "#84c283";
				else return "#ff7575";
			}

			d3.selectAll(".market-labels")
				.style("opacity", 1);
			d3.selectAll(".market-current")
				.style("opacity", 1)
				.text(function(){
					if(market=="NASDAQ") return "$"+d.close.toFixed(2);
					if(market=="LON") return "£"+d.close.toFixed(2);
					return d.close.toFixed(2);
				})
				.style("fill", fill('close'));
			d3.selectAll(".market-high")
				.style("opacity", 1)
				.text(function(){
					if(market=="NASDAQ") return "$"+d.high.toFixed(2);
					if(market=="LON") return "£"+d.high.toFixed(2);
					return d.high.toFixed(2);
				})
				.style("fill", fill('high'));
			d3.selectAll(".market-low")
				.style("opacity", 1)
				.text(function(){
					if(market=="NASDAQ") return "$"+d.low.toFixed(2);
					if(market=="LON") return "£"+d.low.toFixed(2);
					return d.low.toFixed(2);
				})
				.style("fill", fill('low'));
			d3.selectAll(".market-avg")
				.style("opacity", 1)
				.text(function(){
					if(market=="NASDAQ") return "$"+d.average.toFixed(2);
					if(market=="LON") return "£"+d.average.toFixed(2);
					return d.average.toFixed(2);
				})
				.style("fill", fill('average'));
			d3.selectAll(".market-vol")
				.style("opacity", 1)
				.text(function(){
					return String(d.volume).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
				})
				.style("fill", fill('average'));
			d3.selectAll(".market-by-percent")
				.style("opacity", 1)
				.text(function(){
					var index = data_prices.findIndex(x => x.timestamp==d.timestamp);
					if (index==0) return;
					var decVal = d.close - data_prices[index-1].close;
					var percentage = ((decVal/data_prices[index-1].close)*100).toFixed(2);

					if(percentage>0) return "+"+percentage+"%";
					else return percentage+"%";
				})
				.style("fill", function(){
					var index = data_prices.findIndex(x => x.timestamp==d.timestamp);
					if (index==0) return;
					var decVal = d.close - data_prices[index-1].close;
					var percentage = ((decVal/data_prices[index-1].close)*100).toFixed(2);

					if(percentage>0) return "#84c283";
					else return "#ff7575";
				});
			// PANEL
			if(data_tweets.length!=0) {
				var tweet_arr = [];
				for(var c=0; c<data_tweets.length; c++){
					var tweet_time = d3.timeParse('%a %b %d %H:%M:%S %Z %Y')(data_tweets[c]['created_at']);
					var point_time = timeParser(d.timestamp);
					var diff = point_time.getTime() - tweet_time.getTime();
					if(diff<=3600000 && diff>=-3600000) {
						tweet_arr.push(data_tweets[c]);
					} else {
						if(Date.now() - lastRemove>1000) {
							d3.select("#panel-placeholder-text").text("No tweets available")
							d3.select("#panel-change-percentage-text").attr("opacity", 0);
							d3.select("#panel-change-value-text").attr("opacity", 0);

							d3.selectAll(".panel-body")
								.data([])
								.exit()
								.remove();
							lastRemove = Date.now()
						}
					}
				}

				if(Date.now() - lastGet > 1000) {
					twitterapi.fetch().displayTweets(tweet_arr, tweet_urls[0], tweet_urls[1])
			        lastGet = Date.now();
			    }
			}
		}

		function rangeClip(range) {
			function nearestDate(date) {
				var begin = 0;
				for(var i=data_prices.length-1; i>=0; --i){
					if(d3.timeFormat('%a %b %d %Y')(date) == d3.timeFormat('%a %b %d %Y')(timeParser(data_prices[i].timestamp))) {
						begin = timeParser(data_prices[i].timestamp)
						break;
					}
				}
				return begin;
			}
			function nearestTimestamp(ts){
				var times_struct={};
				for(var i=data_prices.length-1; i>0; --i){
					var check = data_prices[i].timestamp - ts;
					if(check>0) times_struct[i] = data_prices[i].timestamp - ts;
				}
				var smallest=Object.keys(times_struct).reduce(function(a, b){ return times_struct[a] < times_struct[b] ? a : b });
				return timeParser(data_prices[smallest].timestamp);
			}

			var today = new Date(timeParser(data_prices[data_prices.length - 1].timestamp));
			var begin = new Date(timeParser(data_prices[data_prices.length - 1].timestamp));

			if (range === '1d') 
			begin.setDate(begin.getDate() - 1);

			if (range === '1w')
			begin.setDate(begin.getDate() - 7);

			if (range === '1m')
			begin.setMonth(begin.getMonth() - 1);

			if (range === '3m')
			begin.setMonth(begin.getMonth() - 3);

			if (range === '6m')
			begin.setMonth(begin.getMonth() - 6);

			if (range === '1y')
			begin.setFullYear(begin.getFullYear() - 1);

			if (range === '5y')
			begin.setFullYear(begin.getFullYear() - 5);
			
			exists = data_prices.findIndex(x => x.timestamp==d3.timeFormat('%s')(begin));

			if(exists==-1) {
				begin = nearestTimestamp(d3.timeFormat('%s')(begin));
				begin = x2(begin);
			} else {
				begin = x2(begin);
			}

			d3.select(".brush").call(brush.move, [begin,x2(today)]);
			d3.select("#x-fake-text0").text(d3.timeFormat("%H:%M")(x.domain()[0]));
			d3.select("#x-fake-text1").text(d3.timeFormat("%H:%M")(x.domain()[1]));
		}
		return {
			collectDiscontinuities: collectDiscontinuities,
			setDiscontinuities: setDiscontinuities,
			resetGraph: resetGraph,
			brushed: brushed,
			zoomed: zoomed,
			mousemove: mousemove,
			rangeClip: rangeClip
		}
	},
	parsing: function(){
		function parsePrices(json_prices){
			var prices = JSON.parse(json_prices);
			var data_prices = [];

			for(var i in prices) data_prices.push(prices[i]);

			return data_prices.sort(function(a,b){
				return a.timestamp-b.timestamp;
			});
		}
		return {
			parsePrices: parsePrices
		}
	}

}