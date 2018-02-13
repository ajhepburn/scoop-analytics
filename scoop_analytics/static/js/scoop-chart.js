var market = "NASDAQ";
var cashtag = data_prices[0]['symbol'];

// googleapi.fetch().scrapePage(market, cashtag);

var w = 900,
	h = 700,
	margin = {
	  top: 88,
	  bottom: 320,
	  left: 80,
	  right: 100
	},
	margin2 = {
		top: 400,
		bottom: 215,
		left: 80,
		right: 20
	},
	margin3 = {
		top: 485,
		bottom: 215,
		left: 80,
		right: 20
	}
	width = w - margin.left - margin.right,
	height = h - margin.top - margin.bottom,
	height2 = h - margin2.top - margin2.bottom;
	height3 = h - margin3.top - margin3.bottom;

var zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", zoomed);

var svg = d3.select("#bs-center-div").append("svg")
        	.attr("id", "chart")
			.attr("width", w)
			.attr("height", h);

svg.append("defs").append("clipPath")
    .attr("id", "clip")
  	.append("rect")
    .attr("width", width)
    .attr("height", height);

var focus = svg.append("g")
			.classed("focus", true)
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
			.call(zoom);

var volumes = svg.append('g')
			    .attr('class', 'volume')
			    .attr('transform', 'translate(' + margin2.left + ',' + margin2.top + ')');

var context = svg.append("g")
				.classed("context", true)
				.attr("transform", "translate(" + margin3.left + "," + margin3.top + ")");

var timeParser = d3.timeParse("%s");

var maxVal = d3.max(data_prices, function(d) { return d.open; }),
	minVal = d3.min(data_prices, function(d) { return d.open; });
var barMaxVal = d3.max(data_prices, function(d) { return d.volume; }),
	barMinVal = d3.min(data_prices, function(d) { return d.volume; });


var x = d3.scaleTime()
		.domain([
		    d3.min(data_prices, function(d){
		    	var time = timeParser(d.timestamp);
				return time;
			}).setMinutes(Math.floor(d3.min(data_prices, function(d){
				var time = timeParser(d.timestamp);
				return time;
			}).getMinutes() / 30) * 30), 
		    d3.max(data_prices, function(d){
		    	var time = timeParser(d.timestamp);
				return time;
			})
		])
		.range([0,width]),
	y = d3.scaleLinear()
		.domain([minVal, maxVal]).nice()
		.range([height, 0]),
	x2 = d3.scaleTime().range([0,width])
		.domain(x.domain()),
	y2 = d3.scaleLinear().range([height2,0])
		.domain(y.domain()),
	x3 = d3.scaleBand().rangeRound([0, width]).padding(0.5),
	y3 = d3.scaleLinear().range([height2, 0]);

x3.domain(x.domain());
y3.domain([barMinVal, barMaxVal]).nice();

var xAxis = d3.axisBottom(x);
			// .tickFormat(d3.timeFormat("%H:%M")),
	xAxis2 = d3.axisBottom(x2);
			// .tickFormat(d3.timeFormat("%H:%M")),
	yAxis = d3.axisLeft(y);


var brush = d3.brushX()
    .extent([[0, 0], [width, height2]])
    .on("brush", brushed);

var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

var xGridlines = d3.axisBottom(x)
				.tickSize(-height,-height)
				.tickFormat("");
var yGridlines = d3.axisLeft(y)
				.tickSize(-width,0,0)
				.tickFormat("");
var line = d3.line()
			.x(function(d){
				var time = timeParser(d.timestamp);
				return x(time);
			})
			.y(function(d){
				return y(d.value);
			})
			.curve(d3.curveCatmullRom);
var lineCtx = d3.line()
			.x(function(d){
				var time = timeParser(d.timestamp);
				return x2(time);
			})
			.y(function(d){
				return y2(d.value);
			})
			.curve(d3.curveCatmullRom);
var area = d3.area()
			.x(function(d) {
				var time = timeParser(d.timestamp);
				return x(time);
			})
			.y0(height)
			.y1(function(d){
				return y(d.open);
			})
			.curve(d3.curveCatmullRom);
var areaCtx = d3.area()
			.x(function(d) {
				var time = timeParser(d.timestamp);
				return x2(time);
			})
			.y0(height2)
			.y1(function(d){
				return y2(d.open);
			})
			.curve(d3.curveCatmullRom);


