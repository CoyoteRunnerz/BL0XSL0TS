const db = require('./database');

async function upsertOperator(user) {
  await db.query(
    `
    INSERT INTO operators (
      id,
      name,
      wallet_id,
      wallet_balance,
      vault_balance,
      mined_total,
      hash_power,
      security_level
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    ON CONFLICT (id)
    DO UPDATE SET
      name = EXCLUDED.name,
      wallet_balance = EXCLUDED.wallet_balance,
      vault_balance = EXCLUDED.vault_balance,
      mined_total = EXCLUDED.mined_total,
      hash_power = EXCLUDED.hash_power,
      security_level = EXCLUDED.security_level
    `,
    [
      user.operatorId,
      user.name,
      user.walletId,
      user.balance,
      user.vault,
      user.minedTotal,
      user.hashPower,
      user.securityLevel
    ]
  );
}

async function insertLedger(tx) {
  await db.query(
    `
    INSERT INTO ledger (
      id,
      operator_id,
      type,
      amount,
      status,
      metadata
    )
    VALUES ($1,$2,$3,$4,$5,$6)
    ON CONFLICT (id) DO NOTHING
    `,
    [
      tx.id,
      tx.operatorId,
      tx.type,
      tx.amount,
      tx.status,
      tx.meta || {}
    ]
  );
}

module.exports = {
  upsertOperator,
  insertLedger
};

