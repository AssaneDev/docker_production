const express = require('express');
const { MongoClient } = require('mongodb');

let clients;
let count;
const uri = process.env.NODE_ENV === 'production'
  ? `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PWD}@db`
  : `mongodb://db`;

console.log(process.env);

const client = new MongoClient(uri);
async function run() {
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('CONNEXION DB OK !');
    clients = client;
    count = client.db('test').collection('count');
  } catch (err) {
    console.error('Erreur de connexion à la base de données :', err.stack);
  }
}
run().catch(console.dir);

const app = express();

app.get('/api/count', (req, res) => {
  if (!count) {
    return res.status(500).json({ error: 'Database connection not established' });
  }
  count.findOneAndUpdate({}, { $inc: { count: 1 } }, { returnNewDocument: true, upsert: true })
    .then((doc) => {
      res.status(200).json(doc.value ? doc.value.count : 0);
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

app.all('*', (req, res) => {
  res.status(404).end();
});

const server = app.listen(80, () => {
  console.log('Server is running on port 80');
});

// Gestion du signal SIGINT pour fermer le serveur et la base de données
process.on('SIGINT', () => {
  console.log('Arrêt du serveur...');
  server.close((err) => {
    if (err) {
      console.error('Erreur lors de la fermeture du serveur :', err);
      process.exit(1);
    } else {
      console.log('Serveur arrêté. Fermeture de la connexion MongoDB...');
      if (clients) {
        clients.close((err) => {
          if (err) {
            console.error('Erreur lors de la fermeture de MongoDB :', err);
            process.exit(1);
          } else {
            console.log('Connexion MongoDB fermée.');
            process.exit(0);
          }
        });
      } else {
        process.exit(0);
      }
    }
  });
});
