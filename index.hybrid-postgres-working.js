require('dotenv').config();

const { Telegraf, Markup } = require('telegraf');
const express = require('express');
const fs = require('fs');
const path = require('path');
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

const DATA_FILE = path.join(__dirname, 'users.json');
const DATA_DIR = path.join(__dirname, 'data');
const LEDGER_FILE = path.join(DATA_DIR, 'ledger.json');

let users = {};
let ledger = [];
let blxPrice = 0.4827;

function ensureFiles() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '{}');
  if (!fs.existsSync(LEDGER_FILE)) fs.writeFileSync(LEDGER_FILE, '[]');
}

function loadData() {
  ensureFiles();
  users = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  ledger = JSON.parse(fs.readFileSync(LEDGER_FILE, 'utf8'));
}

function saveUsers() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
}

function saveLedger() {
  fs.writeFileSync(LEDGER_FILE, JSON.stringify(ledger, null, 2));
}

function money(n) {
  return Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  });
}

function profile(ctx) {
  const id = String(ctx.from.id);

  if (!users[id]) {
    users[id] = {
      operatorId: id,
      name: ctx.from.first_name || 'Coyote Runner',
      walletId: `BLX-${Math.floor(Math.random() * 999999999)}`,
      balance: 0,
      vault: 0,
      minedTotal: 0,
      hashPower: 1,
      securityLevel: 'STANDARD',
      transfers: [],
      createdAt: new Date().toISOString()
    };

    saveUsers();
  }

store.upsertOperator(users[id]).catch(console.error);

  return users[id];
}

