// Load the CSV file with a row conversion function
d3.csv("data/Ex6_TVdata.csv", d => ({
    brand: d.brand,
    model: d.model,
    // Convert screenSize to number (remove + if your CSV has strings like "32")
    screenSize: +d.screenSize,
    screenTech: d.screenTech,
    // Convert energyConsumption to number
    energyConsumption: +d.energyConsumption,
    // Convert star rating to number (if present)
    star: d.star ? +d.star : null
}))
.then(data => {
    // Log the processed data to the console to check it loaded correctly
    console.log("Loaded data:", data);

    // Call functions after data is loaded
    // These functions should be implemented in your other JS files (histogram.js, interactions.js, etc.)
    if (typeof drawHistogram === "function") drawHistogram(data);
    if (typeof populateFilters === "function") populateFilters(data);
})
.catch(error => {
    console.error("Error loading the CSV file:", error);
});