d3.csv('data/google_mobility/Global_Mobility_Report.csv').then(function(d1) {
	buildVis1(d1);
	console.log(1)
})

d3.json("data/us_schooling/states-10m.json").then(function(d2) {
	d3.csv("data/us_schooling/coronavirus-school-closures-state-level.csv").then(function(e) {
		buildVis2(d2,e);
		console.log(2)
	});
	d3.csv('data/restaurants/restaurant-performance.csv').then(function(d4) {
		buildVis4(d4, d2);
		console.log(4)
	})

})

d3.json('data/RestrictionsPerCountry/final_school_restrictions.json').then(function(d3) {
	buildVis3(d3);
	console.log(3)
})

d3.json('data/flightVolume/final_flight_data_concatted_sorted.json').then(function(d5) {
	buildVis5(d5)
	console.log(5)
})

d3.json("data/la_collisions/counties-10m.json").then(function(d6) {
	d3.csv("data/la_collisions/LA_Traffic_Collision_Data_from_Nov_2019_to_Present.csv").then(function(collisions) {
		buildVis6(d6, collisions)
		console.log(6)
	})
})

setTimeout(() => {
	d3.selectAll('.mainpage').style('display', 'block');
	d3.select('#load-status').text('')
	console.log('showing')
}, 2000)
