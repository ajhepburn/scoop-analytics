var market = "NASDAQ";
var cashtag = "HMNY"
var init_brush = null;


/*setInterval(function(){ 
	googleapi.fetch().scrapePage(market, cashtag, data_prices[data_prices.length-1]);
}, 120000);*/

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
    .on("zoom", zoomed);

var svg = d3.select("#bs-center-div").append("svg")
        	.attr("id", "chart")
			.attr("width", w)
			.attr("height", h);

/*#3182bd
#6baed6
 #9ecae1
 #c6dbef*/

var areaGradient = svg.append("defs")
	.append("linearGradient")
	.attr("id","areaGradient")
	.attr("x1", "0%").attr("y1", "0%")
	.attr("x2", "0%").attr("y2", "100%");

// areaGradient.append("stop")
// 	.attr("offset", "0%")
// 	.attr("stop-color", "#3182bd")
// 	.attr("stop-opacity", 1);
// areaGradient.append("stop")
// 	.attr("offset", "25%")
// 	.attr("stop-color", "#6baed6")
// 	.attr("stop-opacity", 1);
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

var discontinuityList = collectDiscontinuities();

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

function setDiscontinuities(){
	x.discontinuityProvider(fc.discontinuityRange.apply(this,discontinuityList));
	x2.discontinuityProvider(fc.discontinuityRange.apply(this,discontinuityList));
}
setDiscontinuities();
/*var discCheck = setInterval(function(){
	if(discontinuityList.length!=0){
		x.discontinuityProvider(fc.discontinuityRange.apply(this,discontinuityList));
		x2.discontinuityProvider(fc.discontinuityRange.apply(this,discontinuityList));
		clearInterval(discCheck);
	} else console.log("Error");
},100);*/

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

