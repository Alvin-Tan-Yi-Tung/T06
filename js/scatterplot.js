// Draw a scatter plot into the #scatterplot container
function drawScatterplot(data) {
    // Guard: ensure we have data
    if (!data || !data.length) return;

    // Filter out invalid numeric values
    const filtered = data.filter(d => (
        d.star != null && !isNaN(d.star) &&
        d.screenSize != null && !isNaN(d.screenSize)
    ));

    // Set up chart area (do NOT redeclare innerChartS here)

    // Clear previous SVG content
    const container = d3.select("#scatterplot");
    container.selectAll("*").remove();

    // Create responsive SVG
    const svg = container.append("svg")
        .attr("width", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    // Optional background to match page theme
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", bodyBackgroundColor);

    // Create inner chart group with margins
    innerChartS = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up x and y scales using data extents (no bins here)
    const xExtent = d3.extent(filtered, d => d.star);
    const yExtent = d3.extent(filtered, d => d.screenSize);

    // Assign to shared scatterplot scales (do NOT redeclare)
    xScaleS
        .domain([xExtent[0] - 0.5, xExtent[1] + 0.5]) // padding for stars
        .range([0, innerWidth])
        .nice();

    yScaleS
        .domain([yExtent[0], yExtent[1]])
        .range([innerHeight, 0])
        .nice();

    // Set colour scale domain (distinct hues by screen tech)
    const techs = Array.from(new Set(filtered.map(d => d.screenTech)));
    colorScale
        .domain(techs)
        .range(d3.schemeTableau10);

    // Draw/update circles (use filtered data)
    innerChartS.selectAll("circle")
        .data(filtered)
        .join("circle")
        .attr("cx", d => xScaleS(d.star))           // x: Star Rating
        .attr("cy", d => yScaleS(d.screenSize))     // y: Screen Size (inches)
        .attr("r", 4)
        .attr("fill", d => colorScale(d.screenTech))// hue by category
        .attr("opacity", 0.5)                       // easier to see overlaps
        .attr("stroke", "none");                    // no stroke

    // Legend (now uses the defined 'techs')
    const legend = innerChartS.append("g")
        .attr("transform", `translate(${innerWidth - 120}, 0)`);
    techs.forEach((t, i) => {
        const row = legend.append("g").attr("transform", `translate(0, ${i * 18})`);
        row.append("rect").attr("width", 12).attr("height", 12).attr("fill", colorScale(t));
        row.append("text").attr("x", 18).attr("y", 10).attr("fill", "#333").text(t);
    });

    // Add axes (follow histogram pattern)
    const bottomAxis = d3.axisBottom(xScaleS).ticks(5);
    innerChartS.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(bottomAxis)
        .append("text")
        .attr("x", innerWidth)
        .attr("y", 40)
        .attr("fill", "#000")
        .attr("text-anchor", "end")
        .text("Star Rating");

    const leftAxis = d3.axisLeft(yScaleS).ticks(6);
    innerChartS.append("g")
        .attr("class", "y-axis")
        .call(leftAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -10)
        .attr("y", -50)
        .attr("fill", "#000")
        .attr("text-anchor", "end")
        .text("Screen Size (inches)");

    // Draw/update circles (lower opacity, no stroke)
    innerChartS.selectAll("circle")
        .data(filtered)
        .join("circle")
        .attr("cx", d => xScaleS(d.star))
        .attr("cy", d => yScaleS(d.screenSize))
        .attr("r", 4)
        .attr("fill", d => colorScale(d.screenTech))
        .attr("opacity", 0.5)
        .attr("stroke", "none");
}