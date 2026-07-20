const Service = require('node-windows').Service;
const path = require('path');

// Create a new service object
const svc = new Service({
  name: 'AOI Quality Intelligence Portal Backend',
  description: 'Backend Node.js server for the AOI Quality Intelligence Portal, including File Watcher and API.',
  // Since we use tsx in dev, for production we should compile to JS or use ts-node.
  // We'll compile to build/server.js in production, or if not compiled, use tsx/ts-node.
  // Assuming tsc is run to produce 'build/server.js'
  script: path.join(__dirname, 'build', 'server.js'),
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ]
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function() {
  console.log('Service installed successfully!');
  console.log('Starting service...');
  svc.start();
});

// Just in case this file is run twice.
svc.on('alreadyinstalled', function() {
  console.log('This service is already installed.');
});

// Listen for the "start" event and let us know when the
// process has actually started working.
svc.on('start', function() {
  console.log(svc.name + ' started!\nVisit http://127.0.0.1:5050 to see it in action.');
});

// Install the script as a service.
svc.install();
