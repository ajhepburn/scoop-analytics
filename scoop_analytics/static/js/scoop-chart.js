var market = data_prices[data_prices.length-1]['market'];
var cashtag = data_prices[data_prices.length-1]['symbol'];
var init_brush = null;
var tweet_ranges=[];
var data_tweets=[];
var price_changes=[];
var discontinuityList=[];

twitterapi.fetch([], tweet_urls[0], tweet_urls[1]).getLiveTweets(true);

/*setInterval(function(){ 
	googleapi.fetch().scrapePage(market, cashtag, data_prices[data_prices.length-1]);
}, 120000);*/

$("#market-dropdown  a").click(function(){
	d3.select("#confirm-change-text").text("Confirm");
	var selText = $(this).text();
	d3.select("#market-btn").text(selText);
});

$("#stock-dropdown  a").click(function(){
	d3.select("#confirm-change-text").text("Confirm");
	var selText = $(this).text();
	d3.select("#stock-btn").text(selText);
});

var w = 900,
	h = 800,
	margin = {
	  top: 88,
	  bottom: 400,
	  left: 80,
	  right: 100
	},
	margin2 = {
		top: 420,
		bottom: 315,
		left: 80,
		right: 20
	},
	margin3 = {
		top: 485,
		bottom: 215,
		left: 80,
		right: 20
	},
	margin4 = {
		top:575,
		bottom:150,
		left:80,
		right:20
	}
	width = w - margin.left - margin.right,
	height = h - margin.top - margin.bottom,
	height2 = h - margin2.top - margin2.bottom;
	height3 = h - margin3.top - margin3.bottom;
	// Analytics
	height4 = h - margin4.top - margin4.bottom; // Analytics "div"	

	// Analytics heights, margins
	marginDailyClose = {
		top: 590,
		bottom: 75,
		left: 80,
		right: 20
	}
	heightDailyClose = h - marginDailyClose.top - marginDailyClose.bottom;

var zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", functions.chart().zoomed);

var svg = d3.select("#bs-center-div").append("svg")
        	.attr("id", "chart")
			.attr("width", w)
			.attr("height", h);

var areaGradient = svg.append("defs")
	.append("linearGradient")
	.attr("id","areaGradient")
	.attr("x1", "0%").attr("y1", "0%")
	.attr("x2", "0%").attr("y2", "100%");
areaGradient.append("stop")
	.attr("offset", "0%")
	.attr("stop-color", "#93cae1")
	.attr("stop-opacity", 1);
areaGradient.append("stop")
	.attr("offset", "50%")
	.attr("stop-color", "#c6dbef")
	.attr("stop-opacity", 1);
areaGradient.append("stop")
	.attr("offset", "100%")
	.attr("stop-color", "white")
	.attr("stop-opacity", 1);


var areaGradientCtx = svg.append("defs")
	.append("linearGradient")
	.attr("id","areaGradientCtx")
	.attr("x1", "0%").attr("y1", "0%")
	.attr("x2", "0%").attr("y2", "100%");

areaGradientCtx.append("stop")
	.attr("offset", "0%")
	.attr("stop-color", "#003d99")
	.attr("stop-opacity", 0.15);
areaGradientCtx.append("stop")
	.attr("offset", "100%")
	.attr("stop-color", "white")
	.attr("stop-opacity", 0);

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
var analytics = svg.append("g")
				.classed("analytics", true)
				.attr("transform", "translate("+margin4.left+","+margin4.top+")")

var timeParser = d3.timeParse("%s");

discontinuityList = functions.chart().collectDiscontinuities();

var x = fc.scaleDiscontinuous(d3.scaleTime())
		.domain([d3.min(data_prices, function(d){
		    	var time = timeParser(d.timestamp);
				return time;
			}), d3.max(data_prices, function(d){
		    	var time = timeParser(d.timestamp);
				return time;
			})])
		.range([0,width])
	y = d3.scaleLinear()
		.domain([d3.min(data_prices, function(d) { return d.close; }), d3.max(data_prices, function(d) { return d.close; })]).nice()
		.range([height, 0]),
	x2 = fc.scaleDiscontinuous(d3.scaleTime())
		.range([0,width])
		.domain(x.domain()),
	y2 = d3.scaleLinear().range([height2,0])
		.domain(y.domain()),
	x3 = d3.scaleBand().rangeRound([0, width]).padding(0.5),
	y3 = d3.scaleLinear().range([height2, 0]);

