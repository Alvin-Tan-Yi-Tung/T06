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

    function refresh(){
        const activeScreenIds = filters_screen
            .filter(f => f.isActive && f.id !== "all")
            .map(f => f.id);

        const activeSizes = filters_size
            .filter(f => f.isActive && f.id !== "allSizes")
            .map(f => +f.id);

        updateHistogram(data, activeScreenIds, activeSizes);
    }

    refresh();
}

// Update histogram using both screen and size filters
function updateHistogram(data, activeScreenIds = [], activeSizes = []) {
    const updatedData = data.filter(d => {
        const typeOk = activeScreenIds.length ? activeScreenIds.includes(d.screenTech) : true;
        const sizeOk = activeSizes.length ? activeSizes.includes(d.screenSize) : true;
        return typeOk && sizeOk;
    });
    drawHistogram(updatedData);
}