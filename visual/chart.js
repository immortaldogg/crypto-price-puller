// Global variable to store all data
let allData = [];
let filteredData = [];

function createChart(data) {
    const chartData = [{
        x: data.map(r => r["Rise from Lowest after Pivot (%)"]),
        y: data.map(r => r["Drop from Prev High (%)"]),
        text: data.map(r => r["Symbol"]),
        mode: 'markers+text',
        type: 'scatter',
        textposition: 'top center',
        hoverinfo: 'all',
        hovertemplate:
            '<b>%{text}</b><br>' +
            'Rise from Low: %{x:.1f}%<br>' +
            'Drawdown from High: %{y:.1f}%<br>' +
            'Previous High: $%{customdata[0]:.4f}<br>' +
            'Lowest Price: $%{customdata[1]:.4f}<br>' +
            'After Pivot High: $%{customdata[2]:.4f}<br>' +
            'Earliest Date: %{customdata[3]}<br>' +
            'Latest Date: %{customdata[4]}<br>' +
            '<extra></extra>',
        customdata: data.map(r => [
            r['Prev High'],
            r['Lowest'],
            r['After Pivot High'],
            r['Earliest Date'],
            r['Latest Date']
        ]),
        marker: {
            size: data.map(r => Math.min(20, Math.max(5, r["Rise from Lowest after Pivot (%)"] / 10))),
            color: data.map(r => r["Rise from Lowest after Pivot (%)"]),
            colorscale: 'Viridis',
            showscale: true
        }
    }];

    const layout = {
        title: 'Coin Movement Classifier',
        height: 800,
        xaxis: { title: 'Gain from Low (%)', zeroline: true },
        yaxis: { title: 'Drawdown from Previous Top (%)', zeroline: true },
        showlegend: false
    };

    /* experimental */
    // Calculate medians for quadrant division
    const xValues = data.map(r => r["Rise from Lowest after Pivot (%)"]);
    const yValues = data.map(r => r["Drop from Prev High (%)"]);
    const medianX = xValues.sort((a, b) => a - b)[Math.floor(xValues.length / 2)];
    const medianY = yValues.sort((a, b) => a - b)[Math.floor(yValues.length / 2)];

    // Add vertical and horizontal lines for quadrant
    layout.shapes = [
        {
            type: 'line',
            x0: medianX,
            x1: medianX,
            y0: Math.min(...yValues),
            y1: Math.max(...yValues),
            line: {
                color: 'gray',
                width: 2,
                dash: 'dashdot'
            }
        },
        {
            type: 'line',
            x0: Math.min(...xValues),
            x1: Math.max(...xValues),
            y0: medianY,
            y1: medianY,
            line: {
                color: 'gray',
                width: 2,
                dash: 'dashdot'
            }
        }
    ];

    /* experimental */

    Plotly.newPlot('chart', chartData, layout);
}

// Filter function
function filterBySymbol() {
    const filterValues = document.getElementById('symbolFilter').value.trim().toUpperCase().replace(/\s/g, '').split(',');
    if (!filterValues || filterValues.length === 0) {
        filteredData = allData;
    } else {
        filteredData = allData.filter(item =>
            item.Symbol && filterValues.some(filterValue => item.Symbol.toUpperCase().includes(filterValue))
        );
    }

    createChart(filteredData);
    console.log(`Filtered to ${filteredData.length} items matching "${filterValues.join(', ')}"`);
}

function filterExcludeBySymbol() {
    const filterValues = document.getElementById('symbolFilter').value.trim().toUpperCase().replace(/\s/g, '').split(',');

    if (!filterValues || filterValues.length === 0) {
        filteredData = allData;
    } else {
        filteredData = allData.filter(item =>
            item.Symbol && !filterValues.some(filterValue => item.Symbol.toUpperCase().includes(filterValue))
        );
    }

    createChart(filteredData);
    console.log(`Excluded ${filterValues.join(', ')} - showing ${filteredData.length} items`);
}

// Clear filter function
function clearFilter() {
    document.getElementById('symbolFilter').value = '';
    filteredData = allData;
    createChart(filteredData);
    console.log('Filter cleared, showing all data');
}

// Load data from a JSON file
function loadData() {
    fetch('./data.json')
        .then(response => response.json())
        .then(data => {
            allData = data;
            filteredData = data;
            createChart(data);
        })
        .catch(error => {
            console.log('No data file found. Please run your Node.js script first.');
            console.log('You can also paste your results data directly into this file.');
        });
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function () {
    loadData();

    // Add Enter key support for filtering
    document.getElementById('symbolFilter').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            filterBySymbol();
        }
    });

    // Add button event listeners
    document.getElementById('filterBtn').addEventListener('click', filterBySymbol);
    document.getElementById('excludeBtn').addEventListener('click', filterExcludeBySymbol);
    document.getElementById('clearBtn').addEventListener('click', clearFilter);
}); 