x3.domain(x.domain());
y3.domain([d3.min(data_prices, function(d) { return d.volume; }), d3.max(data_prices, function(d) { return d.volume; })]).nice();

functions.chart().setDiscontinuities(discontinuityList);

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
    .on("brush", functions.chart().brushed);

var colorScale = d3.scaleOrdinal(d3.schemeCategory20);

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


function colorise(key){
	if(key<0) return "#d62728";
	else return "#2ca02c";
}

function drawTweetIndicators(params){
	var point_arr = [];
	var g = this.selectAll("g.close");
	var ctx = context.selectAll("g.close");

	var tweet_times=[];
	data_tweets.forEach((val)=>{tweet_times.push(d3.timeFormat('%s')(d3.timeParse("%a %b %d %H:%M:%S %Z %Y")(val['created_at'])));});

	var temp_arr=[];
	tweet_ranges.forEach((val)=>{temp_arr.push(data_prices.find(x=>x.timestamp == val[1]));});

	temp_arr.forEach((val)=>{
		for(var i=0; i < tweet_times.length; i++) {
			var diff = val.timestamp - tweet_times[i];
			if(diff<=1800 && diff>=-1800) {
				if(!point_arr.includes(val)) point_arr.push(val);
			}
		}
	});

	// enter()
	this.selectAll(".pointLine")
	.data(point_arr)
		.enter()
		.append("line")
		.classed("pointLine", true)
		.attr("clip-path", "url(#clip)");

	this.selectAll(".point")
	.data(point_arr)
	.enter()
		.append("circle")
		.classed("point", true)
		.attr("clip-path", "url(#clip)")
		.attr("r", 4)
		.style("fill", "#fff");

	context.selectAll(".pointLineCtx")
	.data(point_arr)
		.enter()
		.append("line")
		.classed("pointLineCtx", true)
		.attr("clip-path", "url(#clip)");

	context.selectAll(".pointCtx")
	.data(point_arr)
	.enter()
		.append("circle")
		.classed("pointCtx", true)
		.attr("clip-path", "url(#clip)")
		.attr("r", 2)
		.style("fill", "#fff");

	// update

	this.selectAll(".pointLine")
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

	this.selectAll(".point")
	.attr("cx", function(d){
		var time = timeParser(d.timestamp);
		return x(time);
	})
	.attr("cy", function(d){
		return y(d.close);
	});

	context.selectAll(".pointLineCtx")
	.attr("x1", function(d){
		var time = timeParser(d.timestamp);
		return x2(time);	
	})
	.attr("x2", function(d){
		var time = timeParser(d.timestamp);
		return x2(time);	
	})
	.attr("y1", function(d){
		return y2(d.close);
	})
	.attr("y2", function(d){
		return y2(d3.min(data_prices, function(d) { return d.close; }));
	});

	context.selectAll(".pointCtx")
	.attr("cx", function(d){
		var time = timeParser(d.timestamp);
		return x2(time);
	})
	.attr("cy", function(d){
		return y2(d.close);
	});
}

