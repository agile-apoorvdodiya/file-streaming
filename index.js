const express = require('express');
const {join} = require('path')
const app = express();
const videoRoutes = require('./src/routes/video');

app.get('/', (q, s) => {
  s.sendFile(join(__dirname, 'index.html'))
})

app.use('/video', [videoRoutes]);

const port = 3131;
app.listen(port, () => {
  console.log('server listing on port ', port);
});