// Draw a histogram into the #histogram container
function drawHistogram(data) {
    // Guard: ensure data exists
    if (!data || !data.length) return;

    // Filter out invalid numeric values for the chosen accessor
    const filtered = data.filter(d => {
        const v = valueAccessor(d);
        return v != null && !isNaN(v);
    });

    // Create bins from data
    const bins = binGenerator(filtered);
    console.log("Histogram bins:", bins);

    // Clear previous chart
    const container = d3.select("#histogram");
    container.selectAll("*").remove();

    // Create responsive SVG
    const svg = container.append("svg")
        .attr("width", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    // Background to match page / gap colour
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", bodyBackgroundColor);

    // Inner group
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // If no bins, exit
    if (!bins.length) {
        g.append("text")
            .attr("x", innerWidth / 2)
            .attr("y", innerHeight / 2)
            .attr("text-anchor", "middle")
            .text("No data to display");
        return;
    }

    // Define scales domains and ranges
    const xDomainLow = d3.min(bins, d => d.x0);
    const xDomainHigh = d3.max(bins, d => d.x1);
    xScale.domain([xDomainLow, xDomainHigh]).range([0, innerWidth]).nice();

    const yMax = d3.max(bins, d => d.length) || 0;
    yScale.domain([0, yMax]).range([innerHeight, 0]).nice();

    // Draw bars
    const barGroup = g.selectAll(".bar")
        .data(bins)
        .enter()
        .append("g")
        .attr("class", "bar")
        .attr("transform", d => `translate(${xScale(d.x0)},${yScale(d.length)})`);

    barGroup.append("rect")
        .attr("x", 1)
        .attr("y", 0)
        .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
        .attr("height", d => innerHeight - yScale(d.length))
        .attr("fill", barColor);

    // Optional: counts on top of bars (comment out if not wanted)
    barGroup.append("text")
        .attr("x", d => Math.max(2, (xScale(d.x1) - xScale(d.x0)) / 2))
        .attr("y", -4)
        .attr("text-anchor", "middle")
        .attr("font-size", 10)
        .text(d => d.length > 0 ? d.length : "");

    // Bottom axis (styled)
    const xAxis = d3.axisBottom(xScale).ticks(10);
    g.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis)
        .append("text")
        .attr("x", innerWidth)
        .attr("y", 40)
        .attr("fill", "#000")
        .attr("text-anchor", "end")
        .text("Labeled Energy Consumption (kWh/year)");

    const yAxis = d3.axisLeft(yScale).ticks(5);
    g.append("g")
        .attr("class", "y-axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -10)
        .attr("y", -50)
        .attr("fill", "#000")
        .attr("text-anchor", "end")
        .text("Frequency");
}