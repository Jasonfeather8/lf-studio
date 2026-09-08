const fs = require('fs');

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// replace the map contents
content = content.replace(/painReports.map\(\(report\) => \{[\s\S]*?return \([\s\S]*?<\/div>\n\s*\);\n\s*\}\)/g, 
  "painReports.map((report) => <PainReportCard key={report.id} report={report} evaThreshold={evaThreshold} />)");

// Add the import
if (!content.includes('PainReportCard')) {
  content = content.replace("import WeeklyAdherenceChart", "import PainReportCard from '../components/dashboard/PainReportCard';\nimport WeeklyAdherenceChart");
}

fs.writeFileSync('src/pages/Dashboard.tsx', content);

