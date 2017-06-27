var tempChart, lightChart, humidChart;

function update(response) {

	for (var i = 0; i < response.entries.length; i++) {

        var data = response.entries[i];

		var time = new Date(data.timestamp);
		var stamp = time.getTime();

		// Adds points to the charts using the High Charts library
		tempChart.series[0].addPoint([stamp, data.celsius], false, false);
		lightChart.series[0].addPoint([stamp, data.light], false, false);
		humidChart.series[0].addPoint([stamp, data.moisture], false, false);
	}

	// Redraw the charts each time update is called
	tempChart.redraw();
	lightChart.redraw();
	humidChart.redraw();
}

// Get the data from the API
function getData() {
	$.ajax({
		url: '/plant-data',
		success: update
	});
}

// Sets up the charts from the High Charts library
function initChart() {

	getData();

	tempChart = Highcharts.chart('temperature', {
        chart: { type: 'spline' },
        title: { text: 'Temperature' },
        xAxis: { type: 'datetime' },
        series: [{
            name: 'Celsius',
            data: []
        }]
    });

    lightChart = Highcharts.chart('light', {
        chart: { type: 'spline' },
        title: { text: 'Light' },
        xAxis: { type: 'datetime' },
        series: [{
            name: '%',
            data: []
        }]
    });

    humidChart = Highcharts.chart('humidity', {
        chart: { type: 'spline' },
        title: { text: 'Humidity' },
        xAxis: { type: 'datetime' },
        series: [{
            name: '%',
            data: []
        }]
    });
}

$(initChart);
