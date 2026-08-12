const express = require('express');
const authRouter = require('./routes/authRouter');

console.log('authRouter stack:');
authRouter.stack.forEach((layer, idx) => {
  if (layer.route) {
    console.log(idx, layer.route.path, Object.keys(layer.route.methods));
  } else {
    console.log(idx, layer.name || 'layer', layer.regexp && layer.regexp.toString());
  }
});

const app = express();
app.use(authRouter);
console.log('App stack after mounting authRouter:');
app._router.stack.forEach((layer, idx) => {
  if (layer.route) {
    console.log(idx, layer.route.path, Object.keys(layer.route.methods));
  } else {
    console.log(idx, layer.name || 'layer', layer.regexp && layer.regexp.toString());
  }
});
