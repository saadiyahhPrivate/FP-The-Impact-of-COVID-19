// d3.csv('data/alex/coronavirus-school-closures-state-level-cleaned.csv').then(function(data) {
// console.log(data);
// })

//var states_data = d3.json("data/alex/states-10m.json");
//var closures_data = d3.csv('data/alex/coronavirus-school-closures-state-levelv4.csv');

d3.queue()
    .defer(d3.json, "data/alex/states-10m.json")
    .defer(d3.csv, "data/alex/coronavirus-school-closures-state-levelv4.csv")
    .await(ready)

//Width and height of map
var width = 960;
var height = 600;

var state_svg = d3.select("#map.mainpage").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.select("#slider")
    .text("test")
    .on("input", function input() {
        update();
    });

var projection = d3.geoAlbersUsa()
    .translate([width/2, height/2])
    .scale(800);

var path = d3.geoPath()
    .projection(projection);

function ready(error, data, closures) {
    //console.log(data)

    var states_dictionary = {};
    for (var s in closures) {
        states_dictionary[closures[s].State] = s
    };
    //console.log(states_dictionary)

    var states = topojson.feature(data, data.objects.states).features
    //console.log(states)

    state_svg.selectAll(".state")
        .data(states)
        .enter().append("path")
        .attr("class", "state")
        .attr("d", path)
        .attr("id", function(d) {return d.properties.name})
        .attr("date", function(d) {return closures[states_dictionary[d.properties.name]]["StateClosureStartDate"]})
        .attr("day", function(d) {return closures[states_dictionary[d.properties.name]]["StateClosureStartDay"]})
        .style('fill', 'grey');//.StateClosureStartDate});
    
    //console.log(closures)
}

function update(){
    
    var slider_day = document.getElementById("slider").value;
    //d3.select("#slider").text("3/"+slider_day+"/20");
    //d3.select("#slider").property("value", slider_day);

    //console.log("3/"+slider_day+"/20")
    state_svg.selectAll(".state")
        .style('fill', function(d) {
            var state_day = document.getElementById(d.properties.name).getAttribute("day");
            if(state_day <= slider_day) {
                return 'red';
            } else {
                return 'grey';
            }
        });
}

update();