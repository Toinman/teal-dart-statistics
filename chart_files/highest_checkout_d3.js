// Asynchronously load the highest checkout data and create the horizontal bar chart
fetch('chart_files/highest_checkout_data.json')
    .then(response => response.json())
    .then(data => {
        createHighestCheckoutChart(data);
    })
    .catch(error => console.error('Error loading highest checkout data:', error));

function createHighestCheckoutChart(data) {
    // Convert object to an array of objects
    var dataArray = Object.entries(data).map(([name, checkoutPoints]) => ({ name, checkoutPoints }));

    // Sort data by checkout points
    dataArray.sort((a, b) => b.checkoutPoints - a.checkoutPoints);

    // Set the dimensions and margins of the graph
    var margin = {top: 30, right: 30, bottom: 30, left: 100},
        width = 960 - margin.left - margin.right,
        height = dataArray.length * 40; // Height based on number of bars

    // Append the svg object to the body of the page
    var svg = d3.select("#DDD")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Add Y axis
    var y = d3.scaleBand()
        .range([0, height])
        .domain(dataArray.map(d => d.name))
        .padding(.1);

    // Add X axis
    var x = d3.scaleLinear()
        .domain([0, d3.max(dataArray, d => d.checkoutPoints)])
        .range([0, width]);

    // Bars
    svg.selectAll("myRect")
        .data(dataArray)
        .enter()
        .append("rect")
        .attr("y", d => y(d.name))
        .attr("x", 0)
        .attr("width", d => x(d.checkoutPoints))
        .attr("height", y.bandwidth())
        .attr("fill", "#69b3a2")

    // Player names
    svg.selectAll("playerLabel")
        .data(dataArray)
        .enter()
        .append("text")
        .attr("y", d => y(d.name) + y.bandwidth() / 2)
        .attr("x", -5)
        .attr("text-anchor", "end")
        .attr("alignment-baseline", "middle")
        .text(d => d.name)
        .style("font-size", "12px")
        .style("fill", "black");

    // Checkout points
    svg.selectAll("checkoutLabel")
        .data(dataArray)
        .enter()
        .append("text")
        .attr("y", d => y(d.name) + y.bandwidth() / 2)
        .attr("x", d => x(d.checkoutPoints) + 5)
        .attr("text-anchor", "start")
        .attr("alignment-baseline", "middle")
        .text(d => d.checkoutPoints)
        .style("font-size", "12px")
        .style("fill", "black");
}
