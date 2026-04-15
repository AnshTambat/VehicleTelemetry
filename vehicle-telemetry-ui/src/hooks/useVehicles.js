import { useQuery } from '@tanstack/react-query';
import { getAllVehicles } from '../api/vehicleService';

const useVehicles = () => {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: getAllVehicles,
  });
};

export default useVehicles;