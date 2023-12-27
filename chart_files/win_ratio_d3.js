// Asynchronously load the data and create the chart
fetch('chart_files/win_ratio_data.json')
    .then(response => response.json())
    .then(data => {
        createWinRatioChart(data);
    })
    .catch(error => console.error('Error loading win ratio data:', error));

function createWinRatioChart(allPlayersData) {
    // Parse the date / time
    var parseDate = d3.timeParse("%Y-%m-%d");

    // Define a color scale
    var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Check if allPlayersData is an object
    if (typeof allPlayersData !== 'object' || allPlayersData === null) {
        console.error('allPlayersData is not an object');
        return;
    }

    // Convert the object to an array of objects for D3 processing
    var playersDataArray = Object.entries(allPlayersData).map(([name, values], index) => {
        return {
            name,
            values: values.map(d => ({ ...d, date: parseDate(d.date) })),
            color: colorScale(index) // Assign a color to each player
        };
    });

    // Set the dimensions of the canvas / graph
    var margin = { top: 30, right: 50, bottom: 30, left: 50 },
        width = 960 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    // Set the ranges
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // Define the line
    var valueline = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.winRatio); });

    // Adds the SVG canvas
    var svg = d3.select("#AAA")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Scale the range of the data
    x.domain(d3.extent(playersDataArray.flatMap(d => d.values), function(d) { return d.date; }));
    y.domain([0, d3.max(playersDataArray.flatMap(d => d.values), function(d) { return d.winRatio; })]);

    // Add the valueline path for each player
    playersDataArray.forEach(function(playerData) {
        svg.append("path")
            .data([playerData.values])
            .attr("class", "line")
            .style("stroke", playerData.color)
            .attr("d", valueline);
    });

    // Add the X Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add the Y Axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Create a legend and position it below the chart
    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(0," + (height + margin.bottom) + ")");

    var legendItem = legend.selectAll(".legend-item")
        .data(playersDataArray)
        .enter().append("g")
        .attr("class", "legend-item");

    // Track the width of the legend to center it later
    var legendWidth = 0;

    // Add colored rectangles and text for each legend item
    legendItem.append("rect")
        .attr("x", function(d, i) { return i * 100; }) // Horizontal spacing of 100px between items
        .attr("y", 0)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d) { return d.color; });

    legendItem.append("text")
        .attr("x", function(d, i) { return i * 100 + 24; }) // Align text with its corresponding rectangle
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function(d) { return d.name; })
        .each(function() {
            legendWidth += this.getBBox().width + 100; // Update total width
        });

    // Center the legend by adjusting its horizontal position
    legend.attr("transform", "translate(" + (width / 2 - legendWidth / 2) + "," + (height + margin.bottom) + ")");


}