function drawTechIndicators(params){
	this.append("g")
		.classed("axis y-layer-lastval", true)
		.attr("transform", "translate(0,0)")
		.attr("width", d3.select(".axis.y").node().getBBox().width)
		.attr("height", d3.select(".axis.y").node().getBBox().height);

	focus.select(".axis.y-layer-lastval").append("g").classed("rect-group-lastval",true).attr("transform", "translate(0,-10)");
	d3.select(".rect-group-lastval")
			.append("rect")
			.attr("id", "lastval-rect")
			.attr("width", 35)
			.attr("height",19)
			.attr("transform", "translate(-35,0)")
			.attr("y",y(data_prices[data_prices.length-1].close));
	d3.select(".rect-group-lastval")
			.append("text")
			.attr("id", "lastval-text")
			.attr("transform", "translate(-32,0)")
			.attr("y",y(data_prices[data_prices.length-1].close)+12)
			.text(function(){
				return data_prices[data_prices.length-1].close.toFixed(2);
			});
	d3.select(".rect-group-lastval")
			.append("line")
			.attr("id", "lastval-line")
			.attr("x1", 0).attr("x2", width) 
			.attr("y1", y(data_prices[data_prices.length-1].close)+9).attr("y2", y(data_prices[data_prices.length-1].close)+9); 

	this.append("g")
		.classed("axis y-layer", true)
		.attr("transform", "translate(0,0)")
		.attr("width", d3.select(".axis.y").node().getBBox().width)
		.attr("height", d3.select(".axis.y").node().getBBox().height);

	focus.select(".axis.x-layer2").append("g").classed("hover-rect-group-x", true).style("display", "none");

	d3.select(".hover-rect-group-x")
		 .append("rect")
		 .attr("id", "hover-rect-x")
		 .attr("width", 85)
		 .attr("height",19);
	d3.select(".hover-rect-group-x")
		.append("text")
		.attr("id", "hover-text-x")
		.style("text-anchor", "middle");

	focus.select(".axis.y-layer").append("g").classed("hover-rect-group-y",true).style("display", "none");

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

function drawXAxis(params){
	var xFake = d3.select(".axis.x-fake");

	xFake.append("line").attr("y2", 6).attr("stroke", "#ccc");
	xFake.append("text").attr("id", "x-fake-text0").text(d3.timeFormat("%H:%M")(x.domain()[0])).attr("x", -10).attr("y", 18);
	xFake.append("text").attr("id", "x-fake-text1").text(d3.timeFormat("%H:%M")(x.domain()[1])).attr("x", width-10).attr("y", 18);
	xFake.append("line").attr("x1", width).attr("x2", width).attr("y2", 6).attr("stroke", "#ccc");
}

function drawDashboard(params){
	function getLastWeek() {
		var lastWeek=[];
		var c = 0;
		var lastEntry = data_prices[data_prices.length-1];
		var topOfWeek = timeParser(lastEntry.timestamp).getDay();
		console.log(topOfWeek);
		
		if(topOfWeek==1) {
			for(var i=data_prices.length-1; i>=0; --i){
				if(timeParser(data_prices[i].timestamp).getDay()>topOfWeek) {
					topOfWeek = data_prices[i];
					break;
				}
			}
			var fromIndex = data_prices.slice(0, data_prices.indexOf(topOfWeek));
			for (var i=fromIndex.length-1; i >= 0; --i) {
				if(timeParser(fromIndex[i].timestamp).getDay()>=topOfWeek && timeParser(fromIndex[i].timestamp).getDate()!=timeParser(fromIndex[fromIndex.length-1].timestamp).getDate()) break;
				else lastWeek.push(fromIndex[i]);
			}
			return lastWeek;
		}

		for (var i=data_prices.length-1; i >= 0; --i) {
			if(timeParser(data_prices[i].timestamp).getDay()>=topOfWeek && timeParser(data_prices[i].timestamp).getDate()!=timeParser(lastEntry.timestamp).getDate()) break;
			else lastWeek.push(data_prices[i]);
		}
		return lastWeek;
	}

	function fill(str){
		typeof(str);
		if (str.includes("+")) return "#84c283";
		else if (str.includes("-")) return "#ff7575";
		else return "#888a91";
	}

	var lastWeek = getLastWeek();

	function getAverages(key){
		var total = 0;
		for(var i=0; i < lastWeek.length; i++) {
			total+=lastWeek[i][key]
		}
		return total/lastWeek.length;
	}

	var days = [...new Set(lastWeek.map(item => timeParser(item.timestamp).getDay()))];
	function getDailyData(key) {
		const reducer = (acc, val) => acc + val;
		var result=[];
		
		if(key=='close') {
			var indexes=[];
			days.forEach((val)=>{indexes.push(lastWeek.findIndex(x=>timeParser(x.timestamp).getDay() == val));});
			indexes.forEach((val)=>{
				var day = String(d3.timeFormat('%a')(timeParser(lastWeek[val].timestamp)));
				var dict = {};
				dict[day]= lastWeek[val][key];
				result.push(dict);
			});
		} else {
			var volByDay = d3.nest().key(function(d){return d3.timeFormat('%a')(timeParser(d.timestamp));}).entries(lastWeek);
			volByDay.forEach((val)=>{
				var dict = {};
				dict[val.key] = val.values.map(item => item.volume).reduce((prev, next) => prev + next);
				result.push(dict);
			});
		}
		return result;
	}

	var color = d3.scaleOrdinal(d3.schemeCategory10);

	var dailyCloseGroup = this.append("g")
						.classed("daily-close-group", true)
						.attr("transform", "translate(0,"+marginDailyClose.bottom+")");

	var dailyVolGroup = this.append("g")
						.classed("daily-vol-group", true)
						.attr("transform", "translate(335,"+marginDailyClose.bottom+")");

	var arcGroup = this.append("g")
						.classed("arc-group", true)
						.attr("transform", "translate(710,"+(marginDailyClose.bottom+75)+")");

	dailyCloseGroup.append("text")
					.text("Daily Close Values")
					.attr("transform", "translate(55,-10)");

	dailyVolGroup.append("text")
					.text("Daily Volume")
					.attr("transform", "translate(85,-10)");

	arcGroup.append("text")
					.text(function(){
						return days.length+"-Day Change";
					})
					.attr("transform", "translate(-33,-87)");

	function drawDailyGraph(params) {
		var x = d3.scaleBand()
          .range([0, width/2.5])
          .padding(0.1);
		var y = d3.scaleLinear()
          .range([heightDailyClose,0]);

		x.domain(params.data.map(function(d) { return Object.keys(d)[0]; }));
  		y.domain([0, d3.max(params.data, function(d) { return Object.values(d)[0]; })]).nice();

  		params.group.selectAll(".bar")
						.data(params.data)
						.enter()
							.append("rect")
							.attr("class", "bar")
							.attr("x", function(d) { return x(Object.keys(d)[0]); })
							.attr("width", function(){
								if(params.group == dailyVolGroup){
									x.bandwidth();
								}
								return x.bandwidth();
							})
							.attr("y", function(d) { return y(Object.values(d)[0]); })
							.style("fill", function(d,i) {
								return color(i); 
							})
							.attr("height", function(d) { return heightDailyClose - y(Object.values(d)[0]); });
		
		params.group.selectAll("text.bar")
						.data(params.data)
						.enter()
							.append("text")
							.attr("class", "bar-text")
							.attr("text-anchor", "middle")
							.attr("x", function(d) { 
								if(params.group == dailyVolGroup){
									return x(Object.keys(d)[0])+26;
								}
								return x(Object.keys(d)[0])+22;
							})
							.attr("y", function(d) { return y(Object.values(d)[0]) + 10; })
							.text(function(d) { 
								if(params.group == dailyVolGroup) {
									return String(Object.values(d)[0]).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
								}
								return Object.values(d)[0].toFixed(2); 
							})
							.attr("fill", function(d,i){
								return "#fff"
							});

	  	params.group.append("g")
	     	.call(d3.axisLeft(y))
	     	.classed("axis axis-daily-y", true);

	  	params.group.append("g")
		     .attr("transform", "translate(0," + heightDailyClose + ")")
		     .call(d3.axisBottom(x))
		     .classed("axis axis-daily-x", true);

	}

	function drawArc(params) {
		var circ = 2 * Math.PI;
		var decimalPct = parseFloat(params.changePct) / 100.0;

		var arc = d3.arc()
		    .innerRadius(55)
		    .outerRadius(70)
		    .startAngle(0);

		var background = params.group.append("path")
		    .datum({endAngle: circ})
		    .style("fill", "#ddd")
		    .attr("d", arc);

		var foreground = params.group.append("path")
		    .datum({endAngle:decimalPct*circ})
		    .style("fill", function(d){
		    	return colorise(d.endAngle);
		    })
		    .attr("d", arc);

		params.group.append("text")
			.attr("id", "arc-change")
			.attr("transform", "translate(-30,-10)")
			.text(function(){
						if(params.change<0) return params.change;
						else return "+"+params.change;
					})
			.attr("fill", function(){
				return colorise(decimalPct);
			});

		params.group.append("text")
					.attr("id", "arc-change-pct")
					.attr("transform", "translate(-39,15)")
					.text(function(){
						if(params.changePct<0) return params.changePct+"%";
						else return "+"+params.changePct+"%";
					})
					.attr("fill", function(){
				    	return colorise(decimalPct);
					});
	}

	this.append("text")
		.attr("id", "analytics-header-text")
		.text(function(){
			return market+":"+cashtag+" Weekly Summary";
		});

	this.append("text")
		.attr("id", "analytics-lastval-label")
		.attr("transform", "translate(0,20)")
		.text("Last:")
		.classed("a-label", true);
	this.append("text")
		.attr("id", "analytics-lastval-data")
		.attr("transform", "translate(30,20)")
		.text(function(){
			return lastWeek[0].close.toFixed(2);
		})
		.classed("a-data", true);

	this.append("text")
		.attr("id", "analytics-volume-label")
		.attr("transform", "translate(80,20)")
		.text("Volume (Week):")
		.classed("a-label", true);
	this.append("text")
		.attr("id", "analytics-volume-data")
		.attr("transform", "translate(170,20)")
		.text(function(){
			var total = 0;
			for(item in lastWeek) {
				total+=lastWeek[item].volume;
			}
			return String(total).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		})
		.classed("a-data", true);

	this.append("text")
		.attr("id", "analytics-avg-close-label")
		.attr("transform", "translate(0,40)")
		.text("Avg. Close:")
		.classed("a-label", true);
	this.append("text")
		.attr("id", "analytics-avg-close-data")
		.attr("transform", "translate(65,40)")
		.text(function(){
			return getAverages('close').toFixed(2);
		})
		.classed("a-data", true);

	this.append("text")
		.attr("id", "analytics-avg-high-label")
		.attr("transform", "translate(140,40)")
		.text("Avg. High:")
		.classed("a-label", true);
	this.append("text")
		.attr("id", "analytics-avg-low-data")
		.attr("transform", "translate(200,40)")
		.text(function(){
			return getAverages('high').toFixed(2);
		})
		.classed("a-data", true);

	this.append("text")
		.attr("id", "analytics-avg-close-label")
		.attr("transform", "translate(280,40)")
		.text("Avg. Low:")
		.classed("a-label", true);
	this.append("text")
		.attr("id", "analytics-avg-close-data")
		.attr("transform", "translate(335,40)")
		.text(function(){
			return getAverages('low').toFixed(2);
		})
		.classed("a-data", true);

	var dailyCloseData = getDailyData('close');
	var dailyVolData = getDailyData('volume');
	
	drawDailyGraph.call(this, {
		group: dailyCloseGroup,
		data: dailyCloseData.reverse()
	});
	drawDailyGraph.call(this, {
		group: dailyVolGroup,
		data: dailyVolData.reverse()
	});
	drawArc.call(this, {
		group: arcGroup,
		change: (lastWeek[0].close - lastWeek[lastWeek.length-1].close).toFixed(2),
		changePct: functions.arithmetic().getPercentageChange(lastWeek[lastWeek.length-1].close,lastWeek[0].close)
	});
}


function drawStatic(params){
	if(params.initialise){
		this.append("g")
			.classed("axis x", true)
			.attr("transform", "translate(" + 0 + "," + height + ")")
			.call(params.axis.x);

		this.append("g")
			.classed("axis x-fake", true)
			.attr("transform", "translate(" + 0 + "," + height + ")");

		this.append("g")
			.classed("axis x-layer2", true)
			.attr("transform", "translate(" + 0 + "," + height + ")")
			.attr("width", d3.select(".axis.x").node().getBBox().width)
			.attr("height", d3.select(".axis.x").node().getBBox().height);

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
		d3.select(".buttons")
			.append("text")
			.attr("id", "confirm-change-text")
			.text("")
			.on("click", function(){
				d3.select("#confirm-change-text").text("")
				var jqxhr = $.getJSON("change-mkt-stock", {"data": JSON.stringify([d3.select("#market-btn").text(),d3.select("#stock-btn").text()])})
				  .done(function(data) {
				  	data_prices = functions.parsing().parsePrices(data);
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
					twitterapi.fetch([], tweet_urls[0], tweet_urls[1]).getLiveTweets(true);

					socket.disconnect();
					
					/*d3.selectAll(".panelstream-body")
						.data([])
						.exit()
						.remove();*/

					sentMyData = false;
					socket.connect();
				  })
				  .fail(function() {
				    console.log( "error" );
				  })
				  .always(function() {
				    console.log( "complete" );
				  });
			});

		d3.select("#market-btn").text(function(){return market;});
		d3.select("#stock-btn").text(function(){return cashtag;});

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
		var dataRange = ['current','high', 'low', 'avg', 'vol'];
		for(var i=0; i<dataRange.length; i++){
			var txt = dataRange[i];
			marketData.append("text")
						.classed("market market-"+dataRange[i],true)
						.attr("transform", "translate("+(65*i)+",0)");
		}

		var marketLabels = d3.select("#chart")
							.append("g")
							.attr("transform", "translate("+width/9+",75)")
							.classed("m-labels", true);

		var labelRange = ['C', 'H', 'L', 'A', 'V'];
		for(var i=0; i<labelRange.length; i++){
			var txt = labelRange[i];
			marketLabels.append("text")
						.classed("market-labels market-"+labelRange[i],true)
						.attr("transform", "translate("+(65*i)+",0)")
						.text(txt);
		}
		d3.select("#chart")
			.append("text")
			.classed("lastupdated", true)
			.attr("transform", "translate("+width/1.21+",25)")
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
		return d == "close" || d=="average";
	});
	var legendData = d3.keys(params.data_prices[0]).filter(function(d){
		return d == "close" || d=="average";
	});
	legendData.push("last value");
	legendData.push("tweets");
	
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
			.attr("fill", "url(#areaGradient)")
			.classed("area",true);

	context.selectAll(".area")
			.data([params.data_prices])
			.enter()
				.append("path")
				.attr("clip-path", "url(#clip)")
				.attr("fill", "url(#areaGradient)")
				.classed("area",true)

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
		.data(legendData)
			.enter()
			.append("g")
			.attr("class", function(d){
				return "_"+d;
			})
			.classed("legend", true)
			.attr("transform", "translate(5,10)");

	this.selectAll(".legend")
		.append("line")
		.attr("x1", width+10).attr("x2", width+30) 
		.attr("y1", function(d,i){
			if(d=="last value") return (i*24)-1;
			if(d=="tweets") return (i*24)-4;
			return i*24;
		}).attr("y2", function(d,i){
			if(d=="last value") return (i*24)-1;
			if(d=="tweets") return (i*24)-4;
			return (i*24)+1;
		});

  	this.selectAll(".legend")
  		.append("text")
		.attr("x", width+38)
		.attr("y", function(d,i){
			return (i*22)+6;
		})
		.text(function(d){
			return d.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
		});

	var overlay = focus.append("rect")
		      .attr("class", "overlay")
		      .attr("width", width)
		      .attr("height", height)
		      .attr("opacity", "0")
		      .on("mouseover", function(){ 
		      	lineTrackC.style("display", null); 
		      	lineTrackA.style("display", null);
			  	d3.selectAll(".hover-rect-group-x").style("display", null);
			  	d3.selectAll(".hover-rect-group-y").style("display", null);
		      })
			  .on("mouseout", function() { 
			  	d3.select("#panel-placeholder-text").text("No tweets available");
			  	d3.select("#panel-change-percentage-text").text("");
			  	d3.select("#panel-change-value-text").text("");
			  	hoverLineX.style("opacity", 1e-6); 
			  	hoverLineY.style("opacity", 1e-6); 
			  	d3.selectAll(".market-labels").style("opacity", 0);
			  	d3.selectAll(".market").style("opacity", 0);
			  	lineTrackC.style("display", "none");
			  	lineTrackA.style("display", "none");
			  	d3.selectAll(".hover-rect-group-x").style("display", "none");
			  	d3.selectAll(".hover-rect-group-y").style("display", "none");
			  })
			  .on("mousemove", functions.chart().mousemove);

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
		.style("stroke", function(d,i){return "#0065fc";});

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

	prices.forEach(function(price){		
		var g = self.selectAll("g."+price);
		var ctx = context.selectAll("g."+price);

		var arr = params.data_prices.map(function(d){
			return {
				key: price,
				timestamp: d.timestamp,
				volume: d.volume,
				value: d[price]
			};
		});

		// enter()
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

	context.selectAll(".area")
		.attr("d", function(d){
			return areaCtx(d);
		});

	// exit
	this.selectAll(".area")
		.data([params.data_prices])
		.exit()
		.remove();

	context.selectAll(".area")
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

	focus.append("g").classed("daterange-group", true).attr("transform", "translate("+(width-119)+",0)");

	var dateRange = ['1d','1w', '1m', '3m', '6m', '1y']
	for (var i = 0, l = dateRange.length; i < l; i ++) {
		var txt = dateRange[i];
		d3.select(".daterange-group")
				.append('text')
				.attr('class', 'daterange-select')
				.text(txt)
				.attr('transform', 'translate('+(20 * i)+', -10)')
				.on('click', function(d) { functions.chart().rangeClip(this.textContent); });
	}
	drawXAxis.call(this, params);
	drawTechIndicators.call(this, params);
	drawDashboard.call(analytics,params);
}
setTimeout(function(){
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
},1000);

var panelHeader = d3.select("#bs-right-div")
	.append("div")
	.attr("class", "panel-header")
	.attr("height", 40)
	.classed("panel-header", true);

panelHeader.append("img")
				.attr("id", "panel-header-img")
				.attr("width", 15)
				.attr("height", 15)
				.attr("src", tweet_urls[2]);

panelHeader.append("text")
			.attr("id", "panel-header-text")
			.text("Tweets that have made an impact");

var panelChange = d3.select("#bs-right-div")
	.append("div")
	.attr("class", "panel-change-panel")
	.attr("height", 40)
	.classed("panel-change-panel", true);

d3.select(".panel-change-panel").append("svg").classed("panel-change-panel-svg", true).attr("height", 50).attr("width", 450);
var pChangeGrp = d3.select(".panel-change-panel-svg").append("g").classed("panel-change-panel-group", true);

pChangeGrp.append("text")
			.attr("id", "panel-placeholder-text")
			.attr("transform", "translate(200,35)")
			.text("No tweets available");
pChangeGrp.append("text")
			.attr("id", "panel-change-percentage-text")
			.attr("transform", "translate(150,35)")
			.attr("opacity", 0);

pChangeGrp.append("text")
			.attr("id", "panel-change-value-text")
			.attr("transform", "translate(280,35)")
			.attr("opacity", 0);

var panelStreamHeader = d3.select("#bs-left-div")
	.append("div")
	.attr("class", "panelstream-header")
	.attr("height", 40)
	.classed("panelstream-header", true);


panelStreamHeader.append("img")
				.attr("id", "panelstream-header-img")
				.attr("width", 15)
				.attr("height", 15)
				.attr("left", "50px")
				.attr("src", tweet_urls[3]);

panelStreamHeader.append("text")
	.attr("id", "panelstream-header-text")
	.text("What are people saying? (Live Feed)");

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

var lastGet = 0;
var lastRemove = 0;

$(".overlay").hover(function(){}, function(){
	var clearPanel = setInterval(function(){
		var tweet_list = []
		d3.selectAll(".panel-body")
			.data(tweet_list)
			.exit()
			.remove();
		},100);
	setTimeout(function(){clearInterval(clearPanel);},1000);
	d3.select("#panel-placeholder-text").text("No tweets available");
  	d3.select("#panel-change-percentage-text").text("");
  	d3.select("#panel-change-value-text").text("");
});
$("#bs-left-div").hover(function(){
	var clearPanel = setInterval(function(){
		var tweet_list = []
		d3.selectAll(".panel-body")
			.data(tweet_list)
			.exit()
			.remove();
		},100);
	setTimeout(function(){clearInterval(clearPanel);},1000);
	d3.select("#panel-placeholder-text").text("No tweets available");
  	d3.select("#panel-change-percentage-text").text("");
  	d3.select("#panel-change-value-text").text("");
}, function(){});