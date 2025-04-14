const express = require('express');
const path = require('path');

const app = express();

const port = 3001;

const dossierAServir = path.join(__dirname, 'TEST/EMS');

app.use(express.static(dossierAServir));

app.get('*', (req, res) => {
  res.sendFile(path.join(dossierAServir, 'index.html'));
});

app.listen(port, () => {
  console.log(`Serveur en fonctionnement sur http://localhost:${port}`);
});
