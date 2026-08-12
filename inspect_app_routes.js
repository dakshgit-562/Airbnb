const express = require('express');
const authRouter = require('./routes/authRouter');
const storeRouter = require('./routes/storeRouter');
const hostRouter = require('./routes/hostRouter');

const app = express();
app.use(authRouter);
app.use(storeRouter);
app.use('/host', authRouter);

console.log('Router stack:');
if (app.router && app.router.stack) {
  app.router.stack.forEach((layer, idx) => {
    console.log(idx, layer.route ? layer.route.path : layer.name, layer.route ? Object.keys(layer.route.methods) : 'middleware');
  });
} else {
  console.log('No router.stack on app');
}
