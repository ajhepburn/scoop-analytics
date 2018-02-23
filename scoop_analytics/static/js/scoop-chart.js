var market = "NASDAQ";
var cashtag = "HMNY"
var init_brush = null;

setInterval(function(){ 
	googleapi.fetch().scrapePage(market, cashtag, data_prices[data_prices.length-1]);
}, 60000);

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


var x = d3.scaleTime()
		.domain([d3.min(data_prices, function(d){
		    	var time = timeParser(d.timestamp);
				return time;
			}), d3.max(data_prices, function(d){
		    	var time = timeParser(d.timestamp);
				return time;
			})])
		.range([0,width]),
	y = d3.scaleLinear()
		.domain([d3.min(data_prices, function(d) { return d.close; }), d3.max(data_prices, function(d) { return d.close; })]).nice()
		.range([height, 0]),
	x2 = d3.scaleTime().range([0,width])
		.domain(x.domain()),
	y2 = d3.scaleLinear().range([height2,0])
		.domain(y.domain()),
	x3 = d3.scaleBand().rangeRound([0, width]).padding(0.5),
	y3 = d3.scaleLinear().range([height2, 0]);

x3.domain(x.domain());
y3.domain([d3.min(data_prices, function(d) { return d.volume; }), d3.max(data_prices, function(d) { return d.volume; })]).nice();

var formatMillisecond = d3.timeFormat(".%L"),
    formatSecond = d3.timeFormat(":%S"),
    formatMinute = d3.timeFormat("%H:%M"),
    formatHour = d3.timeFormat("%H:%M"),
    formatDay = d3.timeFormat("%a %d"),
    formatWeek = d3.timeFormat("%b %d"),
    formatMonth = d3.timeFormat("%B"),
    formatYear = d3.timeFormat("%Y");

function multiFormat(date) {
  return (d3.timeSecond(date) < date ? formatMillisecond
    : d3.timeMinute(date) < date ? formatSecond
    : d3.timeHour(date) < date ? formatMinute
    : d3.timeDay(date) < date ? formatHour
    : d3.timeMonth(date) < date ? (d3.timeWeek(date) < date ? formatDay : formatWeek)
    : d3.timeYear(date) < date ? formatMonth
    : formatYear)(date);
}

var xAxis = d3.axisBottom(x)
			.tickFormat(multiFormat);
	xAxis2 = d3.axisBottom(x2)
			.tickFormat(multiFormat);
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
			.curve(d3.curveLinear);
var lineCtx = d3.line()
			.x(function(d){
				var time = timeParser(d.timestamp);
				return x2(time);
			})
			.y(function(d){
				return y2(d.value);
			})
			.curve(d3.curveLinear);
var area = d3.area()
			.x(function(d) {
				var time = timeParser(d.timestamp);
				return x(time);
			})
			.y0(height)
			.y1(function(d){
				return y(d.close);
			})
			.curve(d3.curveLinear);
var areaCtx = d3.area()
			.x(function(d) {
				var time = timeParser(d.timestamp);
				return x2(time);
			})
			.y0(height2)
			.y1(function(d){
				return y2(d.close);
			})
			.curve(d3.curveLinear);

