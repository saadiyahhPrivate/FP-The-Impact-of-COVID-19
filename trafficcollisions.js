var formatDateIntoYear = d3.timeFormat("%Y");
var formatDate = d3.timeFormat("%b %e, %Y");
var parseDate = d3.timeParse("%m/%d/%Y");
var date = d3.timeParse("%m/%d/%Y");
var formatYear = d3.timeFormat("%Y");
var formatMonth = d3.timeFormat("%m");
var formatDay = d3.timeFormat("%d");
var formatMonthandYear = d3.timeFormat("%m/%y")

var startDate = new Date("01/01/2019"),
    endDate = new Date("04/11/2020"),
    total_days = (endDate.getTime() - startDate.getTime())/(1000*3600*24),
    day_val = width/total_days;

var margin = {top:50, right:50, bottom:0, left:50},
    width = 960 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var traffic_svg = d3.select("#traffic-collisions-viz").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom); 

// var line_svg = d3.select("#map.mainpage").append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom); 

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

//xAxisGenerator.tickValues([0, 10, 20, 25]).;

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

// slider.insert("g", ".track-overlay")
//     .attr("class", "ticks")
//     .attr("transform", "translate(0," + 18 + ")")
//   .selectAll("text")
//     .data(x.ticks(10))
//     .enter()
//     .append("text")
//     .attr("x", x)
//     .attr("y", 10)
//     .attr("text-anchor", "middle")
//     .text(function(d) { return formatMonthandYear(d); });

var handle = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);

var label = slider.append("text")  
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .text(formatDate(startDate))
    .attr("transform", "translate(0," + (-25) + ")")

////////// plot //////////

var projection = d3.geoAlbersUsa();

var path = d3.geoPath()
    .projection(projection);

d3.json("data/alex/counties-10m.json").then(function(data) {
    var counties = topojson.feature(data, data.objects.counties).features,
    LA_county = counties.filter(function (d) {return d.properties.name === "Los Angeles" ;})[0];

    //console.log(LA_county);
    projection.scale(1)
        .translate([0, 0]);
 
    var b = path.bounds(LA_county);
    var s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / (height-50));
    var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height+100 - s * (b[1][1] + b[0][1])) / 2];
 
    projection.scale(s)
        .translate(t);
    
    traffic_svg.append("path")
        .datum(LA_county)
        //.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "county")
        .attr("d", path)
        .attr('id', 'land');
    
    console.log("Done with Map");
});

var collisions2019nest;

d3.csv("data/alex/LA_Traffic_Collision_Data_from_2010_to_Presentv2.csv").then(function(collisions) {
        var collisions2019 = collisions.filter(function(d) {
        var lat_long = eval(d.Location);
        return (formatYear(date(d["Date Occurred"])) >= 2019 && lat_long[0] != 0 && lat_long[1] != 0)});
    
    collisions2019nest = d3.nest().key(function(d) {return formatYear(date(d["Date Occurred"]))})
       .key(function(d) {return formatMonth(date(d["Date Occurred"]))})
       .key(function(d) {return formatDay(date(d["Date Occurred"]))})
       .object(collisions2019);

//update(x.invert(currentValue));

    playButton.on("click", function() {
    var button = d3.select(this);
    if (button.text() == "Pause") {
            moving = false;
            clearInterval(timer);
            button.text("Play");
    }
    else {
            moving = true;
            timer = setInterval(step, 200);
            button.text("Pause");
    }

    console.log("Slider moving: " + moving);
 })
});

function step() {
    update(x.invert(currentValue));
    currentValue = currentValue + (targetValue/total_days); // step 1 day at a time
    if (currentValue > targetValue) {
        moving = false;
        currentValue = 0;
        clearInterval(timer);
        //timer = 0;
        playButton.text("Play");
        console.log("Slider moving: " + moving);
    }
  }

function update(h) {
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
    
    locations.enter().append("circle")
            .attr("class", "collision")
            .attr("transform", function(d) {
                var lat_long = eval(d.Location);
                return "translate(" + projection([lat_long[1], lat_long[0]]) + ")";})
            .style("fill", "orange")
            .style("opacity", 0.5)
            .attr("r", 2)
            .transition()
                .duration(100)
                .attr("r", 4)
            .transition()
                .attr("r", 2)
}