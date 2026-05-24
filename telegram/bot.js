require('dotenv').config();

const { Telegraf, Markup } = require('telegraf');
const express = require('express');
const db = require('../db/database')
const store = require('./db/store');

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID || '';
const PORT = process.env.PORT || 3000;

if (!BOT_TOKEN) {
  console.error('❌ Missing BOT_TOKEN in .env');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const app = express();

let blxPrice = 0.4827;

function money(n) {
  return Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  });
}

function walletId() {
  return `BLX-${Math.floor(Math.random() * 999999999)}`;
}

async function profile(ctx) {
  const id = String(ctx.from.id);

  const found = await db.query(
    'SELECT * FROM operators WHERE id = $1',
    [id]
  );

  if (found.rows.length) {
    const row = found.rows[0];

    return {
      operatorId: row.id,
      name: row.name,
      walletId: row.wallet_id,
      balance: Number(row.wallet_balance),
      vault: Number(row.vault_balance),
      minedTotal: Number(row.mined_total),
      hashPower: Number(row.hash_power),
      securityLevel: row.security_level
    };
  }

  const user = {
    operatorId: id,
    name: ctx.from.first_name || 'Coyote Runner',
    walletId: walletId(),
    balance: 0,
    vault: 0,
    minedTotal: 0,
    hashPower: 1,
    securityLevel: 'STANDARD'
  };

  await store.upsertOperator(user);
  return user;
}

async function saveOperator(u) {
  await store.upsertOperator(u);
}

async function recordLedger(type, operatorId, amount, meta = {}) {
  const tx = {
    id: `TX-${Date.now()}-${Math.floor(Math.random() * 99999)}`,
    type,
    operatorId,
    amount,
    meta,
    status: 'RECORDED'
  };

  await store.insertLedger(tx);
  return tx;
}

function dashboardMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('⛏ Mining Operations', 'mine'), Markup.button.callback('💼 Wallet', 'wallet')],
    [Markup.button.callback('🏦 Bank Safe', 'vault'), Markup.button.callback('🌐 Network', 'network')],
    [Markup.button.callback('🛡 Security', 'security'), Markup.button.callback('📊 Market', 'market')],
    [Markup.button.callback('📒 Ledger', 'ledger'), Markup.button.callback('❓ Help', 'help')]
  ]);
}

bot.start(async (ctx) => {
  const u = await profile(ctx);

  ctx.reply(`
[BL🔐X]•SL0TS
SECURE CRYPTO OPERATIONS NETWORK

Operator: ${u.name}
Operator ID: ${u.operatorId}
Wallet ID: ${u.walletId}

🌐 [BL🔐X]•CHAIN ONLINE
🔥 Coyote’z Burner ACTIVE
🏦 Coyote’z Bank Safe SECURED
💼 Runner’z Wallet CONNECTED
`, dashboardMenu());
});

bot.command('dashboard', async (ctx) => {
  const u = await profile(ctx);

  ctx.reply(`
📡 OPERATOR DASHBOARD

Operator: ${u.name}
Wallet Holdings: ${money(u.balance)} BLX
Secured Storage: ${money(u.vault)} BLX
Total Mining Output: ${money(u.minedTotal)} BLX
Hash-Power Allocation: ${u.hashPower.toFixed(2)} EH/s
`, dashboardMenu());
});

bot.command('mine', async (ctx) => {
  const u = await profile(ctx);
  const yieldAmount = Number((Math.random() * u.hashPower + 0.35).toFixed(4));

  u.balance += yieldAmount;
  u.minedTotal += yieldAmount;

  await saveOperator(u);

  const tx = await recordLedger('MINING_YIELD', u.operatorId, yieldAmount, {
    walletId: u.walletId,
    layer: 'Coyote’z Burner'
  });

  ctx.reply(`
⛏ MINING OPERATION COMPLETE

Mining Yield: +${yieldAmount} BLX
Wallet Holdings: ${money(u.balance)} BLX
Total Mining Output: ${money(u.minedTotal)} BLX
Hash-Power Allocation: ${u.hashPower.toFixed(2)} EH/s
Ledger ID: ${tx.id}
Status: CONFIRMED
`);
});

bot.command('wallet', async (ctx) => {
  const u = await profile(ctx);

  ctx.reply(`
💼 RUNNER’Z WALLET

Wallet ID: ${u.walletId}
Wallet Holdings: ${money(u.balance)} BLX
Secured Storage: ${money(u.vault)} BLX
Estimated Monitor Value: $${money(u.balance * blxPrice)}

Commands:
/deposit 10
/withdraw 5
/transfer 2 @operator
/ledger
`);
});

bot.command('vault', async (ctx) => {
  const u = await profile(ctx);

  ctx.reply(`
🏦 COYOTE’Z BANK SAFE

Secured Storage: ${money(u.vault)} BLX
Security Level: ${u.securityLevel}
Encryption Layer: ACTIVE
Withdrawal Access: ENABLED
`);
});

