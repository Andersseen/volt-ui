const fs = require('fs');

// 1. app.html
const appHtml = fs.readFileSync('src/app/app.html', 'utf8');
const heroStart = appHtml.indexOf('    <!-- Hero Section -->');
const mainEnd = appHtml.lastIndexOf('  </main>');
const homeHtml = appHtml.substring(heroStart, mainEnd);

fs.mkdirSync('src/app/pages', { recursive: true });
fs.writeFileSync('src/app/pages/home.component.html', homeHtml);

const newAppHtml =
  appHtml.substring(0, heroStart) +
  '    <router-outlet></router-outlet>\n' +
  appHtml.substring(mainEnd);
fs.writeFileSync('src/app/app.html', newAppHtml);

// 2. app.ts
const appTs = fs.readFileSync('src/app/app.ts', 'utf8');
let newAppTs = appTs;
newAppTs = newAppTs.replace(
  /import \{ VoltInput.*\} from 'volt';\nimport \{ VoltCard,[\s\S]*?\} from 'volt';\nimport \{ VoltSeparator \} from 'volt';\nimport \{ VoltCheckbox.*\} from 'volt';\n/,
  ''
);
newAppTs = newAppTs.replace(
  "import { VoltButton } from 'volt';",
  "import { VoltButton } from 'volt';\nimport { RouterOutlet } from '@angular/router';"
);
newAppTs = newAppTs.replace(
  /imports: \[\n    VoltButton,\n    VoltBadge,\n    VoltInput,\n    VoltTextarea,\n    VoltLabel,\n    VoltCard,\n    VoltCardHeader,\n    VoltCardTitle,\n    VoltCardDescription,\n    VoltCardContent,\n    VoltCardFooter,\n    VoltSeparator,\n    VoltCheckbox,\n    VoltSwitch,\n    VoltAvatar,\n    VoltAvatarImage,\n    VoltAvatarFallback,\n  \],/,
  'imports: [\n    RouterOutlet,\n    VoltButton,\n    VoltBadge,\n  ],'
);
fs.writeFileSync('src/app/app.ts', newAppTs);

// 3. app.routes.ts
const appRoutesTs = `import { Routes } from '@angular/router';\nimport { HomeComponent } from './pages/home.component';\n\nexport const routes: Routes = [\n  { path: '', component: HomeComponent }\n];\n`;
fs.writeFileSync('src/app/app.routes.ts', appRoutesTs);

// 4. index.html
const indexHtml = fs.readFileSync('src/index.html', 'utf8');
fs.writeFileSync(
  'src/index.html',
  indexHtml.replace('favicon.ico', 'favicon.png').replace('type="image/x-icon"', 'type="image/png"')
);
