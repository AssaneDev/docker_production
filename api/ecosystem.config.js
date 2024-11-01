module.exports = {
    apps: [
      {
        script: 'src/index.js',
        name: 'api',
        exec_mode: 'cluster',
        instances: 'max',        // Utilise le bon mot-clé `instances`
        watch: true,             // Activer le mode de surveillance pour redémarrer à chaque changement
        kill_timeout: 3000,      // Donne 3 secondes pour une fermeture propre
        env: {
          NODE_ENV: 'production'
        },
        env_development: {
          NODE_ENV: 'development'
        }
      }
    ]
  };
  