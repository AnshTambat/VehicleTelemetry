import useReadings from '../hooks/useReadings';

const MapLite = ({ vehicleId, from, to }) => {
  const { data, isLoading, isError } = useReadings(vehicleId, from, to);
  const readings = data?.data;

  if (!vehicleId) return (
    <div className="text-center py-5">
      <p className="text-secondary fs-5">📍 Please select a vehicle to view location data</p>
    </div>
  );

  if (isLoading) return (
    <div className="text-center py-4">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-secondary mt-2">Loading location data...</p>
    </div>
  );

  if (isError) return (
    <div className="alert alert-danger m-3">Error loading location data.</div>
  );

  return (
    <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
      <table className="table table-dark table-striped table-hover table-sm mb-0">
        <thead className="sticky-top">
          <tr>
            <th className="text-secondary">#</th>
            <th className="text-secondary">Time</th>
            <th className="text-secondary">Lat</th>
            <th className="text-secondary">Lon</th>
            <th className="text-secondary">Speed</th>
            <th className="text-secondary">Temp</th>
          </tr>
        </thead>
        <tbody>
          {readings?.map((r, index) => (
            <tr key={r.readingId}>
              <td className="text-secondary">{index + 1}</td>
              <td className="text-white">
                {new Date(r.timestamp).toLocaleTimeString()}
              </td>
              <td className="text-info">
                {parseFloat(r.lat).toFixed(4)}
              </td>
              <td className="text-info">
                {parseFloat(r.lon).toFixed(4)}
              </td>
              <td className="text-success fw-semibold">
                {parseFloat(r.speed).toFixed(1)}
              </td>
              <td className="text-warning fw-semibold">
                {parseFloat(r.engineTemp).toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MapLite;