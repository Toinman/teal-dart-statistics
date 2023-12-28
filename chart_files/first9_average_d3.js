// Asynchronously load the first9Average data and create the chart
fetch('chart_files/first9_average_data.json')
    .then(response => response.json())
    .then(data => {
        createFirst9AverageChart(data);
    })
    .catch(error => console.error('Error loading first9Average data:', error));

function createFirst9AverageChart(allPlayersData) {
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

    // Define the line for the first9Average chart
    var valueline = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.first9Average); });

    // Create the SVG element and set the viewBox for responsiveness
    var svg_first9Average = d3.select("#dart9average") // Change the ID if necessary
        .append("svg")
        .attr('viewBox', `0 0 ${fullWidth} ${fullHeight}`)
        .attr('preserveAspectRatio', 'xMinYMin')
        .classed("svg-content-responsive", true)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Scale the range of the data
    x.domain(d3.extent(playersDataArray.flatMap(d => d.values), function(d) { return d.date; }));
    y.domain([0, d3.max(playersDataArray.flatMap(d => d.values), function(d) { return d.first9Average; }) * 1.1]);

    // Add the valueline path for each player
    playersDataArray.forEach(function(playerData) {
        svg_first9Average.append("path")
            .data([playerData.values])
            .attr("class", "line")
            .style("stroke", playerData.color)
            .attr("d", valueline);
    });

    // Add the X Axis with monthly labels
    svg_first9Average.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis and remove the vertical line
    var yAxis = svg_first9Average.append("g")
        .call(d3.axisLeft(y).tickSize(0))
        .selectAll(".tick line")
        .attr("stroke", "lightgrey")
        .attr("x2", width);
    svg_first9Average.select(".domain").remove();

     // LEGEND SECTIONS
    // Create a legend and position it initially below the chart
    var legend = svg_first9Average.append("g")
        .attr("class", "legend");

    var legendItem = legend.selectAll(".legend-item")
        .data(playersDataArray)
        .enter().append("g")
        .attr("class", "legend-item");

    var legendXOffset = 0;
    var legendYOffset = 0;
    var lineHeight = 20; // Height of each legend line

    // Append rectangles and text for each legend item and adjust their positions
    legendItem.each(function(d, i) {
        var item = d3.select(this);
        var textWidth = item.append("text")
            .attr("x", legendXOffset + 24)
            .attr("y", legendYOffset + 9)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(d.name)
            .node().getBBox().width;

        item.insert("rect", "text")
            .attr("x", legendXOffset)
            .attr("y", legendYOffset)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", d.color);

        legendXOffset += textWidth + 44; // Rectangle width + text width + spacing

        if (legendXOffset > width) {
            // Move to next line if exceeding the chart width
            legendXOffset = 0;
            legendYOffset += lineHeight;
            item.attr("transform", "translate(" + legendXOffset + "," + legendYOffset + ")");
            legendXOffset += textWidth + 44; // Reset offset for the next line
        }
    });

    // Position the legend below the chart
    legend.attr("transform", "translate(0," + (height + margin.bottom) + ")");
}
