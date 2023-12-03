const Pool = require('pg').Pool;

const pool = new Pool({
  user: 'postgres',
  password: '7374',
  host: 'localhost',
  port: 5433,
  database: 'geolocation',
});

pool.connect((err) => {
  if (!err) console.error('DB connection successful');
  else console.error('Error connecting to client');
});

module.exports = pool;
