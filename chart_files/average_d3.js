// Asynchronously load the average data and create the chart
fetch('chart_files/average_data.json')
    .then(response => response.json())
    .then(data => {
        createAverageChart(data);
    })
    .catch(error => console.error('Error loading average data:', error));

function createAverageChart(allPlayersData) {

     // Define margins and dimensions for the graph
     var margin = { top: 30, right: 50, bottom: 30, left: 50 };
     var fullWidth = 800; // This will be the max-width
     var fullHeight = 300; // Set the height
     var width = fullWidth - margin.left - margin.right;
     var height = fullHeight - margin.top - margin.bottom;


    // Parse the date / time
    var parseDate = d3.timeParse("%Y-%m-%d");

    // Define a color scale
    var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Convert the object to an array of objects for D3 processing
    var playersDataArray = Object.entries(allPlayersData).map(([name, values], index) => {
        return {
            name,
            values: values.map(d => ({ ...d, date: parseDate(d.date) })),
            color: colorScale(index)
        };
    });

    // Set the ranges
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // Format the date for the x-axis to show month abbreviations
    var xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%b"));

    // Define the line for the average chart
    var valueline = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.average); }); // Use 'average' instead of 'winRatio'

    // Create the SVG element and set the viewBox for responsiveness
    var svg_average = d3.select("#BBB")
    .append("svg")
    .attr('viewBox', `0 0 ${fullWidth} ${fullHeight}`)
    .attr('preserveAspectRatio', 'xMinYMin')
    .classed("svg-content-responsive", true)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Scale the range of the data
    x.domain(d3.extent(playersDataArray.flatMap(d => d.values), function(d) { return d.date; }));
    // Adjust y-domain to add extra space at the top (10% more)
    y.domain([0, d3.max(playersDataArray.flatMap(d => d.values), function(d) { return d.average; }) * 1.1]);

    // Add the valueline path for each player
    playersDataArray.forEach(function(playerData) {
        svg_average.append("path")
            .data([playerData.values])
            .attr("class", "line")
            .style("stroke", playerData.color)
            .attr("d", valueline);
    });


    // Add the X Axis with monthly labels
    svg_average.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

    // Add the Y Axis and remove the vertical line
    var yAxis = svg_average.append("g")
    .call(d3.axisLeft(y).tickSize(0))  // Removes the outer tick line
    .selectAll(".tick line")
    .attr("stroke", "lightgrey")  // Makes the tick lines light grey
    .attr("x2", width);  // Extends the tick lines across the chart

    // Hide the domain line of the Y axis
    svg_average.select(".domain").remove();

    // Create a legend and position it below the chart
    var legend = svg_average.append("g")
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