function drawStatic(params){
	if(params.initialise){
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

		this.append("g")
			.classed("gridline x", true)
			.attr("transform", "translate(0,"+height+")")
			.call(params.gridlines.x);
		this.append("g")
			.classed("gridline y", true)
			.attr("transform", "translate(0,0)")
			.call(params.gridlines.y);

		d3.select("#chart")
			.append("text")
			.classed("y axis-label",true)
			.attr("transform", "translate(30,"+height/1.25+") rotate(-90)")
			.text(function(){
				return market+":"+cashtag+" Share Price ($)";
			});
		d3.select("#chart")
			.append("text")
			.classed("x axis-label",true);
		d3.select("#chart")
			.append("text")
			.classed("market market-by-val", true)
			.attr("transform", "translate("+width/4.08+",30)")
			.text("");
		var marketData = d3.select("#chart")
						.append("g")
						.attr("transform", "translate("+width/8+",75)")
						.classed("m-data", true);
		/*marketData.append("text")
				.classed("market market-by-percent", true)
				.attr("transform", "translate(0,-20)")
				.text("");*/
		var dataRange = ['current','high', 'low', 'avg', 'vol'];
		for(var i=0; i<dataRange.length; i++){
			var txt = dataRange[i];
			marketData.append("text")
						.classed("market market-"+dataRange[i],true)
						.attr("transform", "translate("+(45*i)+",0)");
		}
		/*marketData.append("text")
				.classed("market market-current", true)
				.attr("transform", "translate(0,0)")
				.text("");
		marketData.append("text")
				.classed("market market-high", true)
				.attr("transform", "translate(45,0)")
				.text("");
		marketData.append("text")
				.classed("market market-low", true)
				.attr("transform", "translate(90,0)")
				.text("");
		marketData.append("text")
				.classed("market market-avg", true)
				.attr("transform", "translate(185,0)")
				.text("");*/

		var marketLabels = d3.select("#chart")
							.append("g")
							.attr("transform", "translate("+width/9+",75)")
							.classed("m-labels", true);

		var labelRange = ['C', 'H', 'L', 'A', 'V'];
		for(var i=0; i<labelRange.length; i++){
			var txt = labelRange[i];
			marketLabels.append("text")
						.classed("market-labels market-"+labelRange[i],true)
						.attr("transform", "translate("+(45*i)+",0)")
						.text(txt);
		}
		/*d3.select(".market-C").attr("transform", "translate(0,0)");
		d3.select(".market-H").attr("transform", "translate(45,0)");
		d3.select(".market-L").attr("transform", "translate(90,0)");
		d3.select(".market-A").attr("transform", "translate(135,0)");*/
		d3.select("#chart")
			.append("text")
			.classed("lastupdated", true)
			.attr("transform", "translate("+width/9+",25)")
			.text(function(){
				var lastUpdated = String(timeParser(data_prices[data_prices.length-1].timestamp)).slice(0,-15);
				return "Last updated: "+lastUpdated;
			});
	}
}

