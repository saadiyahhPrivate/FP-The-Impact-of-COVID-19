var formatDateIntoYear = d3.timeFormat("%Y");
var formatDate = d3.timeFormat("%b %e, %Y");
var parseDate = d3.timeParse("%m/%d/%Y");
var date = d3.timeParse("%m/%d/%Y");
var formatYear = d3.timeFormat("%Y");
var formatMonth = d3.timeFormat("%m");
var formatDay = d3.timeFormat("%d");
var formatMonthandYear = d3.timeFormat("%m/%y");
var formatMonthandDay = d3.timeFormat("%m/%d%")

d3.json("data/alex/states-10m.json").then(function(d) {
    d3.csv("data/alex/coronavirus-school-closures-state-levelv4.csv").then(function(e) {
        ready(d,e);
    })
})

// d3.defer(d3.json, "data/alex/states-10m.json")
//     .defer(d3.csv, "data/alex/coronavirus-school-closures-state-levelv4.csv")
//     .await(ready)

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
    .text(formatDate(startDate))
    .attr("transform", "translate(0," + (-25) + ")")

var projection = d3.geoAlbersUsa();

var path = d3.geoPath()
    .projection(projection);

function ready(data, closures) {
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
                    timer = setInterval(step, 1000);
                    button.text("Pause");
            }

            console.log("Slider moving: " + moving);
        //console.log(closures)
    });
}

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

// deliberately kept separate
var schoolRestrictionsViz, schoolRestrictionKeys, unfilteredSchoolData;
var schoolRestrictionsTimeout;
var drawSchoolRestrictions = function(data) {
  unfilteredSchoolData = data;
  schoolRestrictionKeys = Object.keys(unfilteredSchoolData);
  console.log(schoolRestrictionKeys);
  document.getElementById("schoolRestrictionRange").setAttribute("min", 0);
  document.getElementById("schoolRestrictionRange").setAttribute("max", schoolRestrictionKeys.length - 2);

  schoolRestrictionsViz = new d3plus.Geomap()
    .topojson("js/countries-50m.json")
    .select("#worldSchoolRestrictions")
    .colorScale("S1_School closing")
    .colorScaleConfig({
      color: ["white", "lightblue", "navy"],
      axisConfig: {
        labels: ['0.0', '1.0', '2.0'],
        ticks: ['0.0', '1.0', '2.0'],
        tickFormat: function(d) {
          if (d == '0.0') { return "not applicable"}
          else if (d == '1.0') {return 'Recommended'}
          else {return 'Required';}
        },
      }})
    // .width(600)
    .height(600)
    .groupBy("id")  // the column in the data
    // .loadingMessage("") // clear the annoying laoding message,
    // // but seems to be causing something funky to happen with zooming
    // .loadingMessage("")
    .tooltipConfig({
          title: function(d) {
            return d["CountryName"];
          },
          tbody: [
            ["School Closure: ", function(d) {
              if (d["S1_School closing"] < 1) {
                return "N/A";
              } else if (d["S1_School closing"] < 2) {
                return "Recommended";
              } else {
                return "Required";
              }}],
            ["date:", function(d) { return d["Date"] }],
          ]
        })
    .topojsonId("id");

  var stepForwardRepeatedly = function() {
    stepForward();

    if (parseInt(document.getElementById("schoolRestrictionRange").value)
        < parseInt(document.getElementById("schoolRestrictionRange").max)) {
      // noticed that smaller timeouts seem to cause the map to go wonky :/
      schoolRestrictionsTimeout = setTimeout(stepForwardRepeatedly, 500);
    } else {
      document.getElementById("SchoolRestrictionDateStepPlay").innerHTML = "Play";
      clearTimeout(schoolRestrictionsTimeout);
      schoolRestrictionsTimeout = false;
    }
  };

  // TODO: nothing interesting happens until Jan 26th, so data was filtered out for after then
  var stepForward = function() {
    var doc_el = document.getElementById("schoolRestrictionRange");
    var curr_val = parseInt(doc_el.value);
    var next_val = (curr_val + 1) % (schoolRestrictionKeys.length);
    doc_el.value = next_val;
    doc_el.onchange();  // explicit call
  };

  document.getElementById("SchoolRestrictionDateStepPlay").onclick = function() {
    if (schoolRestrictionsTimeout) {
      document.getElementById("SchoolRestrictionDateStepPlay").innerHTML = "Play";
      clearTimeout(schoolRestrictionsTimeout);
      schoolRestrictionsTimeout = false;
    } else {
      document.getElementById("SchoolRestrictionDateStepPlay").innerHTML = "Pause";
      stepForwardRepeatedly();
    }
  };

  document.getElementById("SchoolRestrictionDateStepForward").onclick = function() {
    stepForward();
  };

  document.getElementById("SchoolRestrictionDateStepBack").onclick = function() {
    var doc_el = document.getElementById("schoolRestrictionRange");
    var curr_val = parseInt(doc_el.value);
    var next_val = (curr_val - 1) % (schoolRestrictionKeys.length);
    doc_el.value = next_val;
    doc_el.onchange();  // explicit call
  };

  document.getElementById("schoolRestrictionRange").onchange = function() {
    var curr_val = document.getElementById("schoolRestrictionRange").value;
    var date_str = schoolRestrictionKeys[curr_val].toString();
    var my_date = moment(date_str, 'YYYYMMDD');
    document.getElementById("SchoolRestrictionDateLabel").innerHTML = my_date.format("MMMM Do YYYY, dddd");
    schoolRestrictionsViz.data(unfilteredSchoolData[schoolRestrictionKeys[curr_val]]).render();
    if (date_str == "20200320") {
      console.log(unfilteredSchoolData[schoolRestrictionKeys[curr_val]]);
    }
  };

  document.getElementById("schoolRestrictionRange").onchange();  // explicit call
};

window.onload = function() {
  // draw per country/time school restrictions map
  fetch('data/RestrictionsPerCountry/final_school_restrictions.json')
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      drawSchoolRestrictions(data);
    }).catch((error) => {
      console.error('Error:', error);
  });
};
