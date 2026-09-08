import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/dashboardService';

export const DASHBOARD_KEYS = {
  PAIN_REPORTS: ['dashboard', 'pain_reports'],
  CHART_DATA: ['dashboard', 'chart_data'],
  PATIENT_EXERCISES: ['dashboard', 'patient_exercises'],
  RECENT_WORKOUTS: ['dashboard', 'recent_workouts'],
};

export function useDashboardPainReportsQuery() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.PAIN_REPORTS,
    queryFn: () => dashboardService.getPainReports(),
  });
}

export function useDashboardChartDataQuery() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.CHART_DATA,
    queryFn: () => dashboardService.getChartData(),
  });
}

export function useDashboardPatientExercisesQuery(filter: 'hoje' | 'amanha' | 'depois' = 'hoje') {
  return useQuery({
    queryKey: [...DASHBOARD_KEYS.PATIENT_EXERCISES, filter],
    queryFn: () => dashboardService.getPatientExercises(filter),
  });
}

export function useDashboardRecentWorkoutsQuery() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.RECENT_WORKOUTS,
    queryFn: () => dashboardService.getRecentWorkouts(),
  });
}

/**
 * Hook combinado para o Dashboard Profissional
 */
export function useDashboardQueries() {
  const painReportsQuery = useDashboardPainReportsQuery();
  const recentWorkoutsQuery = useDashboardRecentWorkoutsQuery();
  const chartDataQuery = useDashboardChartDataQuery();

  return {
    painReports: painReportsQuery.data,
    recentWorkouts: recentWorkoutsQuery.data,
    chartData: chartDataQuery.data,
    isLoading: painReportsQuery.isLoading || recentWorkoutsQuery.isLoading || chartDataQuery.isLoading,
    isError: painReportsQuery.isError || recentWorkoutsQuery.isError || chartDataQuery.isError,
  };
}