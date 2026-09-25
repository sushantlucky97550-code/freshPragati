const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/pages/TodaysMaintenancePage.jsx',
  'src/pages/LoginPage.jsx',
  'src/pages/GatewayPage.jsx',
  'src/pages/DivisionSelectionPage.jsx',
  'src/pages/DashboardPage.jsx',
  'src/components/planning/PlanResultCard.jsx',
  'src/components/common/Navbar.jsx',
  'src/App.jsx',
  'index.html'
];

const FULL_NAME = 'PRAGATI : Predictive Rail Asset-availability & Grid-Aligned Traffic Integration';
const FULL_NAME_NO_AMP = 'PRAGATI : Predictive Rail Asset-availability &amp; Grid-Aligned Traffic Integration'; // For HTML

filesToUpdate.forEach(file => {
  const fullPath = path.join('c:/Pragati', file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace logic
    if (file.endsWith('.html')) {
        content = content.replace(/PRAGATI — AI-Powered Railway Maintenance & Block Planning \| Indian Railways Decision Support System/g, FULL_NAME_NO_AMP);
    } else {
        // Broad replacements
        content = content.replace(/PRAGATI \/ RailOpt AI/g, FULL_NAME);
        content = content.replace(/PRAGATI System/g, FULL_NAME);
        
        // Specific ones
        if (file.includes('LoginPage.jsx')) {
            content = content.replace(/>PRAGATI</g, `>${FULL_NAME}<`);
        }
        if (file.includes('GatewayPage.jsx') || file.includes('DivisionSelectionPage.jsx')) {
            content = content.replace(/Ministry of Railways • PRAGATI/g, `Ministry of Railways • ${FULL_NAME}`);
        }
        if (file.includes('Navbar.jsx')) {
            content = content.replace(/>PRAGATI</g, `>${FULL_NAME}<`);
        }
        if (file.includes('DashboardPage.jsx')) {
            content = content.replace(/PRAGATI — Demonstration System/g, `${FULL_NAME} — Demonstration System`);
        }
        if (file.includes('App.jsx')) {
            content = content.replace(/PRAGATI — System Recovery/g, `${FULL_NAME} — System Recovery`);
            content = content.replace(/>PRAGATI</g, `>${FULL_NAME}<`);
        }
    }
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
