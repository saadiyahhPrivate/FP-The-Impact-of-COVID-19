function buildVis1(data) {


	const categories = [
			'residential_percent_change_from_baseline',
			'grocery_and_pharmacy_percent_change_from_baseline',
			'parks_percent_change_from_baseline',
			'transit_stations_percent_change_from_baseline',
			'retail_and_recreation_percent_change_from_baseline',
			'workplaces_percent_change_from_baseline']

	// dimensions
	var chartWidth = 400,
		chartHeight = 100;
	var margin = {
		top: 20,
		right: 150,
		bottom: 20,
		left: 50
	}
	var captionWidth = 100;

	var sourceWidth = chartWidth, 
		sourceHeight = chartHeight;

	var parseTime = d3.timeParse('%Y-%m-%d');
	var formatTime = d3.timeFormat('%m/%d/%Y');
	var bisect = d3.bisector(d => d.date).left;

	// define axis range
	var xScale = d3.scaleTime()
		.domain([new Date(2020, 1, 15), new Date(2020, 3, 11)])
		.range([0, chartWidth]);
	var yScale = d3.scaleLinear()
		.domain([-100, 100])
		.range([chartHeight, 0]);
	var colorScale = d3.scaleOrdinal()
		.domain(categories)
		.range(['red', 'brown', 'green', 'orange', 'blue', 'gray'])
	var textScale = d3.scaleOrdinal()
		.domain(categories)
		.range(['Residential', 'Groceries & Pharmacies', 'Parks', 'Public Transit', 'Retail & Recreation', 'Workplaces'])
	var pathMap = function(cat) {
		return d3.line()
			.x(d => xScale(d.date))
			.y(d => yScale(d[cat]));
	}
	// parse string to int values
	data = data.map(d => {
		d.date = parseTime(d.date);
		categories.forEach(cat => {
			d[cat] = parseInt(d[cat])
		})
		return d;
	})

	// limit to top 5 countries
	var countryToShow = ['United States', 'United Kingdom', 'Spain', 'Italy', 'Brazil']
	data = data.filter(d => countryToShow.includes(d.country_region));

	// aggregate entries only
	data = data.filter(d => d.sub_region_1 === '');

	// countryToShow.forEach(country => {
	// 	data.push(zeroIndex(country))
	// })

	// nest data by country
	var nested = d3.nest()
		.key(d => d.country_region)
		.sortKeys((a,b) => {
			return countryToShow.indexOf(a) - countryToShow.indexOf(b)
		})
		.entries(data);
	console.log(nested)


	var svg = d3.select('#mobility-vis')
				// .append('g')
				// .attr('class', 'chartWrapper')
				.selectAll('svg')
				.data(nested)
				.enter()
				.append('svg')
					.attr('width', chartWidth + margin.left + margin.right + captionWidth)
					// .attr('height', height + captionWidth + margin.top + margin.bottom)
					.attr('height', chartHeight + margin.top + margin.bottom)
				.append('g')
					.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	var cursorDate = svg.append('g')
		.append('text')
		.attr('class', 'cursorDate')
		.attr('y', chartHeight + 12)
		.attr('font-size', '10px')
		.attr('text-anchor', 'left');

	var cursorLine = svg.append('line')
		.style('stroke', 'black')
		.style('stroke-width', 1)
		// .attr('x1', xScale(new Date(2020, 2, 11)))
		// .attr('x2', xScale(new Date(2020, 2, 11)))
		.attr('y1', 0)
		.attr('y2', chartHeight)
		.attr('opacity', 0)
		.style('pointer-events', 'none');
	var cursorCaption = svg.append('g')
		.attr('class', 'captionBox')
		// .attr('transform', 'translate(0,' + (height + margin.bottom) + ')')
		.attr('transform', 'translate(' + (chartWidth + 20) + ',' + margin.top + ')')
		.append('rect')
		// .attr('class', 'captionBox')
		.attr('width', captionWidth)
		.attr('height', chartHeight)
		.attr('opacity', 0);
	var cursorText = svg.append('text')
		.attr('class', 'cursorText')
		.attr('x', xScale(new Date(2020, 2, 11)) + 5)
		// .attr('x', width + margin.left)
		.attr('y', 15)
		.attr('font-size', '12px')
		.text('WHO declares COVID-19 a pandemic')
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
			.attr('x', 0)
			.attr('y', i*15)
			.attr('font-size', '12px')
			.attr('fill', colorScale(cat))
			.text(textScale(cat)+':')
	})

	//TODO
	function mouseover() {
		cursorLine.attr('opacity', 1)
		
		d3.selectAll('.x-axis')
		.call(d3.axisBottom(xScale).ticks(0))

		return mousemove.call(this)
	}
	function mousemove() {
		var date = xScale.invert(d3.mouse(this)[0]);
		var idx = 0;
		if (formatTime(date) === '03/11/2020') {
			cursorText.attr('opacity', 1)
		} else {
			cursorText.attr('opacity', 0)
		}
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
		// cursorCaption.attr('x', xScale(date))

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
				// .attr('x', xScale(date))
				.text(d => {
					idx = bisect(d.values, date, 0, d.values.length-1)
					return ''.concat(textScale(cat),': ',d.values[idx][cat],'%')
				})
		})

		// cursorText.attr('opacity', () => {
		// 	return (formatTime(date) === '03/11/2020' ? 1 : 0)
		// })

		// if (formatTime(date) === '03/11/2020') {
		// 	.attr('opacity', 0)
		// } else {
		// 	cursorText.text('')
		// }
		
	}
	function mouseout() {
		cursorDate.text('')
		cursorLine.attr('opacity', 0)
		cursorText.attr('opacity', 0)
		d3.selectAll('.x-axis')
		.call(d3.axisBottom(xScale).ticks(2))
		// d3.selectAll('.captionBox').selectAll('text').text(textScale(cat)+':')
	}

	// // add interaction
	// svg.append('rect')
	// 	.attr('class', 'hoverbox')
	// 	.attr('width', chartWidth)
	// 	.attr('height', chartHeight)
	// 	.style('pointer-events', 'all')
	// 	.style('fill', 'gray')
	// 	.style('opacity', 0.1)
	// 	.on('mouseover', mouseover)
	// 	.on('mousemove', mousemove)
	// 	.on('mouseout', mouseout);

	// add axes
	svg.append('g')
		.attr('class','x-axis')
		.attr('transform', 'translate(0,' + chartHeight + ')')
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
		.attr('y2', chartHeight)
		// .on('mouseover', function() {
		// 	cursorText.attr('opacity', 1)
		// })
		// .on('mouseout', function() {
		// 	cursorText.attr('opacity', 0)
		// })
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
		.attr('x', chartWidth/2)
		.attr('y', 0)
		.attr('dy', -margin.top/2)
		.style('font-size', '12px')
		.text(d => d.key)

	// add interaction
	svg.append('rect')
		.attr('class', 'hoverbox')
		.attr('width', chartWidth)
		.attr('height', chartHeight)
		.style('pointer-events', 'all')
		.style('fill', 'gray')
		.style('opacity', 0.1)
		.on('mouseover', mouseover)
		.on('mousemove', mousemove)
		.on('mouseout', mouseout);
	// add legend
	// d3.select('#mobility-vis')
	// 	.append('svg')
	// 	.attr('class', 'legend')
	// 	.attr('transform', 'translate(' + 4*width + ',0)')
	// 	.selectAll('dot')
	// 	.data(categories)
	// 	.enter()
	// 	.append('circle')
	// 		.attr('cx', 20)
	// 		.attr('cy', (d,i) => 20+i*20)
	// 		.attr('r', 5)
	// 		.style('fill', d => colorScale(d))
	
	// d3.select('.legend')
	// 	.selectAll('text')
	// 	.data(categories)
	// 	.enter()
	// 	.append('text')
	// 		.attr('x', 40)
	// 		.attr('y', (d,i) => 20+i*20)
	// 		.attr('text-anchor', 'left')
	// 		.style('fill', d => colorScale(d))
	// 		.style('font-size', '12px')
	// 		.style('alignment-baseline', 'middle')
	// 		.text(d => textScale(d))

	// data source
	var dataSource = d3.select('#mobility-vis').append('div')
		.attr('class', 'gm-data-source')
		// .attr('width', sourceWidth)
		// .attr('height', sourceHeight)
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
	
	dataSource.append('text')
		.attr('id', 'data-source-q')
		.attr('font-color', 'blue')
		.style('font-size', '10px')
		.style('cursor', 'pointer')
		.text('Why don\'t I see my country on this graph?')
		// .on('mouseover', function() {
		// 	d3.select('#data-source-q').style('font-weight', 'bold')
		// 	d3.select('#data-source').style('opacity', 1)
		// })
		// .on('mouseout', function() {
		// 	d3.select('#data-source-q').style('font-weight', 'normal')
		// 	d3.select('#data-source').style('opacity', 0)
		// })
		.on('click', function() {
			var d = d3.select(this)
			d.classed('source-on', !d.classed('source-on'))
			d.style('font-weight', function () {
				return (d.classed('source-on') ? 'bold' : 'normal')
			})
			d3.select('#data-source').style('opacity', function() {
				return (d.classed('source-on') ? 1 : 0)
			})
		})

	dataSource.append('div')
		.attr('id', 'data-source')
		.style('opacity', 0)
		.attr('width', sourceWidth)
		.attr('height', sourceHeight)
		.html('<p id="source-tag">This data was collected by Google using their Location History feature. <br/>Countries with insufficient data, including China, Iran, and Russia, do not show up in this dataset.<br/><br/> Read more at: <a href="https://www.google.com/covid19/mobility/data_documentation.html?hl=en">Google LLC "Google COVID-19 Community Mobility Reports".</a></p>')
		// .append('rect')
		// .attr('width', sourceWidth)
		// .attr('height', sourceHeight)
		// .style('display', 'none')
		// .append('text')
		// .attr('x', 0)
		// .attr('y', 30)
		// .attr('fill', 'gray')
		// .style('font-size', '10px')
		// .text('This data was collected by Google using their Location History feature. Countries with insufficient data, including China, Iran, and Russia, do not show up in this dataset.')

	// d3.select('#source-tag')
	// 	.attr('font-size', '10px')

	// dataSource.append('text')
	// 	.attr('id', 'data-source')
	// 	.attr('fill', 'black')
	// 	.style('font-size', '10px')
	// 	.text('hellooooooo')
	// 	.style('opacity', 0)
}


// todo possible additions
// choose top 10 by number of confirmed cases / total population / etc
// "why don't I see china on this map?" button to explain where the data is coming from
// finish hover tooltip
// info lines for major events 
// hover over category for explanation, click to "activate" and show on map
