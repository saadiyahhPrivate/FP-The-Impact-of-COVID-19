// TODO dimensions
var width = 100,
	height = 100;
var margin = {
	top: 15,
	right: 5,
	bottom: 50,
	left: 50
}
var bisect = d3.bisector(function(d) {
      return d.date;
    }).left;

var parseTime = d3.timeParse('%Y-%m-%d');
var categories = ['grocery_pharmacy', 'parks', 'transit_stations', 'retail_recreation', 'residential', 'workplaces'];

// define axis range
// var xScale = d3.scaleTime()
// 	.domain([new Date(2020, 2, 29), new Date(2020, 3, 11)])
// 	.range([0, width]);
var xScale = d3.scaleOrdinal()
	.domain(['zeroIndex', '2020-03-29', '2020-04-05', '2020-04-11'])
	.range([0, width/3, 2*width/3, width]);
var yScale = d3.scaleLinear()
	.domain([-100, 100])
	.range([height, 0]);
var colorScale = d3.scaleOrdinal()
	.domain(categories)
	.range(['brown', 'green', 'orange', 'red', 'blue', 'gray'])


var pathMap = function(cat) {
	return d3.line()
		.x(d => xScale(d.date))
		.y(d => yScale(d[cat]));
}
var zeroIndex = function(country) {
	var zid = {};
	zid.date = 'zeroIndex';
	zid.country = country;
	zid.region = 'Total';
	categories.forEach(cat => {
		zid[cat] = 0;
	})
	return zid;
}



d3.csv('data/google_mobility/regional-mobility.csv').then(function(data) {

	// TEMP limit to top 10 countries
	const countryToShow = ['United States of America', 'Spain', 'Italy', 'France', 'Germany', 
							'United Kingdom', 'Turkey', 'Brazil', 'Belgium', 'Canada']
	data = data.filter(d => countryToShow.includes(d.country));
	////////

	// aggregate entries only
	data = data.filter(d => d.region === 'Total');

	// parse string to int values
	data = data.map(d => {
		// console.log(d.date)
		// d.date = parseTime(d.date);
		// console.log(d.date)
		// console.log(xScale(d.date))

		categories.forEach(cat => {d[cat] = parseInt(d[cat])})
		console.log(d);
		return d;
	})

	countryToShow.forEach(country => {
		data.push(zeroIndex(country))
	})

	// nest data by country
	var nested = d3.nest()
		.key(d => d.country)
		// .key(d => d.date)
		// .sortValues()
		.entries(data);

	// console.log(data);
	console.log(nested);


	var svg = d3.select('#mobility-viz-1')
				.selectAll('svg')
				.data(nested)
				.enter()
				.append('svg')
					.attr('width', width + margin.left + margin.right)
					.attr('height', height + margin.top + margin.bottom)
				.append('g')
					.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	// add axes
	svg.append('g')
		.attr('transform', 'translate(0,' + height + ')')
		.call(d3.axisBottom(xScale).ticks(3));
	svg.append('g')
		.call(d3.axisLeft(yScale));



	
	categories.forEach(cat => {
		svg.append('g')
			.attr('class', cat)
			.append('path')
			.attr('fill', 'none')
			.attr('stroke', colorScale(cat))
			.attr('stroke-width', 2)
			.attr('d', d => pathMap(cat)(d.values))

	})

})



// TEST new data

const newCategories = [
		'grocery_and_pharmacy_percent_change_from_baseline',
		'parks_percent_change_from_baseline',
		'transit_stations_percent_change_from_baseline',
		'retail_and_recreation_percent_change_from_baseline',
		'workplaces_percent_change_from_baseline',
		'residential_percent_change_from_baseline']

// define axis range
var newxScale = d3.scaleTime()
	.domain([new Date(2020, 1, 15), new Date(2020, 3, 11)])
	.range([0, width]);
var newyScale = d3.scaleLinear()
	.domain([-100, 100])
	.range([height, 0]);
var newcolorScale = d3.scaleOrdinal()
	.domain(newCategories)
	.range(['brown', 'green', 'orange', 'red', 'blue', 'gray'])
var newpathMap = function(cat) {
	return d3.line()
		.x(d => newxScale(d.date))
		.y(d => newyScale(d[cat]));
}

