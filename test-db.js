require('dotenv').config();
const pool = require('./db');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Connection failed:', err);
  } else {
    console.log('Connected! Current time from DB:', res.rows[0]);
  }
  pool.end();
});
