window.onload = function() {
  // draw flight volume graph
  fetch('data/flightVolume/final_flight_data_concatted_sorted.json')
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      drawFlightsGraph(data);
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

var stringencyViz;
var drawStringencyGraph = function(data)
{
  // console.log("trying to draw stringency graph !!!!!!!!");

};
