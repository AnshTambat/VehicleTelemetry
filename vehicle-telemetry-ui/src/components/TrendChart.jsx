import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import useReadings from '../hooks/useReadings';

const TrendChart = ({ vehicleId, from, to }) => {
  const { data, isLoading, isError } = useReadings(vehicleId, from, to);
  const readings = data?.data;

  if (!vehicleId) return (
    <div className="text-center py-5">
      <p className="text-secondary fs-5">🚗 Please select a vehicle to view the chart</p>
    </div>
  );

  if (isLoading) return (
    <div className="text-center py-4">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-secondary mt-2">Loading chart...</p>
    </div>
  );

  if (isError) return (
    <div className="alert alert-danger">Error loading readings.</div>
  );

  const chartData = readings?.map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString(),
    speed: parseFloat(r.speed).toFixed(1),
    engineTemp: parseFloat(r.engineTemp).toFixed(1),
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis
            dataKey="time"
            tick={{ fill: '#adb5bd', fontSize: 11 }}
            stroke="#444"
          />
          <YAxis
            tick={{ fill: '#adb5bd', fontSize: 11 }}
            stroke="#444"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#212529',
              border: '1px solid #444',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Legend
            wrapperStyle={{ color: '#adb5bd' }}
          />
          <Line
            type="monotone"
            dataKey="speed"
            stroke="#198754"
            name="Speed (km/h)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="engineTemp"
            stroke="#ffc107"
            name="Engine Temp (°C)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;