function plot(params){
	drawStatic.call(this, params);
	var self = this;
	var prices = d3.keys(params.data_prices[0]).filter(function(d){
		return d == "close" || d == "high" || d == "low" || d=="average";
	});
	
	// enter()
	volumes.selectAll(".bar")
	.data(params.data_prices)
	.enter()
		.append("rect")
		.attr("clip-path", "url(#clip)")
		.style("fill", "#0065fc")
		.style("stroke", "blue")
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
		.filter(function(d){return d=="close" || d=="average";})
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

	var overlay = focus.append("rect")
		      .attr("class", "overlay")
		      .attr("width", width)
		      .attr("height", height)
		      .attr("opacity", "0")
		      .on("mouseover", function(){ lineTrackC.style("display", null); lineTrackA.style("display", null); })
			  .on("mouseout", function() { 
			  	hoverLineX.style("opacity", 1e-6); 
			  	hoverLineY.style("opacity", 1e-6); 
			  	d3.selectAll(".market-labels").style("opacity", 0);
			  	d3.selectAll(".market").style("opacity", 0);
			  	lineTrackC.style("display", "none");
			  	lineTrackA.style("display", "none");
			  })
			  .on("mousemove", mousemove);

	var hoverLineGroup = focus.append("g")
						.attr("class", "hover-line-group");
	var hoverLineX = hoverLineGroup.append("line")
					.attr("id", "hover-line-x")
					.attr("x1", 10).attr("x2", 10) 
					.attr("y1", 0).attr("y2", height); 
	hoverLineX.style("opacity", 1e-6);

	var hoverLineY = hoverLineGroup.append("line")
					.attr("id", "hover-line-y")
					.attr("x1", 0).attr("x2", width) 
					.attr("y1", 10).attr("y2", 10); 
	hoverLineY.style("opacity", 1e-6);


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
			if(d=="average") return '#ffb2b2';
			else if(d=="close") return "#0065fc";
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
				.filter(function(d,i){return d[i].key=="close"})
				.classed("trendline", true);

		g.selectAll(".avgLine")
			.data([arr])
			.enter()
				.append("path")
				.filter(function(d,i){return d[i].key=="average"})
				.classed("avgLine", true);

		ctx.selectAll(".trendline")
			.data([arr])
			.enter()
				.append("path")
				.filter(function(d,i){return d[i].key=="close"})
				.classed("trendline", true);

		ctx.selectAll(".avgLine")
			.data([arr])
			.enter()
				.append("path")
				.filter(function(d,i){return d[i].key=="average"})
				.classed("avgLine", true);

		//update
		ctx.selectAll(".area")
			.attr("d", function(d){
				return areaCtx(d);
			});

		ctx.selectAll(".trendline")
			.attr("d", function(d){
				return lineCtx(d);
			});

		g.selectAll(".trendline")
			.attr("d", function(d){
				return line(d);
			});

		ctx.selectAll(".avgLine")
			.attr("d", function(d){
				return lineCtx(d);
			});

		g.selectAll(".avgLine")
			.attr("d", function(d){
				return line(d);
			});


/*		//exit()
		ctx.selectAll(".area")
			.data([params.data_prices])
			.exit()
			.remove();

		ctx.selectAll(".trendline")
			.data([arr])
			.exit()
			.remove();

		g.selectAll(".trendline")
			.data([arr])
			.exit()
			.remove();

		ctx.selectAll(".avgLine")
			.data([arr])
			.exit()
			.remove();

		g.selectAll(".avgLine")
			.data([arr])
			.exit()
			.remove();

		volumes.selectAll(".bar")
			.data(params.data_prices)
			.exit()
			.remove();*/
	});
	
	var brushGroup = context.append("g")
						.attr("class", "brush")
						.call(brush)
						
	if(init_brush!=null) {
		brushGroup.call(brush.move, init_brush);
	}
	else brushGroup.call(brush.move, [x.range()[1]/4, x.range()[1]/1.4]);

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

	var lineTrackC = focus.append("g")
		.attr("class", "lineTrackC")
		.style("display", "none");

	var lineTrackA = focus.append("g")
		.attr("class", "lineTrackA")
		.style("display", "none");

	lineTrackC.append("circle")
		.attr("r", 4.5);

	lineTrackC.append("text")
		.attr("x", 9)
		.attr("dy", ".35em");

	lineTrackA.append("circle")
		.attr("r", 4.5);

	lineTrackA.append("text")
		.attr("x", 9)
		.attr("dy", ".35em");

	focus.select(".axis.x").append("g").classed("hover-rect-group-x", true);

	d3.select(".hover-rect-group-x")
		 .append("rect")
		 .attr("id", "hover-rect-x")
		 .attr("width", 40)
		 .attr("height",19)
	d3.select(".hover-rect-group-x")
		.append("text")
		.attr("id", "hover-text-x")
		.style("text-anchor", "middle");

	focus.select(".axis.y").append("g").classed("hover-rect-group-y",true);

	d3.select(".hover-rect-group-y")
		 .append("rect")
		 .attr("id", "hover-rect-y")
		 .attr("width", 35)
		 .attr("height",19)
		 .attr("transform", "translate(-35,0)");
	d3.select(".hover-rect-group-y")
		.append("text")
		.attr("id", "hover-text-y");
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

