const fs = require('fs');

['PatientDetailView', 'PatientListView'].forEach(name => {
  const path = `src/components/patients/${name}.tsx`;
  let code = fs.readFileSync(path, 'utf8');
  
  if (!code.includes('useProfilesQuery')) {
    code = code.replace(/usePatientAdherenceQuery[\s]*} from '\.\.\/\.\.\/hooks';/, "usePatientAdherenceQuery,\n  useProfilesQuery,\n  usePatientExamsQuery,\n  useCreateExamMutation,\n  useDeleteExamMutation\n} from '../../hooks';");
    fs.writeFileSync(path, code);
  }
});
