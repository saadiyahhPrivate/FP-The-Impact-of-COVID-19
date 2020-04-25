window.onload = function() {
  // draw flight volume graph
  fetch('data/FlightVolume/final_flight_data_concatted_sorted.json')
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      drawFlightsGraph(data);
    }).catch((error) => {
      console.error('Error:', error);
  });

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

  // draw stringency maps
  fetch('data/RestrictionsPerCountry/final_restrictions_data.json')
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      drawStringencyGraph(data);
    }).catch((error) => {
      console.error('Error:', error);
  });
};

var flightViz;
var drawFlightsGraph = function(jsondata) {
  flightViz = new d3plus.LinePlot()
  .select("#flightVolume")
  .data(jsondata)
  .x("DateTime")
  .xConfig({labels: ['2020-01-19', '2020-01-26', '2020-02-02', '2020-02-09',
                     '2020-02-16','2020-02-23','2020-03-01','2020-03-08',
                     '2020-03-15',,'2020-03-22','2020-03-29','2020-04-05',
                     '2020-04-12','2020-04-19', '2020-04-26']}) // which ticks to show labels for
  .y("Number of flights")
  .yConfig({domain: [0, 200000]})
  .groupBy("type")
  .legend(false)
  .tooltipConfig({
        title: function(d) {
          return d["type"];
        },
        tbody: [
          ["Date:", function(d) { return d["DateTime"] }],
          ["# Flights :", function(d) { return d["Number of flights"] }]
        ]
      })
  .annotations( // text labels instead of a legend
    {
      data: [
        {x: "2020-04-05", y: 80000, width: 100, height: 25, type:"all flights", color:"red"},
        {x: "2020-04-05", y: 42000, width: 100, height: 25, type:"commercial only", color:"blue"}
      ],
      fill: "#fff",
      fillOpacity: 0,
      label: function(d) {return d.type },
      labelConfig: {
        textAnchor: "middle",
        verticalAlign: "middle",
        color: function(d) {return d.color},
      },
      shape: "Rect"
    })
  .height(400)
  // .width(600)
  .render();
};


// deliberately kept separate
var schoolRestrictionsViz, schoolRestrictionKeys, unfilteredSchoolData;
var schoolRestrictionsTimeout;
var drawSchoolRestrictions = function(data) {
  unfilteredSchoolData = data;
  schoolRestrictionKeys = Object.keys(unfilteredSchoolData);
  document.getElementById("schoolRestrictionRange").setAttribute("min", 0);
  document.getElementById("schoolRestrictionRange").setAttribute("max", schoolRestrictionKeys.length - 2);

  console.log("restriction lengths " + schoolRestrictionKeys.length);
  console.log("restriction keys " + schoolRestrictionKeys);

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
    console.log("******* step forward called");
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
  };

  document.getElementById("schoolRestrictionRange").onchange();  // explicit call
};

var stringencyViz;
var drawStringencyGraph = function(data)
{
  console.log("trying to draw stringency graph !!!!!!!!");

};