function recordLedger(type, operatorId, amount, meta = {}) {
  const tx = {
    id: `TX-${Date.now()}-${Math.floor(Math.random() * 99999)}`,
    type,
    operatorId,
    amount,
    meta,
    status: 'RECORDED',
    time: new Date().toISOString()
  };

  ledger.push(tx);
  saveLedger();
store.insertLedger(tx).catch(console.error);
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

bot.start((ctx) => {
  const u = profile(ctx);

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

bot.command('dashboard', (ctx) => {
  const u = profile(ctx);

  ctx.reply(`
📡 OPERATOR DASHBOARD

Operator: ${u.name}
Wallet Holdings: ${money(u.balance)} BLX
Secured Storage: ${money(u.vault)} BLX
Total Mining Output: ${money(u.minedTotal)} BLX
Hash-Power Allocation: ${u.hashPower.toFixed(2)} EH/s
`, dashboardMenu());
});

bot.command('mine', (ctx) => {
  const u = profile(ctx);
  const yieldAmount = Number((Math.random() * u.hashPower + 0.35).toFixed(4));

  u.balance += yieldAmount;
  u.minedTotal += yieldAmount;

  const tx = recordLedger('MINING_YIELD', u.operatorId, yieldAmount, {
    walletId: u.walletId,
    layer: 'Coyote’z Burner'
  });

  saveUsers();

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

bot.command('wallet', (ctx) => {
  const u = profile(ctx);

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

bot.command('vault', (ctx) => {
  const u = profile(ctx);

  ctx.reply(`
🏦 COYOTE’Z BANK SAFE

Secured Storage: ${money(u.vault)} BLX
Security Level: ${u.securityLevel}
Encryption Layer: ACTIVE
Withdrawal Access: ENABLED
`);
});

bot.command('deposit', (ctx) => {
  const u = profile(ctx);
  const amount = Number(ctx.message.text.split(' ')[1]);

  if (!amount || amount <= 0) return ctx.reply('Use: /deposit 10');
  if (u.balance < amount) return ctx.reply('Insufficient wallet holdings.');

  u.balance -= amount;
  u.vault += amount;

  const tx = recordLedger('VAULT_DEPOSIT', u.operatorId, amount, {
    walletId: u.walletId,
    storage: 'Coyote’z Bank Safe'
  });

  saveUsers();

  ctx.reply(`
🏦 SECURED STORAGE DEPOSIT COMPLETE

Amount: ${money(amount)} BLX
Ledger ID: ${tx.id}
Wallet Holdings: ${money(u.balance)} BLX
Secured Storage: ${money(u.vault)} BLX
`);
});

bot.command('withdraw', (ctx) => {
  const u = profile(ctx);
  const amount = Number(ctx.message.text.split(' ')[1]);

  if (!amount || amount <= 0) return ctx.reply('Use: /withdraw 10');
  if (u.vault < amount) return ctx.reply('Insufficient secured storage holdings.');

  u.vault -= amount;
  u.balance += amount;

  const tx = recordLedger('VAULT_WITHDRAWAL', u.operatorId, amount, {
    walletId: u.walletId,
    storage: 'Coyote’z Bank Safe'
  });

  saveUsers();

  ctx.reply(`
💼 STORAGE RELEASE COMPLETE

Amount: ${money(amount)} BLX
Ledger ID: ${tx.id}
Wallet Holdings: ${money(u.balance)} BLX
Secured Storage: ${money(u.vault)} BLX
`);
});

bot.command('transfer', (ctx) => {
  const u = profile(ctx);
  const parts = ctx.message.text.split(' ');
  const amount = Number(parts[1]);
  const target = parts[2] || 'external-operator';

  if (!amount || amount <= 0) return ctx.reply('Use: /transfer 5 @operator');
  if (u.balance < amount) return ctx.reply('Insufficient wallet holdings.');

  u.balance -= amount;

  const tx = recordLedger('OPERATOR_TRANSFER', u.operatorId, amount, {
    fromWallet: u.walletId,
    destination: target
  });

  u.transfers.push(tx);
  saveUsers();

  ctx.reply(`
🔁 TRANSFER RECORD CREATED

Amount: ${money(amount)} BLX
Destination: ${target}
Ledger ID: ${tx.id}
Status: RECORDED
Remaining Wallet Holdings: ${money(u.balance)} BLX
`);
});

bot.command('ledger', (ctx) => {
  const u = profile(ctx);

  const records = ledger
    .filter((tx) => tx.operatorId === u.operatorId)
    .slice(-5)
    .reverse();

  if (!records.length) return ctx.reply('No ledger records found.');

  const output = records.map((tx) => `
${tx.id}
Type: ${tx.type}
Amount: ${money(tx.amount)} BLX
Status: ${tx.status}
Time: ${tx.time}
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
Ledger Layer: ACTIVE
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
Ledger Integrity: ACTIVE
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
Ledger Layer: ACTIVE
Cyber Security: ACTIVE
Server Port: ${PORT}
`);
});

bot.command('admin', (ctx) => {
  if (String(ctx.from.id) !== String(ADMIN_ID)) {
    return ctx.reply('Admin access denied.');
  }

  ctx.reply(`
OWNER CONTROL PANEL

Registered Operators: ${Object.keys(users).length}
Ledger Records: ${ledger.length}
BLX Monitor Price: $${blxPrice.toFixed(4)}
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

setInterval(() => {
  Object.keys(users).forEach((id) => {
    const u = users[id];

    const passiveYield = Number(
      (0.025 * u.hashPower).toFixed(4)
    );

    if (passiveYield > 0) {
      u.balance += passiveYield;
      u.minedTotal += passiveYield;

      recordLedger('PASSIVE_MINING_YIELD', u.operatorId, passiveYield, {
        walletId: u.walletId,
        layer: 'Coyote’z Burner',
        mode: 'PASSIVE_OPERATION'
      });
    }
  });

  saveUsers();

  console.log('⛏ Passive mining operation completed');
}, 300000);

app.get('/', (req, res) => {
  res.send('[BL🔐X]•SL0TS // COYOTE’Z NETWORK ONLINE');
});

app.get('/status', (req, res) => {
  res.json({
    platform: '[BL🔐X]•SL0TS',
    chain: '[BL🔐X]•CHAIN',
    miningLayer: 'Coyote’z Burner',
    bankSafe: 'SECURE',
    walletLayer: 'Runner’z Wallet',
    ledgerRecords: ledger.length,
    operators: Object.keys(users).length,
    blxMonitorPrice: blxPrice,
    uptime: process.uptime()
  });
});

loadData();

bot.launch();

app.listen(PORT, () => {
  console.log('🐺 COYOTE RUNNERZ // BL0XCHAIN ONLINE');
  console.log('⛓ [BL🔐X]•CHAIN ACTIVE');
  console.log('🔥 Coyote’z Burner MINING OPERATIONS ONLINE');
  console.log('📒 Ledger layer ACTIVE');
  console.log(`🌐 [BL🔐X]•SL0TS running on port ${PORT}`);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
