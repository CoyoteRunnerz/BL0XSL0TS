require('dotenv').config();

const express = require('express');
const cors = require('cors');

const db = require('../db/database');

const app = express();

const PORT = process.env.API_PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {

  res.json({
    platform: '[BL🔐X]•SL0TS',
    status: 'ONLINE',
    backend: 'ACTIVE'
  });

});

app.get('/api/status', async (req, res) => {

  try {

    const operators =
      await db.query(
        'SELECT COUNT(*) FROM operators'
      );

    const ledger =
      await db.query(
        'SELECT COUNT(*) FROM ledger'
      );

    res.json({

      platform: '[BL🔐X]•SL0TS',

      chain: '[BL🔐X]•CHAIN',

      database: 'POSTGRESQL',

      operators:
        operators.rows[0].count,

      ledgerRecords:
        ledger.rows[0].count,

      status: 'ONLINE'

    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});

app.get('/api/operators', async (req, res) => {

  try {

    const result =
      await db.query(
        `
        SELECT
          id,
          name,
          wallet_id,
          wallet_balance,
          vault_balance,
          mined_total,
          hash_power
        FROM operators
        ORDER BY created_at DESC
        `
      );

    res.json(result.rows);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});

app.get('/api/ledger', async (req, res) => {

  try {

    const result =
      await db.query(
        `
        SELECT *
        FROM ledger
        ORDER BY created_at DESC
        LIMIT 100
        `
      );

    res.json(result.rows);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});

app.listen(PORT, () => {

  console.log(
    `🌐 Backend API running on port ${PORT}`
  );

});
