
d3.queue()
    .defer(d3.json, "data/alex/counties-10m.json")
    .defer(d3.csv, "data/alex/LA_Traffic_Collision_Data_from_2010_to_Presentv2.csv")
    .await(ready)

var width = 960;
var height = 600;

var moving = false;
var currentValue = 0;
var targetValue = 15;
var playButton = d3.select("#play-button");

var traffic_svg = d3.select("#map.mainpage").append("svg")
    .attr("width", width)
    .attr("height", height);

var projection = d3.geoAlbersUsa();

var path = d3.geoPath()
    .projection(projection);

function ready(error, data, collisions) {
    var counties = topojson.feature(data, data.objects.counties).features,
    LA_county = counties.filter(function (d) {return d.properties.name === "Los Angeles" ;})[0];

    projection.scale(1)
        .translate([0, 0]);
 
    var b = path.bounds(LA_county);
    var s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
    var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
 
    projection.scale(s)
        .translate(t);
    
    traffic_svg.append("path")
        .datum(LA_county)
        .attr("class", "county")
        .attr("d", path)
        .attr('id', 'land');
    
    console.log("Done with Map");

    d3.select("#trafslider")
    .on("input", function input() {
        update();
    });

    console.log("Done with Slider")

    var date = d3.timeParse("%m/%d/%Y");
    var formatYear = d3.timeFormat("%Y");
    var formatMonth = d3.timeFormat("%m");
    var formatDay = d3.timeFormat("%d");

    var collisions2019 = collisions.filter(function (d) {
         var lat_long = eval(d.Location);
         return (formatYear(date(d["Date Occurred"])) >= 2019 && lat_long[0] != 0 && lat_long[1] != 0)});
    
    var collisions2019nest = d3.nest().key(function(d) {return formatYear(date(d["Date Occurred"]))})
        .key(function(d) {return formatMonth(date(d["Date Occurred"]))})
        //.key(function(d) {return formatDay(date(d["Date Occurred"]))})
        .object(collisions2019); 

    //var collisions2019sorted = collisions2019.sort(function (x, y) {return d3.ascending(x["Date Occurred"], y["Date Occurred"]) || d3.ascending(x["Time Occurred"], y["Time Occurred"])});
    //console.log(collisions2019sorted)
    //console.log(collisions2019nest[2019]["01"])

    var years = ["2019", "2020"];
    var months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

    // traffic_svg.selectAll(".collision")
    //         .data(collisions2019)
    //         .enter().append("circle")
    //         .attr("class", "collision")
    //         .attr("r", 2)
    //         .attr("transform", function(d) {
    //             var lat_long = eval(d.Location);
    //             //console.log(d.Location);
    //             //var b = projection([lat_long[1], lat_long[0]]);
    //             //if (!b) {console.log(lat_long)};
    //             return "translate(" + projection([lat_long[1], lat_long[0]]) + ")";})
    //         .style("fill", "blue")
    //         .style("opacity", 0);

    // for (var i=0; i < years.length; i++) {
    //     for (var j=0; j < months.length; j++) {
    //         traffic_svg.selectAll(".collision")
    //         .data(collisions2019nest[years[i]][months[j]])
    //         .enter().append("circle")
    //         .attr("class", "collision")
    //         .attr("r", 2)
    //         .attr("transform", function(d) {
    //             var lat_long = eval(d.Location);
    //             //console.log(d.Location);
    //             //var b = projection([lat_long[1], lat_long[0]]);
    //             //if (!b) {console.log(lat_long)};
    //             return "translate(" + projection([lat_long[1], lat_long[0]]) + ")";})
    //         .style("fill", "blue")
    //         .style("opacity", 0);
    //         //console.log(i, j);
    //     }
    // }

function update(){
    var slider_dates = [["01", "2019"], ["02", "2019"], ["03", "2019"], ["04", "2019"], ["05", "2019"],
["06", "2019"], ["07", "2019"], ["08", "2019"], ["09", "2019"], ["10", "2019"], ["11", "2019"],
["12", "2019"], ["01", "2020"], ["02", "2020"], ["03", "2020"], ["04", "2020"]]
    var slider_month = slider_dates[document.getElementById("trafslider").value][0];
    var slider_year = slider_dates[document.getElementById("trafslider").value][1];
    //d3.select("#slider").text("3/"+slider_day+"/20");
    //d3.select("#slider").property("value", slider_day);

    //console.log("3/"+slider_day+"/20")
    // traffic_svg.selectAll(".collision")
    //     .data(collisions2019)
    //     .style("opacity", 0);

    //console.log(collisions2019nest[slider_year][slider_month]);
    var locations = traffic_svg.selectAll(".collision")
        .data(collisions2019nest[slider_year][slider_month]);

    locations.enter().append("circle")
            .attr("class", "collision")
            .attr("r", 2)
            .attr("transform", function(d) {
                var lat_long = eval(d.Location);
                //console.log(d.Location);
                //var b = projection([lat_long[1], lat_long[0]]);
                //if (!b) {console.log(lat_long)};
                return "translate(" + projection([lat_long[1], lat_long[0]]) + ")";})
            .style("fill", "orange")
            .style("opacity", 0.5)
    
    locations.exit().remove();
    // traffic_svg.selectAll(".collision")
    //     .data(collisions2019nest[slider_year][slider_month])
    //     .transition()
    //         .delay(500)
    //         .style("opacity", 1)
    //     .transition()
    //         .delay(500)
    //         .style("opacity", 0);
        //.style("opacity", 1)
        //.style("fill", "red");

    console.log(slider_year, slider_month);
        // function(d) {
        //     var state_date = document.getElementById(d.properties.name).getAttribute("day");
        //     if(state_date <= slider_date) {
        //         return 1;
        //     } else {
        //         return 0;
        //     }
        // });
}

function step() {
    currentValue = currentValue + 1
    var usersec = document.getElementById('trafslider');
    var td = usersec.getElementsByTagName('value')[0];
    td.innerHTML = currentValue;
    update();
    if (currentValue > targetValue) {
      moving = false;
      currentValue = 0;
      clearInterval(timer);
      // timer = 0;
      playButton.text("Play");
      console.log("Slider moving: " + moving);
    }
  }
    
playButton
    .on("click", function() {
    var button = d3.select(this);
    if (button.text() == "Pause") {
      moving = false;
      clearInterval(timer);
      // timer = 0;
      button.text("Play");
    } else {
      moving = true;
      timer = setInterval(step, 100);
      button.text("Pause");
    }
    console.log("Slider moving: " + moving);
  })
    update();

    // traffic_svg.selectAll(".collision")
    //     .data(collisions2019)
    //     .enter().append("circle")
    //     .attr("class", "collision")
    //     .attr("r", 2)
    //     .attr("transform", function(d) {
    //         var lat_long = eval(d.Location);
    //         console.log(d.Location);
    //         var b = projection([lat_long[1], lat_long[0]]);
    //         if (!b) {console.log(lat_long)};
    //         return "translate(" + projection([lat_long[1], lat_long[0]]) + ")";})
    //     .style("fill", "blue")
    //     .style("opacity", 0);

    // console.log("Plotted all points")

    // collisions2019sorted.forEach(function(d, i) {
    //     let set = collisions2019sorted.slice();

        
    // })
    
    // traffic_svg.selectAll(".collision")
    //     .transition() // First fade to green.
    //       .delay(1000)
    //       .style("fill", "green")
    //       .style("opacity", 0.5)
    //     .transition() // Then red.
    //       .style("fill", "red")
    //       .style("opacity", 1)
    //     .transition() // Wait one second. Then brown, and remove.
    //       .delay(1000)
    //       .style("fill", "brown")
    //       .remove();

    // function blink(i, j) {
    //     var date = d3.timeParse("%m/%d/%Y");
    //     var formatYear = d3.timeFormat("%Y");
    //     var formatMonth = d3.timeFormat("%m");
    //     var formatDay = d3.timeFormat("%d");

    //     traffic_svg.selectAll(".collision").filter(function(d)
    //     {var checkdate = date(d["Date Occurred"]);
    //     console.log("checkcheckcheck" +i+j);
    //     //console.log(checkdate);
    //     //console.log(formatYear(checkdate) == i && formatMonth(checkdate) == j);
    //     var a = checkdate.getYear() == i && checkdate.getMonth() == j-1;
    //     if (a) {console.log(a);};
    //     //return formatYear(checkdate) == i && formatMonth(checkdate) == j;})
    //     return checkdate.getYear() == i && checkdate.getMonth() == j-1;})
    //         .transition()
    //             .delay(1000)
    //             .style("opacity", 1)
    //         .transition()
    //             .delay(2000)
    //             .style("opacity", 0)
    //     }
    
    // var count = 0;
    // function cycle() {
    //     for (i = 2019; i <= 2020; i++) {
    //         for (j = 1; j <= 12; j++) {
    //             console.log(count);
    //             console.log([i, j]);
    //             count++;
    //             if (count == 4){return};
    //             setTimeout(function () {
    //                 blink(i, j);
    //             }, 5000*count);
    //         }
    //     }
    }

    //cycle();
    
    //console.log(formatMonth(date(collisions2019[0]["Date Occurred"])) == 5)
        //console.log(traffic_svg.selectAll(".collision").size())
        // .attr("cx", function(d) {
        //     var lat_long = eval(d.Location)
        //     //var coords = projection([lat_long[1], lat_long[0]])
        //     //return coords[0]
        //     return lat_long[1]
        // })
        // .attr("cy", function(d) {
        //     var lat_long = eval(d.Location)
        //     //var coords = projection([lat_long[1], lat_long[0]])
        //     //return coords[1]
        //     return lat_long[0]
        // });
    //}
