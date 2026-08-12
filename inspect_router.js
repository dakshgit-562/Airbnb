const express = require('express');
const authRouter = require('./routes/authRouter');
const app = express();
app.use(authRouter);

console.log('App router exists:', !!app.router);
if (app.router && app.router.stack) {
  app.router.stack.forEach((layer, idx) => {
    if (layer.route) {
      console.log(idx, 'route', layer.route.path, Object.keys(layer.route.methods));
    } else {
      console.log(idx, 'middleware', layer.name, layer.regexp && layer.regexp.toString());
    }
  });
}