bot.command('deposit', async (ctx) => {
  const u = await profile(ctx);
  const amount = Number(ctx.message.text.split(' ')[1]);

  if (!amount || amount <= 0) return ctx.reply('Use: /deposit 10');
  if (u.balance < amount) return ctx.reply('Insufficient wallet holdings.');

  u.balance -= amount;
  u.vault += amount;

  await saveOperator(u);

  const tx = await recordLedger('VAULT_DEPOSIT', u.operatorId, amount, {
    walletId: u.walletId,
    storage: 'Coyote’z Bank Safe'
  });

  ctx.reply(`
🏦 SECURED STORAGE DEPOSIT COMPLETE

Amount: ${money(amount)} BLX
Ledger ID: ${tx.id}
Wallet Holdings: ${money(u.balance)} BLX
Secured Storage: ${money(u.vault)} BLX
`);
});

bot.command('withdraw', async (ctx) => {
  const u = await profile(ctx);
  const amount = Number(ctx.message.text.split(' ')[1]);

  if (!amount || amount <= 0) return ctx.reply('Use: /withdraw 10');
  if (u.vault < amount) return ctx.reply('Insufficient secured storage holdings.');

  u.vault -= amount;
  u.balance += amount;

  await saveOperator(u);

  const tx = await recordLedger('VAULT_WITHDRAWAL', u.operatorId, amount, {
    walletId: u.walletId,
    storage: 'Coyote’z Bank Safe'
  });

  ctx.reply(`
💼 STORAGE RELEASE COMPLETE

Amount: ${money(amount)} BLX
Ledger ID: ${tx.id}
Wallet Holdings: ${money(u.balance)} BLX
Secured Storage: ${money(u.vault)} BLX
`);
});

bot.command('transfer', async (ctx) => {
  const u = await profile(ctx);
  const parts = ctx.message.text.split(' ');
  const amount = Number(parts[1]);
  const target = parts[2] || 'external-operator';

  if (!amount || amount <= 0) return ctx.reply('Use: /transfer 5 @operator');
  if (u.balance < amount) return ctx.reply('Insufficient wallet holdings.');

  u.balance -= amount;

  await saveOperator(u);

  const tx = await recordLedger('OPERATOR_TRANSFER', u.operatorId, amount, {
    fromWallet: u.walletId,
    destination: target
  });

  ctx.reply(`
🔁 TRANSFER RECORD CREATED

Amount: ${money(amount)} BLX
Destination: ${target}
Ledger ID: ${tx.id}
Status: RECORDED
Remaining Wallet Holdings: ${money(u.balance)} BLX
`);
});

bot.command('ledger', async (ctx) => {
  const u = await profile(ctx);

  const rows = await db.query(
    `
    SELECT id, type, amount, status, created_at
    FROM ledger
    WHERE operator_id = $1
    ORDER BY created_at DESC
    LIMIT 5
    `,
    [u.operatorId]
  );

  if (!rows.rows.length) return ctx.reply('No ledger records found.');

  const output = rows.rows.map((tx) => `
${tx.id}
Type: ${tx.type}
Amount: ${money(tx.amount)} BLX
Status: ${tx.status}
Time: ${tx.created_at}
`).join('\n');

  ctx.reply(`📒 RECENT LEDGER RECORDS\n${output}`);
});

bot.command('network', (ctx) => {
  ctx.reply(`
🌐 [BL🔐X]•CHAIN NETWORK

Status: ONLINE
Global Nodes: 8,781
Countries Connected: 197
Uptime: 99.98%
Mining Operations Layer: Coyote’z Burner
Secured Storage Layer: Coyote’z Bank Safe
Wallet Layer: Runner’z Wallet
Ledger Layer: POSTGRESQL ACTIVE
`);
});

bot.command('security', (ctx) => {
  ctx.reply(`
🛡 CYBER SECURITY CENTER

Threat Scan: CLEAR
Vault Encryption: ACTIVE
Transfer Monitoring: ENABLED
Operator Verification: ACTIVE
Network Shield: ONLINE
Ledger Integrity: POSTGRESQL ACTIVE
`);
});

bot.command('market', (ctx) => {
  ctx.reply(`
📊 BLX MARKET MONITOR

BLX Monitor Price: $${blxPrice.toFixed(4)}
24H Network Movement: +2.48%
Mining Yield Engine: ACTIVE
Market Feed: INTERNAL MONITOR
`);
});

bot.command('status', (ctx) => {
  ctx.reply(`
📡 SYSTEM STATUS

[BL🔐X]•SL0TS: ONLINE
[BL🔐X]•CHAIN: ONLINE
Coyote’z Burner: ACTIVE
Coyote’z Bank Safe: SECURE
Runner’z Wallet: ONLINE
Ledger Layer: POSTGRESQL
Cyber Security: ACTIVE
Server Port: ${PORT}
`);
});

