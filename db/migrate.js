require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { pool } = require('./database');

async function migrate() {

  try {

    const schema = fs.readFileSync(
      path.join(__dirname, 'schema.sql'),
      'utf8'
    );

    await pool.query(schema);

    console.log('✅ Database migration complete');

    process.exit(0);

  } catch (err) {

    console.error(
      '❌ Migration failed:',
      err.message
    );

    process.exit(1);
  }

}

migrate();
