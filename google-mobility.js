d3.csv('data/google_mobility/Global_Mobility_Report.csv').then(function(data) {

	// dimensions
	var width = 400,
		height = 150;
	var margin = {
		top: 20,
		right: 180,
		bottom: 50,
		left: 50
	}
	var captionHeight = 100;

	var parseTime = d3.timeParse('%Y-%m-%d');
	var formatTime = d3.timeFormat('%m/%d/%Y');
	var bisect = d3.bisector(d => d.date).left;

	const categories = [
			'grocery_and_pharmacy_percent_change_from_baseline',
			'parks_percent_change_from_baseline',
			'transit_stations_percent_change_from_baseline',
			'retail_and_recreation_percent_change_from_baseline',
			'workplaces_percent_change_from_baseline',
			'residential_percent_change_from_baseline']

	// var zeroIndex = function(country) {
	// 	var zid = {};
	// 	zid.date = new Date(2020, 1, 15);
	// 	zid.country = country;
	// 	zid.region = 'Total';
	// 	categories.forEach(cat => {
	// 		zid[cat] = 0;
	// 	})
	// 	return zid;
	// }

	// define axis range
	var xScale = d3.scaleTime()
		.domain([new Date(2020, 1, 15), new Date(2020, 3, 11)])
		.range([0, width]);
	var yScale = d3.scaleLinear()
		.domain([-100, 100])
		.range([height, 0]);
	var colorScale = d3.scaleOrdinal()
		.domain(categories)
		.range(['brown', 'green', 'orange', 'blue', 'gray', 'red'])
	var textScale = d3.scaleOrdinal()
		.domain(categories)
		.range(['Groceries & Pharmacies', 'Parks', 'Public Transit', 'Retail & Recreation', 'Workplaces', 'Residential'])
	var pathMap = function(cat) {
		return d3.line()
			.x(d => xScale(d.date))
			.y(d => yScale(d[cat]));
	}

	// TEMP limit to top 10 countries
	const countryToShow = ['United States', 'Spain', 'Italy', 'France', 'Germany', 
							'United Kingdom', 'Turkey', 'Brazil', 'Belgium', 'Canada']
	data = data.filter(d => countryToShow.includes(d.country_region));
	////////

	// aggregate entries only
	data = data.filter(d => d.sub_region_1 === '');

	// parse string to int values
	data = data.map(d => {
		d.date = parseTime(d.date);
		categories.forEach(cat => {
			d[cat] = parseInt(d[cat])
		})
		return d;
	})

	// countryToShow.forEach(country => {
	// 	data.push(zeroIndex(country))
	// })

	// nest data by country
	var nested = d3.nest()
		.key(d => d.country_region)
		.entries(data);


	var svg = d3.select('#mobility-viz')
				// .append('g')
				// .attr('class', 'chartWrapper')
				.selectAll('svg')
				.data(nested)
				.enter()
				.append('svg')
					.attr('width', width + margin.left + margin.right)
					.attr('height', height + captionHeight + margin.top + margin.bottom)
				.append('g')
					.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	var cursorDate = svg.append('text')
		.attr('class', 'cursorDate')
		.attr('y', 0)
		.attr('font-size', '14px')
		.attr('text-anchor', 'middle');

	var cursorLine = svg.append('line')
		.style('stroke', 'black')
		.style('stroke-width', 1)
		// .attr('x1', xScale(new Date(2020, 2, 11)))
		// .attr('x2', xScale(new Date(2020, 2, 11)))
		.attr('y1', 0)
		.attr('y2', height)
		.attr('opacity', 0)
		.style('pointer-events', 'none');
	var cursorCaption = svg.append('g')
		.attr('class', 'captionBox')
		.attr('transform', 'translate(0,' + (height + margin.bottom) + ')')
		.append('rect')
		// .attr('class', 'captionBox')
		.attr('width', captionHeight)
		.attr('height', captionHeight)
		.attr('opacity', 0)
		// .attr('text-anchor', 'middle')
		// .style('pointer-events', 'none')
		// .attr('border', 'black');
	categories.forEach((cat,i) => {
		d3.selectAll('.captionBox').append('text')
			.attr('class', 'caption_'+cat)
			// .text(d => {
			// 	console.log(''.concat(textScale(cat),':',d.values[idx][cat]))
			// 	return ''.concat(textScale(cat),':',d.values[idx][cat])
			// })
			.attr('y', i*15)
			.attr('font-size', '10px')
			.attr('fill', colorScale(cat))
	})

	//TODO
	function mouseover() {
		cursorLine.attr('opacity', 1)
		return mousemove.call(this)
	}
	function mousemove() {
		var date = xScale.invert(d3.mouse(this)[0]);
		var idx = 0;
		cursorDate
			.attr('x', xScale(date))
			.text(formatTime(date))
		cursorLine
			.attr('x1', xScale(date))
			.attr('x2', xScale(date))
			// .attr('cy', d => {
			// 	idx = bisect(d.values, date, 0, d.values.length-1)
			// 	return yScale(d.values[idx]['residential_percent_change_from_baseline'])
			// })
		cursorCaption.attr('x', xScale(date))

		// categories.forEach((cat,i) => {
		// 	d3.select('.captionBox').append('text')
		// 		.text(d => {
		// 			console.log(''.concat(textScale(cat),':',d.values[idx][cat]))
		// 			return ''.concat(textScale(cat),':',d.values[idx][cat])
		// 		})
		// 		.attr('x', xScale(date))
		// 		.attr('y', i*20)
		// 		.attr('font-size', '10px')

		// })
		categories.forEach((cat,i) => {
			d3.selectAll('.caption_'+cat)
				.attr('x', xScale(date))
				.text(d => {
					idx = bisect(d.values, date, 0, d.values.length-1)
					return ''.concat(textScale(cat),':',d.values[idx][cat],'%')
				})
		})
		
	}
	function mouseout() {
		cursorDate.text('')
		cursorLine.attr('opacity', 0)
		d3.selectAll('.captionBox').selectAll('text').text('')
	}

	// add interaction
	svg.append('rect')
		.attr('class', 'hoverbox')
		.attr('width', width)
		.attr('height', height)
		.style('pointer-events', 'all')
		.style('fill', 'none')
		.on('mouseover', mouseover)
		.on('mousemove', mousemove)
		.on('mouseout', mouseout);

	// add axes
	svg.append('g')
		.attr('transform', 'translate(0,' + height + ')')
		.call(d3.axisBottom(xScale).ticks(2));
	svg.append('g')
		.call(d3.axisLeft(yScale).ticks(5).tickFormat(x => x>0 ? '+'+x+'%' : x+'%'));

	// additional info line
	// var info = d3.select('.chartWrapper').append('g')
	// 	.attr('class', 'info-pandemic');

	svg.append('line')
		.style('stroke', 'black')
		.style('stroke-width', 1)
		.style('stroke-dasharray', ('3, 3'))
		.attr('x1', xScale(new Date(2020, 2, 11)))
		.attr('x2', xScale(new Date(2020, 2, 11)))
		.attr('y1', 0)
		.attr('y2', height)
		.on('mouseover', function() {
			console.log('mouseover')

		})
	// info.append('text')
	// 		.attr('class', 'info-pandemic-text')
	// 		.attr('text-anchor', 'middle')
	// 		.attr('x', xScale(new Date(2020, 2, 11)) + margin.left + 10)
	// 		.attr('y', margin.top)
	// 		// .attr('dy', -5)
	// 		.style('font-size', '12px')
	// 		.text('WHO declares COVID-19 a pandemic')
	
	// draw line graphs
	categories.forEach(cat => {
		svg.append('g')
			.attr('class', cat)
			.append('path')
			.attr('fill', 'none')
			.attr('stroke', colorScale(cat))
			.attr('stroke-width', 1.5)
			.attr('d', d => pathMap(cat)(d.values))
	})

	svg.append('text')
		.attr('class', 'country')
		.attr('text-anchor', 'middle')
		.attr('x', width/2)
		.attr('y', height)
		.attr('dy', margin.bottom/2 + 10)
		.style('font-size', '12px')
		.text(d => d.key)

	// add legend
	d3.select('#mobility-viz')
		.append('svg')
		.attr('class', 'legend')
		.attr('transform', 'translate(' + 4*width + ',0)')
		.selectAll('dot')
		.data(categories)
		.enter()
		.append('circle')
			.attr('cx', 20)
			.attr('cy', (d,i) => 20+i*20)
			.attr('r', 5)
			.style('fill', d => colorScale(d))
	
	d3.select('.legend')
		.selectAll('text')
		.data(categories)
		.enter()
		.append('text')
			.attr('x', 40)
			.attr('y', (d,i) => 20+i*20)
			.attr('text-anchor', 'left')
			.style('fill', d => colorScale(d))
			.style('font-size', '12px')
			.style('alignment-baseline', 'middle')
			.text(d => textScale(d))

})


// todo possible additions
// choose top 10 by number of confirmed cases / total population / etc
// "why don't I see china on this map?" button to explain where the data is coming from
// finish hover tooltip
// info lines for major events 
// hover over category for explanation, click to "activate" and show on map
