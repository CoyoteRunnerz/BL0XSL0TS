const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../db/database');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { operatorId, password } = req.body;

    if (!operatorId || !password) {
      return res.status(400).json({
        error: 'operatorId and password required'
      });
    }

    const result = await db.query(
      'SELECT * FROM operators WHERE id = $1',
      [operatorId]
    );

    if (!result.rows.length) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    const operator = result.rows[0];

    const storedHash =
      operator.password_hash ||
      process.env.ADMIN_PASSWORD_HASH;

    if (!storedHash) {
      return res.status(500).json({
        error: 'No password hash configured'
      });
    }

    const valid = await bcrypt.compare(password, storedHash);

    if (!valid) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      {
        id: operator.id,
        walletId: operator.wallet_id,
        role:
          String(operator.id) === String(process.env.ADMIN_ID)
            ? 'admin'
            : 'operator'
      },
      process.env.JWT_SECRET || 'change-this-secret',
      { expiresIn: '12h' }
    );

    res.json({
      token,
      operator: {
        id: operator.id,
        name: operator.name,
        walletId: operator.wallet_id
      }
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;
