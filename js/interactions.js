// Populate filter buttons and handle updates to the histogram
function populateFilters(data) {
    if (!data || !data.length) return;

    // SCREEN TYPE BUTTONS
    const screenContainer = d3.select("#filters_screen");
    screenContainer.selectAll("*").remove();

    screenContainer.selectAll("button")
        .data(filters_screen, d => d.id)
        .enter()
        .append("button")
        .attr("type", "button")
        .attr("class", d => d.isActive ? "filter-button active" : "filter-button")
        .text(d => d.label)
        .on("click", function(event, d) {
            if (d.id === "all") {
                filters_screen.forEach(f => f.isActive = (f.id === "all"));
            } else {
                const target = filters_screen.find(f => f.id === d.id);
                target.isActive = !target.isActive;
                filters_screen.find(f => f.id === "all").isActive = false;
                const anyActive = filters_screen.some(f => f.id !== "all" && f.isActive);
                if (!anyActive) filters_screen.forEach(f => f.isActive = (f.id === "all"));
            }

            screenContainer.selectAll("button")
                .data(filters_screen, d => d.id)
                .attr("class", d => d.isActive ? "filter-button active" : "filter-button");

            refresh();
        });

    // Ensure SIZE CONTAINER exists just under the graph
    (function ensureSizeContainer() {
        const container = document.getElementById("filters_size");
        const hist = document.getElementById("histogram");
        if (!container && hist) {
            const div = document.createElement("div");
            div.id = "filters_size";
            div.className = "filters-row";
            hist.parentNode.insertBefore(div, hist.nextSibling);
            console.log("Created #filters_size container under #histogram");
        }
    })();

    // SIZE BUTTONS row
    const sizeContainer = d3.select("#filters_size");
    if (sizeContainer.empty()) {
        console.warn("Missing #filters_size container — cannot render size filters.");
        return;
    }
    sizeContainer.selectAll("*").remove();

    // Render size buttons only if filters_size is a non-empty array
    if (Array.isArray(filters_size) && filters_size.length > 0) {
        sizeContainer.selectAll("button")
            .data(filters_size, d => d.id)
            .enter()
            .append("button")
            .attr("type", "button")
            .attr("class", d => d.isActive ? "filter-button active" : "filter-button")
            .text(d => d.label)
            .on("click", function(event, d) {
                if (d.id === "allSizes") {
                    filters_size.forEach(f => f.isActive = (f.id === "allSizes"));
                } else {
                    const target = filters_size.find(f => f.id === d.id);
                    target.isActive = !target.isActive;
                    filters_size.find(f => f.id === "allSizes").isActive = false;

                    const anyActive = filters_size.some(f => f.id !== "allSizes" && f.isActive);
                    if (!anyActive) filters_size.forEach(f => f.isActive = (f.id === "allSizes"));
                }

                sizeContainer.selectAll("button")
                    .data(filters_size, d => d.id)
                    .attr("class", d => d.isActive ? "filter-button active" : "filter-button");

                refresh();
            });

        console.log("Rendered size filters:", filters_size.map(f => f.label).join(", "));
    } else {
        console.warn("filters_size not configured; skipping size filter buttons.");
    }

    function refresh(){
        const activeScreenIds = filters_screen
            .filter(f => f.isActive && f.id !== "all")
            .map(f => f.id);

        // Safe default when filters_size is empty or undefined
        const activeSizes = Array.isArray(filters_size)
            ? filters_size.filter(f => f.isActive && f.id !== "allSizes").map(f => +f.id)
            : [];

        updateHistogram(data, activeScreenIds, activeSizes);
    }

    refresh();
}

// Create a tooltip attached to the scatterplot inner group
function createTooltip() {
    if (!innerChartS) return;

    innerChartS.selectAll(".tooltip").remove();

    const tooltip = innerChartS.append("g")
        .attr("class", "tooltip")
        .style("pointer-events", "none")
        .style("opacity", 0); // start hidden

    tooltip.append("rect")
        .attr("width", tooltipWidth)
        .attr("height", tooltipHeight)
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("fill", barColor)
        .attr("fill-opacity", 0.75);

    tooltip.append("text")
        .attr("class", "tooltip-text")
        .text("NA")
        .attr("x", tooltipWidth / 2)
        .attr("y", tooltipHeight / 2 + 2)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("fill", "white")
        .style("font-weight", 900);
}

// Bind mouse events to circles to show/move/hide the tooltip
function handleMouseEvents() {
    if (!innerChartS) return;
    const tip = innerChartS.select(".tooltip");
    if (tip.empty()) return;

    // Select all circles in the scatter plot
    const circles = innerChartS.selectAll("circle");

    circles
        .on("mouseenter", function(e, d) {
            // 1) Set tooltip text to screen size
            innerChartS.select(".tooltip text")
                .text(d.screenSize ?? "NA");

            // 2) Get the circle centre from DOM attributes
            const cx = +e.target.getAttribute("cx");
            const cy = +e.target.getAttribute("cy");

            // Optional: tint tooltip background by screen type
            tip.select("rect").attr("fill", colorScale(d.screenTech) || barColor);

            // 3) Position and fade in the tooltip smoothly
            tip.attr("transform", `translate(${cx - 0.5 * tooltipWidth}, ${cy - 1.5 * tooltipHeight})`)
               .transition()
               .duration(200)
               .style("opacity", 1);
        })
        .on("mousemove", function(e) {
            // Keep tooltip tracking the circle centre
            const cx = +e.target.getAttribute("cx");
            const cy = +e.target.getAttribute("cy");
            tip.attr("transform", `translate(${cx - 0.5 * tooltipWidth}, ${cy - 1.5 * tooltipHeight})`);
        })
        .on("mouseleave", function(e, d) {
            // 4) Hide and move offscreen (so it doesn’t block interactions)
            tip.transition()
               .duration(100)
               .style("opacity", 0)
               .attr("transform", "translate(0, 500)");
        });
}

// Update histogram using both screen and size filters
function updateHistogram(data, activeScreenIds = [], activeSizes = []) {
    const updatedData = data.filter(d => {
        const typeOk = activeScreenIds.length ? activeScreenIds.includes(d.screenTech) : true;
        const sizeOk = activeSizes && activeSizes.length ? activeSizes.includes(d.screenSize) : true;
        return typeOk && sizeOk;
    });

    drawHistogram(updatedData);

    // Also refresh scatterplot (Exercise 6.1)
    if (typeof drawScatterplot === "function") drawScatterplot(updatedData);

    // Recreate tooltip and rebind handlers after re-render
    if (typeof createTooltip === "function") createTooltip();
    if (typeof handleMouseEvents === "function") handleMouseEvents();
}