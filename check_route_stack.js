const authRouter = require('./routes/authRouter');
console.log('authRouter.stack length', authRouter.stack.length);
authRouter.stack.forEach((layer, idx) => {
  if (layer.route) {
    console.log(idx, layer.route.path, Object.keys(layer.route.methods));
  } else {
    console.log(idx, 'no route', layer.name);
  }
});
