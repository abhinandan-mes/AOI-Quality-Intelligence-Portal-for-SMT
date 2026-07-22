import { Service } from 'node-windows';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a new service object
const svc = new Service({
  name: 'AOI Quality Intelligence Portal Frontend',
  description: 'Frontend Web Server for the AOI Quality Intelligence Portal (Vite).',
  script: path.join(__dirname, 'node_modules', 'vite', 'bin', 'vite.js'),
  scriptOptions: '--host'
});

// Listen for the "install" event, which indicates the process is available as a service.
svc.on('install', function() {
  console.log('Frontend Service installed successfully!');
  console.log('Starting service...');
  svc.start();
});

// Just in case this file is run twice.
svc.on('alreadyinstalled', function() {
  console.log('This service is already installed.');
});

// Listen for the "start" event and let us know when the process has actually started working.
svc.on('start', function() {
  console.log(svc.name + ' started on port 3030!');
});

// Install the script as a service.
svc.install();
