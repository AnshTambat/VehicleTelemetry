import useVehicles from '../hooks/useVehicles';

const Filter = ({ selectedVehicleId, onVehicleChange, from, to, onFromChange, onToChange }) => {
  const { data, isLoading } = useVehicles();
  const vehicles = data?.data;

  return (
    <div className="card bg-secondary bg-opacity-10 border-secondary">
      <div className="card-header border-secondary">
        <h5 className="mb-0 text-white">🔍 Filters</h5>
      </div>
      <div className="card-body">
        <div className="row g-3">

          <div className="col-md-4">
            <label className="form-label text-secondary">Select Vehicle</label>
            <select
              className="form-select bg-dark text-white border-secondary"
              value={selectedVehicleId}
              onChange={(e) => onVehicleChange(e.target.value)}
            >
              <option value="">-- Select a Vehicle --</option>
              {isLoading ? (
                <option>Loading...</option>
              ) : (
                vehicles?.map((v) => (
                  <option key={v.vehicleId} value={v.vehicleId}>
                    {v.name} ({v.licensePlate})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label text-secondary">From</label>
            <input
              type="datetime-local"
              className="form-control bg-dark text-white border-secondary"
              value={from}
              onChange={(e) => onFromChange(e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label text-secondary">To</label>
            <input
              type="datetime-local"
              className="form-control bg-dark text-white border-secondary"
              value={to}
              onChange={(e) => onToChange(e.target.value)}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default Filter;