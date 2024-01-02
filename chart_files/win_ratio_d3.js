// Data Fetching Section
// ---------------------
// Asynchronously load the win ratio data and create the chart
fetch('chart_files/win_ratio_data.json')
    .then(response => response.json())
    .then(data => {
        createWinRatioChart(data);  // Call to function to create the win ratio chart
    })
    .catch(error => console.error('Error loading win ratio data:', error));

// Chart Creation Function Section
// -------------------------------
function createWinRatioChart(allPlayersData) {
    // Margins and Dimensions Configuration
    // -------------------------------------
    var margin = { top: 30, right: 50, bottom: 30, left: 50 };
    var fullWidth = 800; // This will be the max-width
    var fullHeight = 300; // Set the height
    var width = fullWidth - margin.left - margin.right;
    var height = fullHeight - margin.top - margin.bottom;

    // colors
    // ------------------------
    var colorScale = d3.scaleOrdinal()
    .domain(["Player1", "Player2", "Player3", "Player4", "Player5", 
            "Player6", "Player7", "Player8", "Player9", "Player10", 
            "Player11", "Player12", "Player13", "Player14", "Player15"]) // Adapt to your data
    .range([
        "#E63946", // Bright Red
        "#F4A261", // Sandy Brown
        "#2A9D8F", // Teal
        "#264653", // Charcoal
        "#006D77", // Dark Cyan
        "#EF476F", // Orange Red
        "#07BEB8", // Bright Cyan
        "#FFD166", // Yellow Orange
        "#118AB2", // Blue
        "#073B4C", // Dark Blue Green
        "#F77F00", // Orange
        "#FCBF49", // Mustard Yellow
        "#D62828", // Red Orange
        "#8AC926", // Lime Green
        "#9B5DE5", // Lavender
        // Add more colors as needed
    ]);


    // Data Parsing and Scaling
    // ------------------------
    var parseDate = d3.timeParse("%Y-%m-%d");
    var playersDataArray = Object.entries(allPlayersData).map(([name, values], index) => ({
        name,
        values: values.map(d => ({ ...d, date: parseDate(d.date) })),
        color: colorScale(index)
    }));
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
    var xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%b"));

    
    
    // Line Definition for Win Ratio Chart
    // -----------------------------------
    var valueline = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.winRatio));

    // SVG and Canvas Setup
    // --------------------
    var svg_winRatio = d3.select("#AAA") // Ensure this ID matches your HTML
        .append("svg")
        .attr('viewBox', `0 0 ${fullWidth} ${fullHeight}`)
        .attr('preserveAspectRatio', 'xMinYMin')
        .classed("svg-content-responsive", true)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Data Scaling for Chart
    // ----------------------
    x.domain(d3.extent(playersDataArray.flatMap(d => d.values), d => d.date));
    y.domain([0, d3.max(playersDataArray.flatMap(d => d.values), d => d.winRatio) * 1.1]);



    // Axes Setup
    // ----------
    svg_winRatio.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

        
    // Add the Y Axis and modify the domain line
var yAxis = svg_winRatio.append("g")
.call(d3.axisLeft(y).tickSize(0))
.selectAll(".tick line")
.attr("stroke", "lightgrey")
.attr("x2", width);

// Modify Y Axis tick labels
svg_winRatio.selectAll(".tick text")
    .attr("class", "y-tick-label")  // Adding the CSS class


// Modify the domain line after the axis is added
svg_winRatio.selectAll(".domain").remove()


    // Chart Lines Creation
    // --------------------
    // Add the valueline path for each player with glow effect
    playersDataArray.forEach(function(playerData) {
        svg_winRatio.append("path")
            .data([playerData.values])
            .attr("class", "line")
            .style("stroke", playerData.color)
            .style("filter", "url(#glow)") // Apply glow filter
            .attr("d", valueline);
    });


    // Add a glow effect
    var defs = svg_winRatio.append('defs');

    var filter = defs.append('filter')
        .attr('id', 'glow');
    filter.append('feGaussianBlur')
        .attr('stdDeviation', '5')
        .attr('result', 'coloredBlur');
    var feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode')
        .attr('in', 'coloredBlur');
    feMerge.append('feMergeNode')
        .attr('in', 'SourceGraphic');

    // Legend Creation
    // ---------------
    var legend = svg_winRatio.append("g")
        .attr("class", "legend");

    // Legend Items Setup
    // ------------------
    var legendItem = legend.selectAll(".legend-item")
        .data(playersDataArray)
        .enter().append("g")
        .attr("class", "legend-item");

    // Legend Layout Calculation
    // -------------------------
    var legendXOffset = 0;
    var legendYOffset = 0;
    var lineHeight = 12; // Height of each legend line

    // Append rectangles and text for each legend item and adjust their positions
    legendItem.each(function(d, i) {
        var item = d3.select(this);
        var textWidth = item.append("text")
            .attr("x", legendXOffset + 12)
            .attr("y", legendYOffset + 4)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(d.name)
            .node().getBBox().width;

        item.insert("rect", "text")
            .attr("x", legendXOffset)
            .attr("y", legendYOffset)
            .attr("width", 8)
            .attr("height", 8)
            .style("fill", d.color);

        legendXOffset += textWidth + 32; // Rectangle width + text width + spacing

        if (legendXOffset > width) {
            // Move to next line if exceeding the chart width
            legendXOffset = 0;
            legendYOffset += lineHeight;
            item.attr("transform", "translate(" + legendXOffset + "," + legendYOffset + ")");
            legendXOffset += textWidth + 44; // Reset offset for the next line
        }
    });

    // Final Legend Positioning
    // ------------------------
    legend.attr("transform", "translate(0," + (height + margin.bottom) + ")");
    // END LEGEND 
}