function drawStatic(params){
	if(params.initialise){
		this.append("g")
			.classed("gridline x", true)
			.attr("transform", "translate(0,"+height+")")
			.call(params.gridlines.x);
		this.append("g")
			.classed("gridline y", true)
			.attr("transform", "translate(0,0)")
			.call(params.gridlines.y);

		this.append("g")
			.classed("axis x", true)
			.attr("transform", "translate(" + 0 + "," + height + ")")
			.call(params.axis.x);

		context.append("g")
			.classed("axis x", true)
			.attr("transform", "translate(" + 0 + "," + height2 + ")")
			.call(params.axis.x2);

		this.append("g")
			.classed("axis y", true)
			.attr("transform", "translate(0,0)")
			.call(params.axis.y);

		d3.select("#chart")
			.append("text")
			.classed("y axis-label",true)
			.attr("transform", "translate(30,"+height/1.25+") rotate(-90)")
			.text(function(){
				return data_prices[0]['symbol']+" Share Price ($)";
			});
		d3.select("#chart")
			.append("text")
			.classed("x axis-label",true)
			.attr("transform", "translate("+width/1.65+","+height*1.35+")")
			// .text("Time");
			.text("");
		d3.select("#chart")
			.append("text")
			.classed("market market-by-val", true)
			.attr("transform", "translate("+width/4.08+",30)")
			.text("");
		d3.select("#chart")
			.append("text")
			.classed("market market-by-percent", true)
			.attr("transform", "translate("+width/4.15+",50)")
			.text("");
		d3.select("#chart")
			.append("text")
			.classed("market market-current", true)
			.attr("transform", "translate("+width/1.15+",45)")
			.text("");
		d3.select("#chart")
			.append("text")
			.classed("market-labels market-label-change", true)
			.attr("transform", "translate("+width/4.30+",70)")
			.text("Market Change");
		d3.select("#chart")
			.append("text")
			.classed("market-labels market-label-current", true)
			.attr("transform", "translate("+width/1.16+",70)")
			.text("Market Value");
	}
}

