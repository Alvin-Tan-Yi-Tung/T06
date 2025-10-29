// Global chart dimensions, scales, and filter config
const margin = { top: 40, right: 30, bottom: 50, left: 70 };
const width = 800;
const height = 400;
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

/* Make the colours accessible globally */
/****************************************/
const barColor = "#606464";
const bodyBackgroundColor = "#fffaf0";

// set up the scales
const xScale = d3.scaleLinear();
const yScale = d3.scaleLinear();

// value accessor for the histogram (change to d.screenSize if you prefer)
const valueAccessor = d => d.energyConsumption;

// bin generator (can change thresholds number to control bin size)
const binGenerator = d3.bin()
    .value(valueAccessor)
    .thresholds(10); // default 10 bins

// Filters configuration (used to populate filter buttons)
// Filters for screen tech (top row)
const filters_screen = [
    { id: "all", label: "All", isActive: true },
    { id: "LED", label: "LED", isActive: false },
    { id: "LCD", label: "LCD", isActive: false },
    { id: "OLED", label: "OLED", isActive: false },
    { id: "QLED", label: "QLED", isActive: false }
];