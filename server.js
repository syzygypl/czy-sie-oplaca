const express = require('express');
const app = express();

app.set('port', (process.env.PORT));
app.use(express.static(`${process.cwd()}/build`));

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});