function plot(params){
	drawStatic.call(this, params);
	var self = this;
	var prices = d3.keys(params.data_prices[0]).filter(function(d){
		return d == "open" || d == "high" || d == "low";
	});
	// enter()

	volumes.selectAll(".bar")
	.data(params.data_prices)
	.enter()
		.append("rect")
		.attr("clip-path", "url(#clip)")
		.style("fill", "#0065fc")
		.attr("x", function(d) { var time = timeParser(d.timestamp);return x(time); })
		.attr("width", 4)
		.attr("opacity", 0.25)
		.attr("y", function(d) { return y3(d.volume); })
		.attr("height", function(d) { return height2 - y3(d.volume); })
		.classed("bar", true);

	this.selectAll(".area")
		.data([params.data_prices])
		.enter()
			.append("path")
			.attr("clip-path", "url(#clip)")
			.classed("area",true);

	this.selectAll(".price")
		.data(prices)
		.enter()
			.append("g")
			.attr("clip-path", "url(#clip)")
			.attr("class", function(d){
				return d;
			})
			.classed("price", true);

	context.selectAll(".price")
		.data(prices)
		.enter()
			.append("g")
			.attr("clip-path", "url(#clip)")
			.attr("class", function(d){
				return d;
			})
			.classed("priceContext", true);
	this.selectAll(".legend")
		.data(prices)
		.enter()
		.append("g")
		.filter(function(d){return d=="open";})
		.attr("class", function(d){
			return "_"+d;
		})
		.classed("legend", true);
	this.selectAll(".legend")
		.append("rect")
		.attr("x", width+20)
		.attr("y", function(d,i){
			return i*20;
		})
		.attr("width", 10)
		.attr("height", 10);
  	this.selectAll(".legend")
  		.append("text")
		.attr("x", width+38)
		.attr("y", function(d,i){
			return (i*20)+9;
		})
		.text(function(d){
			return d.charAt(0).toUpperCase() + d.slice(1);
		});

	// update
	this.selectAll(".price")
		.style("stroke", function(d,i){
			// return colorScale(i);
			return "#0065fc";

		});

	volumes.selectAll(".bar")
			.on("mouseover", function(d){
				d3.selectAll(".vol-tooltip")
					.style("left", d3.event.pageX+5+"px")
					.style("top", d3.event.pageY+5+"px")
					.style("display", "inline-block")
					.html(function(){
						var curr_time = d.timestamp;
						var date_format = d3.timeFormat("%d-%m")(timeParser(d.timestamp));
						var time_format = d3.timeFormat("%H:%M")(timeParser(d.timestamp));

						return date_format + " (<b>"+time_format+"</b>)<br/><b>Volume</b>: "+ d3.format(",")(d.volume);
					 })
					.transition();
				d3.select(this)
					.transition()
					.style("opacity", 1);
			})
			.on("mouseout", function(d){
				d3.select(this)
					.transition()
					.style("opacity", 0.25);
				d3.selectAll(".vol-tooltip")
					.style("display", "none")
					.transition();
			});

	context.selectAll(".priceContext")
		.style("stroke", function(d,i){
			// return colorScale(i);
			return "#0065fc";
		});

	this.selectAll(".legend")
		.style("fill", function(d, i){
			// return colorScale(prices.indexOf(d));
			return "#0065fc";
		})

	prices.forEach(function(price){		
		var g = self.selectAll("g."+price);
		var ctx = context.selectAll("g."+price);

		// var groupDOM = $(g).get(0)["_groups"][0][0];
		var arr = params.data_prices.map(function(d){
			return {
				key: price,
				timestamp: d.timestamp,
				volume: d.volume,
				value: d[price]
			};
		});
		// enter()
		ctx.selectAll(".area")
			.data([params.data_prices])
			.enter()
				.append("path")
				.attr("clip-path", "url(#clip)")
				.classed("area",true)

		g.selectAll(".trendline")
			.data([arr])
			.enter()
				.append("path")
				.filter(function(d,i){return d[i].key=="open"})
				.classed("trendline", true);

		ctx.selectAll(".trendline")
			.data([arr])
			.enter()
				.append("path")
				.filter(function(d,i){return d[i].key=="open"})
				.classed("trendline", true);

		g.selectAll(".point")
			.data(arr)
			.enter()
				.append("circle")
				.filter(function(d){return d.key=="open";})
				.classed("point", true)
				.attr("r", 3)
				.style("fill", "#fff");

		ctx.selectAll(".point")
			.data(arr)
			.enter()
				.append("circle")
				.filter(function(d){return d.key=="open";})
				.classed("point", true)
				.attr("r", 1.5)
				.style("fill", "#fff");
		//update
		ctx.selectAll(".area")
			.attr("d", function(d){
				return areaCtx(d);
			});

		ctx.selectAll(".point")
			.attr("cx", function(d){
				var time = timeParser(d.timestamp);
				return x2(time);
			})
			.attr("cy", function(d){
				return y2(d.value);
			});

		g.selectAll(".point")
			.attr("cx", function(d){
				var time = timeParser(d.timestamp);
				return x(time);
			})
			.attr("cy", function(d){
				return y(d.value);
			})
			.on("mouseover", function(d,i){
				var curr_point = this;
				var timeParser = d3.timeParse("%s");

				d3.select(this)
					.transition()
					.attr("r", 6)
					.style("stroke-width", 2)
					.attr("fill", "#588C73");
    			d3.selectAll(".tooltip")
					.style("left", d3.event.pageX+5+"px")
					.style("top", d3.event.pageY+5+"px")
					.style("display", "inline-block")
					.html(function(){
						var curr_time = d.timestamp;
						var curr_obj = params.data_prices.filter(function(d){return d.timestamp==curr_time;})[0];
						var date_format = d3.timeFormat("%d-%m")(timeParser(d.timestamp));
						var time_format = d3.timeFormat("%H:%M")(timeParser(d.timestamp));
						var prices = {
							high: parseFloat(curr_obj.high).toFixed(2),
							low: parseFloat(curr_obj.low).toFixed(2)
						}

						return date_format + " (<b>"+time_format+"</b>)<br/><b>High:</b>" + "&nbsp;"+prices.high+"<br/><b>Low:</b>"+"&nbsp;"+prices.low;
					 })
					.transition();
				d3.selectAll(".market-labels")
					.transition().delay(50)
					.style("opacity", 1);
				d3.selectAll(".market-current")
					.transition().delay(50)
					.style("opacity", 1)
					.text(function(){
						return "$"+d.value.toFixed(2);
					});
				d3.selectAll(".market-by-val")
					.transition().delay(50)
					.style("opacity", 1)
					.text(function(){
						var index = arr.findIndex(x => x.timestamp==d.timestamp);
						if (index==0) return;
						var decVal = d.value - arr[index-1].value;
						var val = (d.value - arr[index-1].value).toFixed(2);

						if(val>0) return "+"+val;
						else return val;
					})
					.style("fill", function(){
						var index = arr.findIndex(x => x.timestamp==d.timestamp);
						if (index==0) return;
						var val = (d.value - arr[index-1].value).toFixed(2);

						if(val>0) return "#84c283";
						else return "#ff7575";
					});
				d3.selectAll(".market-by-percent")
					.transition().delay(50)
					.style("opacity", 1)
					.text(function(){
						var index = arr.findIndex(x => x.timestamp==d.timestamp);
						if (index==0) return;
						var decVal = d.value - arr[index-1].value;
						var percentage = ((decVal/arr[index-1].value)*100).toFixed(2);

						if(percentage>0) return "+"+percentage+"%";
						else return percentage+"%";
					})
					.style("fill", function(){
						var index = arr.findIndex(x => x.timestamp==d.timestamp);
						if (index==0) return;
						var decVal = d.value - arr[index-1].value;
						var percentage = ((decVal/arr[index-1].value)*100).toFixed(2);

						if(percentage>0) return "#84c283";
						else return "#ff7575";
					});

				// PANEL
				var tweet_arr = [];
				for(j in data_tweets){
					var tweet_time = timeParser(data_tweets[j]['timestamp_s']);
					var point_time = timeParser(d3.select(curr_point).data()[0].timestamp);
					var diff = point_time.getTime() - tweet_time.getTime();
					if(diff<=1800000 && diff>=-1800000) {
						tweet_arr.push(data_tweets[j]);
					}
				}
				twitterapi.fetch().getTweets(tweet_arr, tweet_urls[0], tweet_urls[1]);

			})
			.on("mouseout", function(d,i){
				d3.selectAll(".market")
					.transition().delay(50)
					.style("opacity", 0);
				d3.selectAll(".market-labels")
					.transition().delay(50)
					.style("opacity",0);
				d3.select(this)
					.transition()
					.attr("r", 3)
					.style("stroke-width", 1);
				d3.selectAll(".tooltip")
					.style("display", "none")
					.transition();
					// exit()
				var tweet_list = []
				d3.selectAll(".panel-body")
					.data(tweet_list)
					.exit()
					.remove();
			});

		ctx.selectAll(".trendline")
			.attr("d", function(d){
				return lineCtx(d);
			})

		g.selectAll(".trendline")
			.attr("d", function(d){
				return line(d);
			})
			.on("mouseover", function(d,i){
				d3.select(this)
					.transition()
					.style("opacity", 1);
/*					if($(groupDOM).attr("class")=="open price") {
						self.selectAll(".area")
							.transition()
							.style("opacity", 0.5);
					}*/
				g.selectAll(".point")
					.transition()
					.attr("r", 4)
					.style("opacity", 1)
					.style("stroke-width", 1);
			});


		//exit()
		ctx.selectAll(".area")
			.data([params.data_prices])
			.exit()
			.remove();

		ctx.selectAll(".point")
			.data(arr)
			.exit()
			.remove();

		ctx.selectAll(".trendline")
			.data([arr])
			.exit()
			.remove();

		g.selectAll(".point")
			.data(arr)
			.exit()
			.remove();

		g.selectAll(".trendline")
			.data([arr])
			.exit()
			.remove();

		volumes.selectAll(".bar")
			.data(params.data_prices)
			.exit()
			.remove();
	});

	context.append("g")
			.attr("class", "brush")
			.call(brush)
			.call(brush.move, [x.range()[1]/4, x.range()[1]/1.4]);

	this.selectAll(".area")
		.attr("d", function(d){
			return area(d);
		});

	// exit
	this.selectAll(".area")
		.data([params.data_prices])
		.exit()
		.remove();

	d3.select("body")
		.append("div")
		.attr("class", "tooltip")
		.classed("tooltip", true);

	d3.select("body")
		.append("div")
		.attr("class", "vol-tooltip")
		.classed("vol-tooltip", true);

	d3.select("#bs-right-div")
		.append("div")
		.attr("class", "panel")
		.attr("height", h)
		.classed("panel", true);

	d3.select("#bs-left-div")
		.append("div")
		.attr("class", "panelstream")
		.attr("height", h)
		.classed("panelstream", true);


	// twitterapi.fetch().postStream(cashtag);
}
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

