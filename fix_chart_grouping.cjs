const fs = require('fs');

let file = fs.readFileSync('src/components/patients/PatientDetailView.tsx', 'utf8');

const groupingLogic = `
  const { data: patientAdherence } = usePatientAdherenceQuery(activePatientId);

  const groupedAdherenceChartData = useMemo(() => {
    if (!patientAdherence) return [];
    
    // Group by date
    const grouped = patientAdherence.reduce((acc, curr) => {
      const date = new Date(curr.data_execucao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (!acc[date]) {
        acc[date] = { name: date, totalBorg: 0, count: 0, volume: 0, maxBorg: 0 };
      }
      acc[date].totalBorg += curr.borg_rating || 0;
      acc[date].maxBorg = Math.max(acc[date].maxBorg, curr.borg_rating || 0);
      acc[date].count += 1;
      acc[date].volume += 10; // each exercise is arbitrarily 10 volume for the chart
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).map(g => ({
      name: g.name,
      borg: g.maxBorg,
      adesao: 100, // could be based on something else
      volume: g.volume
    })).slice(-5);
  }, [patientAdherence]);
`;

file = file.replace("  const { data: patientAdherence } = usePatientAdherenceQuery(activePatientId);", groupingLogic);
file = file.replace("data={patientAdherence ? patientAdherence.map((s, i) => ({ name: `Sessão ${i+1}`, borg: s.borg_rating || 0, adesao: 100 })).slice(-5) : []}", "data={groupedAdherenceChartData}");
file = file.replace("data={patientAdherence ? patientAdherence.map((s, i) => ({ name: `Sessão ${i+1}`, volume: (i+1)*10 })).slice(-5) : []}", "data={groupedAdherenceChartData}");

fs.writeFileSync('src/components/patients/PatientDetailView.tsx', file);