d3.csv('data/google_mobility/Global_Mobility_Report.csv').then(function(data) {

	// TEMP limit to top 10 countries
	const countryToShow = ['United States', 'Spain', 'Italy', 'France', 'Germany', 
							'United Kingdom', 'Turkey', 'Brazil', 'Belgium', 'Canada']
	data = data.filter(d => countryToShow.includes(d.country_region));
	////////

	// aggregate entries only
	data = data.filter(d => d.sub_region_1 === '');

	// parse string to int values
	data = data.map(d => {
		// console.log(d.date)
		d.date = parseTime(d.date);
		// console.log(d.date)
		// console.log(newxScale(d.date))

		newCategories.forEach(cat => {d[cat] = parseInt(d[cat])})
		// console.log(d);
		return d;
	})

	// countryToShow.forEach(country => {
	// 	data.push(zeroIndex(country))
	// })

	// nest data by country
	var nested = d3.nest()
		.key(d => d.country_region)
		// .key(d => d.date)
		// .sortValues()
		.entries(data);

	console.log(nested);


	var svg = d3.select('#mobility-viz-2')
				.selectAll('svg')
				.data(nested)
				.enter()
				.append('svg')
					.attr('width', width + margin.left + margin.right)
					.attr('height', height + margin.top + margin.bottom)
				.append('g')
					.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	var circle = svg.append('circle')
		.attr('r', 2.2)
		.attr('opacity', 0)
		.style('pointer-events', 'none');
	var caption = svg.append('text')
		.attr('class', 'caption')
		.attr('text-anchor', 'middle')
		.style('pointer-events', 'none')
		.attr('dy', -8)
		.attr('font-size', '10px');

	//TODO
	var mouseover = function() {
		circle.attr('opacity', 1)
		return mousemove.call(this)
	}
	var mousemove = function() {
		var date = newxScale.invert(d3.mouse(this)[0]);
		var idx = 0;
		circle
			.attr('cx', newxScale(date))
			.attr('cy', d => {
				idx = bisect(d.values, date, 0, d.values.length-1)
				return newyScale(d.values[idx]['residential_percent_change_from_baseline'])
			})
		caption
			.attr('x', newxScale(date))
			.attr('y', d => newyScale(d.values[idx]['residential_percent_change_from_baseline']))
			.text(d => d.values[idx]['residential_percent_change_from_baseline'])
	}
	var mouseout = function() {
		circle.attr('opacity', 0)
		caption.text('')
	}

	// add interaction
	svg.append('rect')
		.attr('class', 'hoverbox')
		.attr('width', width + margin.right)
		.attr('height', height)
		.style('pointer-events', 'all')
		.style('fill', 'none')
		.on('mouseover', mouseover)
		.on('mousemove', mousemove)
		.on('mouseout', mouseout);

	// add axes
	svg.append('g')
		.attr('transform', 'translate(0,' + height + ')')
		.call(d3.axisBottom(newxScale).ticks(2));
	svg.append('g')
		.call(d3.axisLeft(newyScale).ticks(5).tickFormat(x => x>0 ? '+'+x+'%' : x+'%'));

	// additional info lines
	svg.append('g')
		.attr('class', 'info-pandemic')
		.append('line')
			.style('stroke', 'black')
			.attr('x1', newxScale(new Date(2020, 2, 11)))
			.attr('x2', newxScale(new Date(2020, 2, 11)))
			.attr('y1', 0)
			.attr('y2', height)
	
	// draw line graphs
	newCategories.forEach(cat => {
		svg.append('g')
			.attr('class', cat)
			.append('path')
			.attr('fill', 'none')
			.attr('stroke', newcolorScale(cat))
			.attr('stroke-width', 1.5)
			.attr('d', d => newpathMap(cat)(d.values))
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
	d3.select('#mobility-viz-2')
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
			.text(d => d)

})


// todo possible additions
// choose top 10 by number of confirmed cases / total population / etc
// "why don't I see china on this map?" button to explain where the data is coming from
// hover to see exact numbers
// info lines for local 







// define axis range
var xxScale = d3.scaleTime()
	.domain([new Date(2020, 1, 18), new Date(2020, 3, 5)])
	.range([0, width]);
var yyScale = d3.scaleLinear()
	.domain([-100, 100])
	.range([height, 0]);
// var ccolorScale = d3.scaleOrdinal()
// 	.domain(newCategories)
// 	.range(['brown', 'green', 'orange', 'red', 'blue', 'gray'])
var ppathMap = d3.line()
		.x(d => xxScale(d.date))
		.y(d => yyScale(d.percent_yoy_change));


d3.csv('data/restaurants/restaurant-performance.csv').then(function(data) {

	// country-level data only
	data = data.filter(d => d.region_type === 'countries');

	// parse string to int values
	data = data.map(d => {
		d.date = parseTime(d.date);
		d.percent_yoy_change = parseInt(d.percent_yoy_change)
		return d;
	})

	// nest data by country
	var nested = d3.nest()
		.key(d => d.region)
		.entries(data);

	console.log('here',nested);


	var svg = d3.select('#restaurants-viz')
				.selectAll('svg')
				.data(nested)
				.enter()
				.append('svg')
					.attr('width', width + margin.left + margin.right)
					.attr('height', height + margin.top + margin.bottom)
				.append('g')
					.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	// add axes
	svg.append('g')
		.attr('transform', 'translate(0,' + height + ')')
		.call(d3.axisBottom(xxScale).ticks(3));
	svg.append('g')
		.call(d3.axisLeft(yyScale));

	svg.append('g')
		.append('path')
		.attr('fill', 'none')
		.attr('stroke', 'gray')
		.attr('stroke-width', 2)
		.attr('d', d => ppathMap(d.values))

	svg.append('text')
		.attr('class', 'country')
		.attr('text-anchor', 'middle')
		.attr('x', width/2)
		.attr('y', height)
		.attr('dy', margin.bottom/2 + 10)
		.style('font-size', '12px')
		.text(d => d.key)

})






