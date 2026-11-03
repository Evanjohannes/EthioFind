const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5433,
  user: 'ethiofind',
  password: 'ethiofind_dev_password',
  database: 'ethiofind_db',
});

client.connect()
  .then(() => client.query('SELECT 1'))
  .then((res) => {
    console.log('SUCCESS:', res.rows);
    return client.end();
  })
  .catch((err) => {
    console.error('FAILED:', err.message);
  });