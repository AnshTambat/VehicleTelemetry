import { useQuery } from '@tanstack/react-query';
import { getLatestReading } from '../api/readingsService';

const useLatestReading = (vehicleId) => {
  return useQuery({
    queryKey: ['latestReading', vehicleId],
    queryFn: () => getLatestReading(vehicleId),
    enabled: !!vehicleId,
    refetchInterval: 5000,
  });
};

export default useLatestReading;