const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const width = 800; // Largeur du graph
const height = 600; // Hauteur du graph
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

async function generateGraph(examProfile, referenceProfile) {
    const labels = Object.keys(examProfile);
    const examData = Object.values(examProfile);
    const referenceData = Object.values(referenceProfile);

    const configuration = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Exam Profile',
                    data: examData,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Reference Profile',
                    data: referenceData,
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };

    const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
    require('fs').writeFileSync('./profile_comparison.png', imageBuffer);
    console.log('Graph généré: profile_comparison.png');
}

module.exports = { generateGraph };