function drawRects(params){
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
				return data_prices[data_prices.length-1].close.toFixed(3);
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
		 .attr("width", 40)
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

function drawBottom(params){
	function getLastWeek() {
		var lastWeek=[];
		var c = 0;
		var lastEntry = data_prices[data_prices.length-1];
		var topOfWeek = timeParser(lastEntry.timestamp).getDay();
		
		if(topOfWeek==1) {
			for(var i=data_prices.length-1; i>=0; --i){
				if(timeParser(data_prices[i].timestamp).getDay()>topOfWeek) {
					topOfWeek = timeParser(data_prices[i].timestamp).getDay();
					break;
				}
			}
		}

		for (var i=data_prices.length-1; i >= 0; --i) {
			if(timeParser(data_prices[i].timestamp).getDay()>=topOfWeek && timeParser(data_prices[i].timestamp).getDate()!=timeParser(lastEntry.timestamp).getDate()) break;
			else lastWeek.push(data_prices[i]);
		}
		return lastWeek;
	}

	function getPercentageChange(oldNumber, newNumber){
	    var decreaseValue = oldNumber - newNumber;
	    if (oldNumber>newNumber) return "+"+((decreaseValue / oldNumber) * 100).toFixed(2)+"%";
	    else if (oldNumber<newNumber) return "-"+((decreaseValue / oldNumber) * 100).toFixed(2)+"%";
	    else return ((decreaseValue / oldNumber) * 100).toFixed(2)+"%";
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
		var indexes=[];
		var result=[];
		days.forEach((val)=>{indexes.push(lastWeek.findIndex(x=>timeParser(x.timestamp).getDay() === val));});
		indexes.forEach((val)=>{
			var day = String(d3.timeFormat('%a')(timeParser(lastWeek[val].timestamp)));
			var dict = {};
			dict[day]= lastWeek[val][key];
			result.push(dict);
		});
		return result;
	}

	var color = d3.scaleOrdinal(d3.schemeCategory10).domain(d3.range(0,4));

	var dailyCloseGroup = this.append("g")
						.classed("daily-close-group", true)
						.attr("transform", "translate(20,"+marginDailyClose.bottom+")");

	var dailyVolGroup = this.append("g")
						.classed("daily-vol-group", true)
						.attr("transform", "translate(300,"+marginDailyClose.bottom+")");

	var arcGroup = this.append("g")
						.classed("arc-group", true)
						.attr("transform", "translate(650,"+(marginDailyClose.bottom+75)+")");

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
          .range([0, width/3.5])
          .padding(0.1);
		var y = d3.scaleLinear()
          .range([heightDailyClose,0])

		x.domain(params.data.map(function(d) { return Object.keys(d)[0]; }));
  		y.domain([0, d3.max(params.data, function(d) { return Object.values(d)[0]; })]).nice();

  		params.group.selectAll(".bar")
						.data(params.data)
						.enter()
							.append("rect")
							.attr("class", "bar")
							.attr("x", function(d) { return x(Object.keys(d)[0]); })
							.attr("width", x.bandwidth())
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
							.attr("x", function(d) { return x(Object.keys(d)[0])+22; })
							.attr("y", function(d) { return y(Object.values(d)[0]) + 10; })
							.text(function(d) { 
								if(params.group == dailyVolGroup) return String(Object.values(d)[0]).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
								return Object.values(d)[0]; 
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
		function colorise(key){
			if(key<0) return "#d62728";
			else return "#1f77b4";
		}

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
			.text(params.change)
			.attr("fill", function(){
				return colorise(decimalPct);
			});

		params.group.append("text")
					.attr("id", "arc-change-pct")
					.attr("transform", "translate(-39,15)")
					.text(params.changePct)
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
/*	this.append("text")
		.attr("id", "analytics-change-label")
		.attr("transform", "translate(75,20)")
		.text("Change:")
		.classed("a-label", true);
	this.append("text")
		.attr("id", "analytics-change-data")
		.attr("transform", "translate(125,20)")
		.text(function(){
			return (lastWeek[lastWeek.length-1].close - lastWeek[0].close).toFixed(2);
		})
		.attr("fill", function(){
			return fill(this.innerHTML);
		});

	this.append("text")
		.attr("id", "analytics-change-percent-label")
		.attr("transform", "translate(175,20)")
		.text("Change (%):")
		.classed("a-label", true);
	this.append("text")
		.attr("id", "analytics-change-percent-data")
		.attr("transform", "translate(245,20)")
		.text(function(){
			return (getPercentageChange(lastWeek[0].close, lastWeek[lastWeek.length-1].close));
		})
		.attr("fill", function(){
			return fill(this.innerHTML);
		});*/

	this.append("text")
		.attr("id", "analytics-volume-label")
		.attr("transform", "translate(70,20)")
		.text("Volume (Week):")
		.classed("a-label", true);
	this.append("text")
		.attr("id", "analytics-volume-data")
		.attr("transform", "translate(160,20)")
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
		.attr("transform", "translate(100,40)")
		.text("Avg. High:")
		.classed("a-label", true);
	this.append("text")
		.attr("id", "analytics-avg-low-data")
		.attr("transform", "translate(160,40)")
		.text(function(){
			return getAverages('high').toFixed(2);
		})
		.classed("a-data", true);

	this.append("text")
		.attr("id", "analytics-avg-close-label")
		.attr("transform", "translate(200,40)")
		.text("Avg. Low:")
		.classed("a-label", true);
	this.append("text")
		.attr("id", "analytics-avg-close-data")
		.attr("transform", "translate(255,40)")
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
		change: (lastWeek[lastWeek.length-1].close - lastWeek[0].close).toFixed(2),
		changePct: getPercentageChange(lastWeek[0].close, lastWeek[lastWeek.length-1].close)
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

		d3.select("#chart")
			.append("text")
			.attr("id", "chart-header-text")
			.attr("transform", "translate("+margin.left+",25)")
			.attr("fill", "#000")
			.text(function(){
				return market+":"+cashtag;
			});

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
			.classed("x axis-curr-label",true)
			.attr("transform", "translate("+width/1.87+",75)");
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
		return d == "close" || d == "high" || d == "low" || d=="average";
	});
	var legendData = d3.keys(params.data_prices[0]).filter(function(d){
		return d == "close" || d=="average";
	});
	legendData.push("last value");
	
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
/*	this.selectAll(".legend")
		.append("rect")
		.attr("x", width+20)
		.attr("y", function(d,i){
			return i*20;
		})
		.attr("width", 10)
		.attr("height", 10);*/
	this.selectAll(".legend")
		.append("line")
		.attr("x1", width+10).attr("x2", width+30) 
		.attr("y1", function(d,i){
			return i*24;
		}).attr("y2", function(d,i){
			if(d=="last value") return (i*24)-1;
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
			// return d.charAt(0).toUpperCase() + d.slice(1);
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
			  	d3.select(".x.axis-curr-label").style("opacity", 0);
			  	hoverLineX.style("opacity", 1e-6); 
			  	hoverLineY.style("opacity", 1e-6); 
			  	d3.selectAll(".market-labels").style("opacity", 0);
			  	d3.selectAll(".market").style("opacity", 0);
			  	lineTrackC.style("display", "none");
			  	lineTrackA.style("display", "none");
			  	d3.selectAll(".hover-rect-group-x").style("display", "none");
			  	d3.selectAll(".hover-rect-group-y").style("display", "none");
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

/*	this.selectAll(".legend")
		.style("fill", function(d, i){
			// return colorScale(prices.indexOf(d));
			if(d=="average") return '#ffb2b2';
			else if(d=="close") return "#0065fc";
			if(d=="last value") return "#eb4d5c";
		})*/

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
				.attr("fill", "url(#areaGradient)")
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

	focus.append("g").classed("daterange-group", true).attr("transform", "translate("+(width-119)+",0)");

	var dateRange = ['1d','1w', '1m', '3m', '6m', '1y']
	for (var i = 0, l = dateRange.length; i < l; i ++) {
		var txt = dateRange[i];
		d3.select(".daterange-group")
				.append('text')
				.attr('class', 'daterange-select')
				.text(txt)
				.attr('transform', 'translate('+(20 * i)+', -10)')
				.on('click', function(d) { rangeClip(this.textContent); });
	}
	drawXAxis.call(this, params);
	drawRects.call(this, params);
	drawBottom.call(analytics,params);
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
			.text("Tweets that made an impact");

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

	// multiFormat(timeParser(d.timestamp))
	d3.select("#hover-rect-x").attr("x", xpos-24);
	d3.select("#hover-text-x").attr("x", xpos-5).attr("y",12.5).text(d3.timeFormat('%H:%M')(x.invert(xpos)));
	d3.select("#hover-rect-y").attr("y", ypos-12);
	d3.select("#hover-text-y").attr("y", ypos).attr("x",-32).text(y.invert(ypos).toFixed(3));
	d3.select(".x.axis-curr-label")
		.style("opacity", 1)
		.text(function(){
			return d3.timeFormat('%b %d %Y, %a %H:%M')(timeParser(d.timestamp));
		});



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

function rangeClip(range) {
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

	if(exists==-1) begin = 0;
	else begin = x2(begin);

	d3.select(".brush").call(brush.move, [begin,x2(today)]);
	d3.select("#x-fake-text0").text(d3.timeFormat("%H:%M")(x.domain()[0]));
	d3.select("#x-fake-text1").text(d3.timeFormat("%H:%M")(x.domain()[1]));
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
    d3.select(".analytics").selectAll("*").remove();

    d3.selectAll("#chart-header-text").remove();
    d3.selectAll(".axis-label").remove();
    d3.selectAll(".axis-curr-label").remove();
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