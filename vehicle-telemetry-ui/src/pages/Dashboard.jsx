import { useState } from 'react';
import Filter from '../components/Filter';
import VehicleTable from '../components/VehicleTable';
import TrendChart from '../components/TrendChart';
import MapLite from '../components/MapLite';

const Dashboard = () => {
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  return (
    <div className="container-fluid px-4 py-4">

      <div className="mb-4">
        <h1 className="fw-bold text-white">
            VehicleIQ
        </h1>
        <p className="text-secondary">Real-time vehicle speed, engine temperature and location tracking</p>
      </div>

      <div className="mb-4">
        <Filter
          selectedVehicleId={selectedVehicleId}
          onVehicleChange={setSelectedVehicleId}
          from={from}
          to={to}
          onFromChange={setFrom}
          onToChange={setTo}
        />
      </div>

      <div className="mb-4">
        <div className="card bg-secondary bg-opacity-10 border-secondary">
          <div className="card-header border-secondary">
            <h5 className="mb-0 text-white">📋 All Vehicles — Latest Readings</h5>
          </div>
          <div className="card-body">
            <VehicleTable />
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-lg-8 mb-4 mb-lg-0">
          <div className="card bg-secondary bg-opacity-10 border-secondary h-100">
            <div className="card-header border-secondary">
              <h5 className="mb-0 text-white">📈 Speed & Engine Temp Trend</h5>
            </div>
            <div className="card-body">
              <TrendChart
                vehicleId={selectedVehicleId}
                from={from}
                to={to}
              />
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card bg-secondary bg-opacity-10 border-secondary h-100">
            <div className="card-header border-secondary">
              <h5 className="mb-0 text-white">📍 Location History</h5>
            </div>
            <div className="card-body p-0">
              <MapLite
                vehicleId={selectedVehicleId}
                from={from}
                to={to}
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;