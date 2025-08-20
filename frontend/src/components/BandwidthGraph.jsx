import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend 
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const BandwidthGraph = ({ data }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (data) {
      const labels = data.map(item => item.timestamp);
      
      setChartData({
        labels,
        datasets: [
          {
            label: 'Download (MB)',
            data: data.map(item => item.download_bytes / (1024 * 1024)),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          },
          {
            label: 'Upload (MB)',
            data: data.map(item => item.upload_bytes / (1024 * 1024)),
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          }
        ]
      });
    }
  }, [data]);

  if (!chartData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Bandwidth Usage</h3>
      <Line
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Usage (MB)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Time'
              }
            }
          }
        }}
        height={300}
      />
    </div>
  );
};

export default BandwidthGraph;
