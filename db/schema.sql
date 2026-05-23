CREATE TABLE IF NOT EXISTS operators (
  id TEXT PRIMARY KEY,
  name TEXT,
  wallet_id TEXT UNIQUE,
  wallet_balance NUMERIC DEFAULT 0,
  vault_balance NUMERIC DEFAULT 0,
  mined_total NUMERIC DEFAULT 0,
  hash_power NUMERIC DEFAULT 1,
  security_level TEXT DEFAULT 'STANDARD',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ledger (
  id TEXT PRIMARY KEY,
  operator_id TEXT REFERENCES operators(id),
  type TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'RECORDED',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ledger_operator_id
ON ledger(operator_id);

CREATE INDEX IF NOT EXISTS idx_ledger_created_at
ON ledger(created_at);
