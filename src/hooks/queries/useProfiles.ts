import { useQuery } from '@tanstack/react-query';
import { profileService } from '../../services/profileService';
import { KEYS } from '../keys';

export function useProfilesQuery() {
  return useQuery({
    queryKey: KEYS.PROFILES,
    queryFn: () => profileService.getAll(),
  });
}
