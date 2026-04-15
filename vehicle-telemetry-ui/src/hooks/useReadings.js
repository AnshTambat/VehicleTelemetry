import { useQuery } from '@tanstack/react-query';
import { getReadings } from '../api/readingsService';

const useReadings = (vehicleId, from, to) => {
  return useQuery({
    queryKey: ['readings', vehicleId, from, to],
    queryFn: () => getReadings(vehicleId, from, to),
    enabled: !!vehicleId,
  });
};

export default useReadings;