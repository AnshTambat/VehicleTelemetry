import useVehicles from '../hooks/useVehicles';
import useLatestReading from '../hooks/useLatestReading';

const VehicleRow = ({ vehicle }) => {
  const { data, isLoading } = useLatestReading(vehicle.vehicleId);
  const reading = data?.data;

  return (
    <tr>
      <td className="text-secondary">{vehicle.vehicleId}</td>
      <td className="text-white fw-semibold">{vehicle.name}</td>
      <td>
        <span className="badge bg-secondary">{vehicle.licensePlate}</span>
      </td>
      <td>
        {isLoading ? (
          <span className="text-secondary">Loading...</span>
        ) : reading ? (
          <span className="text-success fw-semibold">
            {parseFloat(reading.speed).toFixed(1)} km/h
          </span>
        ) : (
          <span className="text-secondary">N/A</span>
        )}
      </td>
      <td>
        {isLoading ? (
          <span className="text-secondary">Loading...</span>
        ) : reading ? (
          <span className="text-warning fw-semibold">
            {parseFloat(reading.engineTemp).toFixed(1)} °C
          </span>
        ) : (
          <span className="text-secondary">N/A</span>
        )}
      </td>
      <td>
        {isLoading ? (
          <span className="text-secondary">Loading...</span>
        ) : reading ? (
          <span className="text-info">
            {parseFloat(reading.lat).toFixed(4)}, {parseFloat(reading.lon).toFixed(4)}
          </span>
        ) : (
          <span className="text-secondary">N/A</span>
        )}
      </td>
    </tr>
  );
};

const VehicleTable = () => {
  const { data, isLoading, isError } = useVehicles();
  const vehicles = data?.data;

  if (isLoading) return (
    <div className="text-center py-4">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-secondary mt-2">Loading vehicles...</p>
    </div>
  );

  if (isError) return (
    <div className="alert alert-danger">Error loading vehicles. Make sure the API is running.</div>
  );

  return (
    <div className="table-responsive">
      <table className="table table-dark table-striped table-hover mb-0">
        <thead>
          <tr className="border-secondary">
            <th className="text-secondary">ID</th>
            <th className="text-secondary">Name</th>
            <th className="text-secondary">License Plate</th>
            <th className="text-secondary">Speed</th>
            <th className="text-secondary">Engine Temp</th>
            <th className="text-secondary">Location (Lat, Lon)</th>
          </tr>
        </thead>
        <tbody>
          {vehicles?.map((vehicle) => (
            <VehicleRow key={vehicle.vehicleId} vehicle={vehicle} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleTable;