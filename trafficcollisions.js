// traffic collisions
function buildVis6(data, collisions) {
	var formatDate = d3.timeFormat("%b %e, %Y");
	var date = d3.timeParse("%m/%d/%Y");
	var formatYear = d3.timeFormat("%Y");
	var formatMonth = d3.timeFormat("%m");
	var formatDay = d3.timeFormat("%d");
	var formatMonthandYear = d3.timeFormat("%m/%y");

	var startDate = new Date("11/02/2019"),
		endDate = new Date("05/02/2020"),
		secondDate = new Date("11/03/2019")
		total_days = (endDate.getTime() - startDate.getTime())/(1000*3600*24),
		day_val = width/total_days;

	var margin = {top:50, right:50, bottom:0, left:50},
		width = 450 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;

	var traffic_svg = d3.select("#traffic-collisions-vis").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom); 

	var line_svg = d3.select("#traffic-collisions-vis").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform",
			  "translate(" + margin.left + "," + margin.top + ")"); 

	line_svg.append("text")             
			.attr("transform",
					"translate(" + (width/2) + " ," + 
								   (height) +")")
			.style("text-anchor", "middle")
			.text("Date");

	line_svg.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 0 - margin.left)
			.attr("x",0 - (height / 2))
			.attr("dy", "1em")
			.style("text-anchor", "middle")
			.text("# of Traffic Collisions in LA County");  

	////////// slider //////////

	var moving = false;
	var currentValue = 0;
	var targetValue = width;


	var playButton = d3.select("#play-button");

	var x = d3.scaleTime()
		.domain([startDate, endDate])
		.range([0, targetValue])
		.clamp(true);

	var xAxisGenerator = d3.axisBottom(x).tickFormat(function (d,i) {return formatMonthandYear(d)});
	var Axis = traffic_svg.append("g").call(xAxisGenerator).attr("transform", "translate(" + margin.left + "," + height/9.5 + ")");

	// line graph work //
	var line_x = d3.scaleTime().range([0, targetValue]).domain([startDate, endDate])

	var line_y = d3.scaleLinear().range([height - margin.top, 0]).domain([0, 220]);

	var y_line_axis = line_svg.append("g")
		.attr("class", "y_axis")
		.call(d3.axisLeft(line_y))


	var x_line_axis = line_svg.append("g")
		.attr("class", "x_axis")
		.attr("transform", "translate(0," + (height-50) + ")")
		.call(d3.axisBottom(line_x))

	// end line graph work // 

	var slider = traffic_svg.append("g")
		.attr("class", "slider")
		.attr("transform", "translate(" + margin.left + "," + height/10 + ")");

		slider.append("line")
		.attr("class", "track")
		.attr("x1", x.range()[0])
		.attr("x2", x.range()[1])
			.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
		.attr("class", "track-inset")
			.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
		.attr("class", "track-overlay")
		.call(d3.drag()
			.on("start.interrupt", function() { slider.interrupt(); })
			.on("start drag", function() {
			  currentValue = d3.event.x;
			  update(x.invert(currentValue)); 
			})
		);

	var handle = slider.insert("circle", ".track-overlay")
		.attr("class", "handle")
		.attr("r", 9);

	var label = slider.append("text")  
		.attr("class", "label")
		.attr("text-anchor", "middle")
		.text(formatDate(startDate))
		.attr("transform", "translate(0," + (-25) + ")")

	var collision_nums = [];
	var first_pass = true;

	////////// plot //////////

	var projection = d3.geoAlbersUsa();

	var path = d3.geoPath()
		.projection(projection);

	var counties = topojson.feature(data, data.objects.counties).features,
		LA_county = counties.filter(function (d) {return d.properties.name === "Los Angeles" ;})[0];

	projection.scale(1)
		.translate([0, 0]);
 
	var b = path.bounds(LA_county);
	var s = .75 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / (height-50));
	var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height+100 - s * (b[1][1] + b[0][1])) / 2];
 
	projection.scale(s)
		.translate(t);
	
	traffic_svg.append("path")
		.datum(LA_county)
		//.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		.attr("class", "county")
		.attr("d", path)
		.attr('id', 'land');


	var collisions2019nest;
	var collisions2019 = collisions.filter(function(d) {
		var lat_long = eval(d.Location);
		return (lat_long[0] != 0 && lat_long[1] != 0)
	});
	
	collisions2019nest = d3.nest().key(function(d) {return formatYear(date(d["Date Occurred"]))})
		.key(function(d) {return formatMonth(date(d["Date Occurred"]))})
		.key(function(d) {return formatDay(date(d["Date Occurred"]))})
		.object(collisions2019);

	playButton.on("click", function() {
		var button = d3.select(this);
		if (button.text() == "Pause") {
			moving = false;
			clearInterval(timer);
			button.text("Play");
		} else {
			moving = true;
			timer = setInterval(step, 200);
			button.text("Pause");
		}
		console.log("Slider moving: " + moving);
 	})

	function step() {
		updateTraffic(x.invert(currentValue));
		currentValue = currentValue + (targetValue/total_days); // step 1 day at a time
		if (currentValue > targetValue) {
			moving = false;
			currentValue = 0;
			clearInterval(timer);
			//timer = 0;
			playButton.text("Play");
		}
	  }



	function updateTraffic(h) {
		// update position of handle on slider //
		handle.attr("cx", x(h));
		label
		  .attr("x", x(h))
		  .text(formatDate(h));

		// update collision points on the map //
		var slider_year = formatYear(h),
		slider_month = formatMonth(h),
		slider_day = formatDay(h);

		var all_locations = traffic_svg.selectAll(".collision").remove();

		var locations = traffic_svg.selectAll(".collision")
			.data(collisions2019nest[slider_year][slider_month][slider_day]);

		// var del_line = line_svg.selectAll(".line").remove();
		// var del_x = line_svg.selectAll(".x_axis").remove();

		collision_nums.push({"date": h, "num": locations.enter().size()})

		// var line_x = d3.scaleTime().range([0, targetValue]);

		// if (first_pass) {
		//     line_x.domain([startDate, secondDate]);
		//     first_pass = false;
		// }
		// else {line_x.domain(d3.extent(collision_nums, function(d) { return d.date; }));}


		var valueline = d3.line()
		.x(function(d) { return line_x(d.date); })
		.y(function(d) { return line_y(d.num); });

		// var x_line_axis = line_svg.append("g")
		//     .attr("class", "x_axis")
		//     .attr("transform", "translate(0," + (height-50) + ")")
		//     .call(d3.axisBottom(line_x))


		line_svg.append("path")
		.data([collision_nums])
		.attr("class", "line")
		.attr("fill", "none")
		.attr("stroke", "orange")
		.attr("stroke-width", 1)
		.attr("d", valueline);

		locations.enter().append("circle")
				.attr("class", "collision")
				.attr("transform", function(d) {
					var lat_long = eval(d.Location);
					return "translate(" + projection([lat_long[1], lat_long[0]]) + ")";})
				.style("fill", "orange")
				.style("opacity", 0.4)
				.attr("r", 5.5)
				// .transition()
				//     .duration(100)
				//     .attr("r", 4)
				// .transition()
				//     .attr("r", 2)
	}

}