bot.command('admin', async (ctx) => {
  if (String(ctx.from.id) !== String(ADMIN_ID)) {
    return ctx.reply('Admin access denied.');
  }

  const operators = await db.query('SELECT COUNT(*) FROM operators');
  const ledger = await db.query('SELECT COUNT(*) FROM ledger');

  ctx.reply(`
OWNER CONTROL PANEL

Registered Operators: ${operators.rows[0].count}
Ledger Records: ${ledger.rows[0].count}
BLX Monitor Price: $${blxPrice.toFixed(4)}
Database: POSTGRESQL
System Status: ONLINE
`);
});

bot.command('help', (ctx) => {
  ctx.reply(`
[BL🔐X]•SL0TS COMMAND CENTER

/start
/dashboard
/mine
/wallet
/vault
/deposit amount
/withdraw amount
/transfer amount @operator
/ledger
/network
/security
/market
/status
/admin
/help
`);
});

bot.action('mine', (ctx) => ctx.reply('/mine'));
bot.action('wallet', (ctx) => ctx.reply('/wallet'));
bot.action('vault', (ctx) => ctx.reply('/vault'));
bot.action('network', (ctx) => ctx.reply('/network'));
bot.action('security', (ctx) => ctx.reply('/security'));
bot.action('market', (ctx) => ctx.reply('/market'));
bot.action('ledger', (ctx) => ctx.reply('/ledger'));
bot.action('help', (ctx) => ctx.reply('/help'));

bot.telegram.setMyCommands([
  { command: 'start', description: 'Open operator dashboard' },
  { command: 'dashboard', description: 'View operations dashboard' },
  { command: 'mine', description: 'Execute mining operation' },
  { command: 'wallet', description: 'View Runner’z Wallet' },
  { command: 'vault', description: 'View secured storage' },
  { command: 'ledger', description: 'View transfer ledger' },
  { command: 'network', description: 'View network status' },
  { command: 'security', description: 'Open cyber security center' },
  { command: 'market', description: 'View BLX market monitor' },
  { command: 'status', description: 'View system status' },
  { command: 'help', description: 'Open command center' }
]).catch((err) => {
  console.log('⚠️ Telegram command menu sync skipped:', err.code || err.message);
});

setInterval(() => {
  const change = (Math.random() - 0.45) * 0.015;
  blxPrice = Math.max(0.05, Number((blxPrice + change).toFixed(4)));
  console.log(`💱 BLX monitor price updated: $${blxPrice}`);
}, 60000);

setInterval(async () => {
  try {
    const result = await db.query('SELECT * FROM operators');

    for (const row of result.rows) {
      const u = {
        operatorId: row.id,
        name: row.name,
        walletId: row.wallet_id,
        balance: Number(row.wallet_balance),
        vault: Number(row.vault_balance),
        minedTotal: Number(row.mined_total),
        hashPower: Number(row.hash_power),
        securityLevel: row.security_level
      };

      const passiveYield = Number((0.025 * u.hashPower).toFixed(4));

      if (passiveYield > 0) {
        u.balance += passiveYield;
        u.minedTotal += passiveYield;

        await saveOperator(u);

        await recordLedger('PASSIVE_MINING_YIELD', u.operatorId, passiveYield, {
          walletId: u.walletId,
          layer: 'Coyote’z Burner',
          mode: 'PASSIVE_OPERATION'
        });
      }
    }

    console.log('⛏ Passive mining operation completed');
  } catch (err) {
    console.log('⚠️ Passive mining skipped:', err.message);
  }
}, 300000);

app.get('/', (req, res) => {
  res.send('[BL🔐X]•SL0TS // COYOTE’Z NETWORK ONLINE');
});

app.get('/status', async (req, res) => {
  const operators = await db.query('SELECT COUNT(*) FROM operators');
  const ledger = await db.query('SELECT COUNT(*) FROM ledger');

  res.json({
    platform: '[BL🔐X]•SL0TS',
    chain: '[BL🔐X]•CHAIN',
    miningLayer: 'Coyote’z Burner',
    bankSafe: 'SECURE',
    walletLayer: 'Runner’z Wallet',
    database: 'POSTGRESQL',
    operators: operators.rows[0].count,
    ledgerRecords: ledger.rows[0].count,
    blxMonitorPrice: blxPrice,
    uptime: process.uptime()
  });
});

bot.launch();

app.listen(PORT, () => {
  console.log('🐺 COYOTE RUNNERZ // BL0XCHAIN ONLINE');
  console.log('⛓ [BL🔐X]•CHAIN ACTIVE');
  console.log('🔥 Coyote’z Burner MINING OPERATIONS ONLINE');
  console.log('📒 PostgreSQL ledger layer ACTIVE');
  console.log(`🌐 [BL🔐X]•SL0TS running on port ${PORT}`);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