function brushed() {
	if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;
	var selection = d3.event.selection;
	init_brush = selection;
	x.domain(selection.map(x2.invert, x2));
	d3.select(".x.axis-label")
		.text(function(){
			if(d3.timeFormat("%b %d, %Y")(x.domain()[0]) == d3.timeFormat("%b %d, %Y")(x.domain()[1])) return d3.timeFormat("%b %d, %Y")(x.domain()[0]);
			else return d3.timeFormat("%b %d, %Y")(x.domain()[0])+" - "+d3.timeFormat("%b %d, %Y")(x.domain()[1]);
		})
		.attr("transform", function(){
			if(d3.timeFormat("%b %d, %Y")(x.domain()[0]) == d3.timeFormat("%b %d, %Y")(x.domain()[1])) return "translate("+width+",75)";
			else return "translate("+(width-70)+",75)";
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
	d3.select(".x.axis-label")
		.text(function(){
			if(d3.timeFormat("%b %d, %Y")(x.domain()[0]) == d3.timeFormat("%b %d, %Y")(x.domain()[1])) return d3.timeFormat("%b %d, %Y")(x.domain()[0]);
			else return d3.timeFormat("%b %d, %Y")(x.domain()[0])+" - "+d3.timeFormat("%b %d, %Y")(x.domain()[1]);
		})
		.attr("transform", function(){
			if(d3.timeFormat("%b %d, %Y")(x.domain()[0]) == d3.timeFormat("%b %d, %Y")(x.domain()[1])) return "translate("+width+",75)";
			else return "translate("+(width-70)+",75)";
		});

	volumes.selectAll(".bar")
	.attr("x", function(d) { 
		var time = timeParser(d.timestamp);
		return x(time); 
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
		});
		
	init_brush = x.range().map(t.invertX, t);
	focus.select(".axis.x").call(xAxis);
	context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
}

var lastGet = 0;
var lastRemove = 0;

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

	d3.select(".lineTrackC").attr("transform", "translate(" + x(timeParser(d.timestamp)) + "," + y(d.close) + ")");
	d3.select(".lineTrackA").attr("transform", "translate(" + x(timeParser(d.timestamp)) + "," + y(d.average) + ")");
    d3.select(".lineTrackC").select("text").text(formatCurrency(d.close));
    d3.select(".lineTrackA").select("text").text(formatCurrency(d.average));

	var xpos = d3.mouse(this)[0];
	var ypos = d3.mouse(this)[1];
	d3.select("#hover-line-x").attr("x1", xpos-4).attr("x2", xpos-4).style("opacity", 1);
	d3.select("#hover-line-y").attr("y1", ypos-4).attr("y2", ypos-4).style("opacity", 1);

	d3.select("#hover-rect-x").attr("x", xpos-24);
	d3.select("#hover-text-x").attr("x", xpos-4).attr("y",12.5).text(multiFormat(timeParser(d.timestamp)));
	d3.select("#hover-rect-y").attr("y", ypos-12);
	d3.select("#hover-text-y").attr("y", ypos).attr("x",-10).text(y.invert(ypos).toFixed(2));



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
	/*d3.selectAll(".market-by-val")
		.transition().delay(50)
		.style("opacity", 1)
		.text(function(){
			var index = data_prices.findIndex(x => x.timestamp==d.timestamp);
			if (index==0) return;
			var decVal = d.close - data_prices[index-1].close;
			var val = (d.close - data_prices[index-1].close).toFixed(2);

			if(val>0) return "+"+val;
			else return val;
		})
		.style("fill", function(){
			var index = data_prices.findIndex(x => x.timestamp==d.timestamp);
			if (index==0) return;
			var val = (d.close - data_prices[index-1].close).toFixed(2);

			if(val>0) return "#84c283";
			else return "#ff7575";
		});*/
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
	var tweet_arr = [];
	for(j in data_tweets){
		var tweet_time = timeParser(data_tweets[j]['timestamp_s']);
		var point_time = timeParser(d.timestamp);
		var diff = point_time.getTime() - tweet_time.getTime();
		if(diff<=1800000 && diff>=-1800000) {
			tweet_arr.push(data_tweets[j]);
		} else {
			if(Date.now() - lastRemove>1000) {
				var tweet_list = []
				d3.selectAll(".panel-body")
					.data(tweet_list)
					.exit()
					.remove();
				lastRemove = Date.now()
			}
		}
	}

	if(Date.now() - lastGet > 1000) {
		twitterapi.fetch().getTweets(tweet_arr, tweet_urls[0], tweet_urls[1])
        lastGet = Date.now();
    }
}

$(".overlay").hover(function(){}, function(){
var clearPanel = setInterval(function(){
	var tweet_list = []
	d3.selectAll(".panel-body")
		.data(tweet_list)
		.exit()
		.remove();
	},100);
setTimeout(function(){clearInterval(clearPanel);},1000);
});

function resetGraph() {
    d3.select(".focus").selectAll("*").remove();
    d3.select(".context").selectAll("*").remove();
    d3.select(".volume").selectAll("*").remove();

    d3.selectAll(".axis-label").remove();
    d3.selectAll(".gridline").remove();
    d3.selectAll(".m-data").remove();
    d3.selectAll(".m-labels").remove();
    d3.selectAll(".tooltip").remove();
    d3.selectAll(".vol-tooltip").remove();
    d3.select(".lastupdated").remove();

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