const app = require('./app');
console.log('App loaded');
console.log('Router stack:');
app._router.stack.forEach((layer, idx) => {
  if (layer.route) {
    console.log(idx, layer.route.path, Object.keys(layer.route.methods));
  } else if (layer.name === 'router') {
    console.log(idx, 'router', layer.regexp);
  } else {
    console.log(idx, layer.name);
  }
});