function brushed() {
	if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;
	var selection = d3.event.selection;
	x.domain(selection.map(x2.invert, x2));
	focus.selectAll(".point")
		.attr("cx", function(d){
			var time = timeParser(d.timestamp);
			return x(time);
		})
		.attr("cy", function(d){
			return y(d.value);
		});
	focus.selectAll(".trendline")
		.attr("d", function(d){
			return line(d);
		});
	focus.selectAll(".area")
		.attr("d", function(d){
			return area(d);
		});
	volumes.selectAll(".bar")
		.attr("x", function(d) { 
			var time = timeParser(d.timestamp);
			return x(time); 
		});
	focus.select(".axis.x").call(xAxis);
	d3.select(".focus").call(zoom.transform, d3.zoomIdentity
	 	.scale(width / (selection[1] - selection[0]))
	 	.translate(-selection[0], 0));
}

function zoomed() {
	if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return;
	var t = d3.event.transform;
	x.domain(t.rescaleX(x2).domain());
	volumes.selectAll(".bar")
	.attr("x", function(d) { 
		var time = timeParser(d.timestamp);
		return x(time); 
	});
	focus.selectAll(".point")
		.attr("cx", function(d){
			var time = timeParser(d.timestamp);
			return x(time);
		})
		.attr("cy", function(d){
			return y(d.value);
		});
	focus.selectAll(".trendline")
		.attr("d", function(d){
			return line(d);
		});
	focus.selectAll(".area")
		.attr("d", function(d){
			return area(d);
		});
	focus.select(".axis.x").call(xAxis);
	context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
}