import { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-dist';
import api from '../api';


function PlotlyFromAPI() {
  const chartDivRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/api/sensor_reading/")
      .then((response) => {
        const { data, layout } = response.data; // DRF sends { data, layout }

        // Reuse the chart div. If a chart already exists, Plotly.react updates
        // it efficiently. Otherwise Plotly.newPlot creates a fresh one.
        if (chartDivRef.current) {
          Plotly.react(chartDivRef.current, data, layout);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });

    // Cleanup: purge the chart from the div when component unmounts
    return () => {
      if (chartDivRef.current) {
        Plotly.purge(chartDivRef.current);
      }
    };
  }, []); // runs once after mount

  if (loading) return <div>Loading chart…</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div
      ref={chartDivRef}
      style={{ width: '50%', height: '500px' }}
    />
  );
}

export default PlotlyFromAPI;