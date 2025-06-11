let chart;
let chartData = {
    labels: [],
    datasets: [{
        label: 'Execution Time (s)',
        data: [],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
    }]
};

function addCodeBox() {
    const box = document.createElement('textarea');
    box.placeholder = "Paste another C++ code to compare...";
    document.getElementById('code-boxes').appendChild(box);
}

function runAllCodes() {
    const textareas = document.querySelectorAll('#code-boxes textarea');
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    chartData.labels = [];
    chartData.datasets[0].data = [];

    textareas.forEach((ta, idx) => {
        fetch('/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: ta.value })
        })
        .then(res => res.json())
        .then(data => {
            const resBox = document.createElement('div');
            resBox.className = 'result-box';
            if (data.error) {
                resBox.innerText = `❌ Error: ${data.error}`;
            } else {
                resBox.innerText = `✅ Output:\n${data.output}\n⏱️ Time Taken: ${data.time.toFixed(6)}s`;
                chartData.labels.push(`Code ${idx + 1}`);
                chartData.datasets[0].data.push(data.time);
                updateChart();
            }
            resultsDiv.appendChild(resBox);
        });
    });
}

function updateChart() {
    if (!chart) {
        const ctx = document.getElementById('timeChart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Time (seconds)'
                        }
                    }
                }
            }
        });
    } else {
        chart.update();
    }
}
