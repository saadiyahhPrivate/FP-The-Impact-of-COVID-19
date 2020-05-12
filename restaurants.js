d3.json("data/us_schooling/states-10m.json").then(function(states) {
	d3.csv('data/restaurants/restaurant-performance.csv').then(function(data) {
		states = topojson.feature(states, states.objects.states).features

		// US state-level data only
		data = data.filter(d => d.country === 'United States' && d.region_type === 'states');

		// parse string to int values
		data = data.map(d => {
			d.date = d3.timeParse('%Y-%m-%d')(d.date);
			d.percent_yoy_change = parseInt(d.percent_yoy_change)
			return d;
		})

		// nest data by country
		data = d3.nest()
			.key(d => d.region)
			.entries(data);

		buildMap(data, states);
	})
	
})

function buildMap(data, states) {
	// dimensions
	var width = 850,
		height = 600;
	var margin = {
		top: 15,
		right: 20,
		bottom: 50,
		left: 40
	}
	var titleHeight = 50,
		legendHeight = 50,
		legendWidth = width / 2;

	var stateGraphWidth = 250,
		stateGraphHeight = 250;

	var interval = 500;
	var index = new Date(2020, 1, 18);
	var parseTime = d3.timeParse('%Y-%m-%d');
	var formatTime = d3.timeFormat('%m/%d/%Y');


	// define axis range
	var xScale = d3.scaleTime()
		.domain([new Date(2020, 1, 18), new Date(2020, 3, 5)])
		.range([0, stateGraphWidth]);
	var colorScale = d3.scaleSequential(d3.interpolateRdBu)
		.domain([100, -100])
	// var colorScale = d3.scaleSequential(d3.interpolateTurbo)
	// 	.domain([-120, 120])
	// var colorScale = d3.scaleSequential(d3.interpolateViridis)
	// 	.domain([-140, 100])
	var stateYScale = d3.scaleLinear()
		.domain([100, -100])
		.range([0, stateGraphHeight])
	var pathMap = d3.line()
			.x(d => xScale(d.date))
			.y(d => stateYScale(d.percent_yoy_change));


	var projection = d3.geoAlbersUsa();
	var path = d3.geoPath()
		.projection(projection);

	var svg = d3.select('#restaurants-viz-container').append('div')
		.attr('id', 'restaurants-viz')
		.append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)

	var titleBox = svg.append('rect')
		.attr('width', width)
		.attr('height', titleHeight)
		.style('fill', 'none')

	var title = svg.append('text')
		.attr('text-anchor', 'middle')
		.attr('alignment-baseline', 'middle')
		.attr('x', width/2)
		.attr('y', titleHeight/2)
		.style('font-size', '20px')
		.text(formatTime(index));

	var defs = svg.append('defs');

	var linearGradient = defs.append('linearGradient')
		.attr('id', 'linear-gradient')
		.attr('x1', '0%')
		.attr('y1', '0%')
		.attr('x2', '100%')
		.attr('y2', '0%');

	//Set the color for the start (0%)
	linearGradient.append('stop')
		.attr('offset', '0%')
		.attr('stop-color', colorScale(-100));

	linearGradient.append('stop')
		.attr('offset', '25%')
		.attr('stop-color', colorScale(-50));

	linearGradient.append('stop')
		.attr('offset', '50%')
		.attr('stop-color', colorScale(0));

	linearGradient.append('stop')
		.attr('offset', '75%')
		.attr('stop-color', colorScale(50));

	//Set the color for the end (100%)
	linearGradient.append('stop')
		.attr('offset', '100%')
		.attr('stop-color', colorScale(100));

	var legend = svg.append('rect')
		.attr('id', 'legend-bar')
		.attr('width', width/2)
		.attr('height', legendHeight/2)
		.attr('transform', 'translate('+ width/4 + ', ' + legendHeight + ')')
		.style('fill', 'url(#linear-gradient)');

	svg.append('text')
		.attr('id', 'legend-0')
		.attr('text-anchor', 'middle')
		.attr('x', width/4)
		.attr('y', titleHeight + legendHeight)
		.attr('dy', -10)
		.attr('fill', colorScale(-100))
		.style('font-size', '12px')
		.text('-100% traffic compared to last year today')

	svg.append('text')
		.attr('id', 'legend-100')
		.attr('text-anchor', 'middle')
		.attr('x', width*3/4)
		.attr('y', titleHeight + legendHeight)
		.attr('dy', -10)
		.attr('fill', colorScale(100))
		.style('font-size', '12px')
		.text('+100% traffic compared to last year today')

	var map = svg.append('g')
			.attr('transform', 'translate(0,' + (titleHeight + legendHeight) + ')')

	// add tooltip for state-level graph
	var tooltip = d3.select('#restaurants-viz-container').append('div')
		.attr('id', 'state-viz')
		.style('opacity', 0);


	


	// stateGraph.selectAll('path')
	// 	.data()
	// 	.enter()
	// 	.append('path')
	// 	.attr('fill', 'none')
	// 	.attr('stroke', 'blue')
	// 	.attr('stroke-width', 1)
	// 	.attr('d', d => pathMap(d.values))

	// var data = [];
	// var states = [];
	function buildStateGraph(d) {
		// clear svg
		clearStateGraph();
		var stateGraph = tooltip.append('svg')
				.attr('class', 'state-graph')
				.attr('width', stateGraphWidth + margin.left + margin.right)
				.attr('height', height + margin.top + margin.bottom)
				.append('g')
				.attr('transform', 'translate(' + margin.left + ',' + (titleHeight + legendHeight) + ')');

		// var state = mapToData(d);

		if (mapToData(d)) {
			stateGraph.append('text')
				.attr('class', 'state-name')
				.attr('font-size', '12px')
				.text(mapToData(d).key)
				.attr('text-anchor', 'middle')
				.attr('x', stateGraphWidth/2)

			// add axes
			stateGraph.append('g')
				.attr('class', 'x-axis')
				.attr('transform', 'translate(0,' + stateGraphHeight + ')')
				.call(d3.axisBottom(xScale))

			stateGraph.append('g')
				.attr('class', 'y-axis')
				.call(d3.axisLeft(stateYScale))

			// draw graph
			stateGraph.append('path')
				.data([mapToData(d)])
				// .enter()
				// .append('path')
				.attr('fill', 'none')
				.attr('stroke', 'black')
				.attr('stroke-width', 1)
				.attr('d', pathMap(mapToData(d).values))

		} else {
			stateGraph.append('text')
				.attr('font-size', '12px')
				.attr('font-color', 'lightgray')
				.text('No data for ' + d.properties.name)
		}
	}

	function clearStateGraph() {
		d3.selectAll('.state-graph').remove()
	}

	function mapToData(entry) {
		// given a state path, finds the corresponding entry in the restaurant data
		// returns nothing if state not found
		if (d3.values(data).map(d => d.key).includes(entry.properties.name)) {
			return data.filter(d => d.key == entry.properties.name)[0]
		}
		return false
	}

	function update() {
		if (xScale(index) > stateGraphWidth) {
			reset();
			setTimeout(() => {timer = setInterval(update, interval)}, 1000);
		} else {
			title.text(formatTime(index));

			// update us map
			map.selectAll('.state')
				.transition().duration(200)
				.style('fill', function(entry) {
					if (!mapToData(entry)) {return 'lightgray'};
					var ent = mapToData(entry).values.filter(d => (d.date.getMonth() === index.getMonth() && d.date.getDate() === index.getDate()))[0]
					return colorScale(ent.percent_yoy_change)
				})

			//update state map
			// d3.select('#tooltip-graph')


			// increment day
			index.setDate(index.getDate() + 1)
		}

	}

	function mouseover(d) {

		// map.selectAll('.state').classed('active', false)
		
		

		tooltip.style('opacity', 1)
			// .style('left', (d3.event.pageX) + 'px')
			// .style('top', (d3.event.pageY + 25) + 'px');

		buildStateGraph(d);

	}

	function mouseout(d) {
		// d3.select(d).classed('active', false)

		// clearStateGraph()
		tooltip.style('opacity', 0);
	}

	function reset() {
		console.log('reset')
		clearInterval(timer);
		index = new Date(2020, 1, 18);
		title.text(formatTime(index));
		map.selectAll('.state')
			.transition().duration(200)
			.style('fill', d => {
				return (mapToData(d) ? colorScale(0) : 'lightgray')
			})
	}

	// add US map
	map.selectAll('.state')
		.data(states)
		.enter()
		.append('path')
		.attr('class', 'state')
		.attr('d', path)
		.attr('id', function(d) {return d.properties.name})
		.style('fill', d => {
			return (mapToData(d) ? 'white' : 'lightgray')
		})
		// .classed('active', d => mapToData(d))
		.classed('active', false)
		.on('mouseover', d => mouseover(d))
		.on('mouseout', d => mouseout(d))



	// play map viz
	timer = setInterval(update, interval);

}

