var formatDateIntoYear = d3.timeFormat("%Y");
var formatDate = d3.timeFormat("%b %e, %Y");
var parseDate = d3.timeParse("%m/%d/%Y");
var date = d3.timeParse("%m/%d/%Y");
var formatYear = d3.timeFormat("%Y");
var formatMonth = d3.timeFormat("%m");
var formatDay = d3.timeFormat("%d");
var formatMonthandYear = d3.timeFormat("%m/%y");
var formatMonthandDay = d3.timeFormat("%m/%d%")

d3.queue()
    .defer(d3.json, "data/alex/states-10m.json")
    .defer(d3.csv, "data/alex/coronavirus-school-closures-state-levelv4.csv")
    .await(ready)

var startDate = new Date("03/15/2020"),
    endDate = new Date("03/24/2020"),
    total_days = (endDate.getTime() - startDate.getTime())/(1000*3600*24),
    day_val = width/total_days;

var margin = {top:50, right:50, bottom:0, left:50},
    width = 960 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var state_svg = d3.select("#map.mainpage").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom); 

var moving = false;
var currentValue = 0;
var targetValue = width;

var playButton = d3.select("#play-button");

var x = d3.scaleTime()
    .domain([startDate, endDate])
    .range([0, targetValue])
    .clamp(true);

var xAxisGenerator = d3.axisBottom(x).tickFormat(function (d,i) {return formatMonthandDay(d)});
var Axis = state_svg.append("g").call(xAxisGenerator).attr("transform", "translate(" + margin.left + "," + height/9.5 + ")");

var slider = state_svg.append("g")
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

slider.on("input", function input() {
    update();
});
var handle = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);

var label = slider.append("text")  
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .text(formatMonthandDay(startDate))
    .attr("transform", "translate(0," + (-25) + ")")

var projection = d3.geoAlbersUsa();

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
            .style('fill', 'grey')//.StateClosureStartDate});
            .attr("transform", "translate(0," + (100) + ")");
        
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
        //console.log(closures)
    });
}

function update(h) {
    // update position of handle on slider //
    handle.attr("cx", x(h));
    label
        .attr("x", x(h))
        .text(formatDate(h));

    var slider_year = formatYear(h),
        slider_month = formatMonth(h),
        slider_day = formatDay(h);
    //d3.select("#slider").text("3/"+slider_day+"/20");
    //d3.select("#slider").property("value", slider_day);

    //console.log("3/"+slider_day+"/20")
    console.log(slider_day)
    state_svg.selectAll(".state")
        .style('fill', function(d) {
            var state_day = document.getElementById(d.properties.name).getAttribute("day");
            if(state_day <= slider_day) {
                return 'red';
            } else {
                return 'grey';
            }
        })
}
update(x.invert(0));