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