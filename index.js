require('dotenv').config();
const { Telegraf } = require('telegraf');
const fs = require('fs');
const express = require('express');

// ========================================
// COYOTE RUNNERZ x BL0XCHAIN
// ========================================
const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);

// ========================================
// WEB SERVER
// ========================================
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('🐺 COYOTE RUNNERZ // BL0XCHAIN ONLINE');
});

app.listen(PORT, () => {
  console.log(`🌐 BL0XCHAIN NETWORK running on port ${PORT}`);
});

// ========================================
// DATABASE
// ========================================
const DB_FILE = './users.json';

let users = {};

if (fs.existsSync(DB_FILE)) {
  try {
    users = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    users = {};
  }
}

function saveUsers() {
  fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
}

function getUser(id) {

  id = String(id);

  if (!users[id]) {

    users[id] = {
      balance: 0,
      bank: 0,
      hashRate: 1,
      level: 1,
      xp: 0,
      mined: 0,
      rigs: 1,
      energy: 100,
      walletHistory: [],
      lastMine: 0
    };

    saveUsers();
  }

  return users[id];
}

// ========================================
// BLX MARKET
// ========================================
let blxPrice = 1.00;

setInterval(() => {

  const change =
    (Math.random() * 0.20) - 0.10;

  blxPrice =
    Math.max(0.10, blxPrice + change);

  console.log(
    `💱 BLX PRICE: $${blxPrice.toFixed(2)}`
  );

}, 60000);

// ========================================
// RIG MARKET
// ========================================
const rigs = {

  starter: {
    name: 'Starter GPU Rig',
    cost: 250,
    hash: 5
  },

  advanced: {
    name: 'Advanced Mining Rig',
    cost: 1000,
    hash: 20
  },

  quantum: {
    name: 'Quantum ASIC Node',
    cost: 5000,
    hash: 100
  }

};

// ========================================
// START
// ========================================
bot.start((ctx) => {

  getUser(ctx.from.id);

  ctx.reply(`
🐺 COYOTE RUNNERZ

⛏ BL0XCHAIN NETWORK
Powered by •[BL🔐X]•SL0TS•

🌐 Decentralized Mining
🔐 Secure Vault Infrastructure
🏦 Cold Storage Systems
⚡ Blockchain Nodes Active

━━━━━━━━━━━━━━━━━━

COMMANDS

⛏ MINING
/mine
/hashrate
/stats

💰 WALLET
/wallet
/vault
/bank
/deposit amount
/withdraw amount
/send userid amount

🌐 NETWORK
/network
/price
/pool
/nodes

🖥 RIGS
/rigs
/buystarter
/buyadvanced
/buyquantum

📜 SYSTEM
/help
  `);

});

// ========================================
// HELP
// ========================================
bot.command('help', (ctx) => {

  ctx.reply(`
📜 BL0XCHAIN COMMANDS
━━━━━━━━━━━━━━━━━━

⛏ MINING
/mine
/hashrate
/stats

💰 WALLET
/wallet
/vault
/bank
/deposit amount
/withdraw amount
/send userid amount

🌐 NETWORK
/network
/price
/pool
/nodes

🖥 RIGS
/rigs
/buystarter
/buyadvanced
/buyquantum
  `);

});

// ========================================
// WALLET
// ========================================
bot.command('wallet', (ctx) => {

  const user = getUser(ctx.from.id);

  ctx.reply(`
💰 BL0XCHAIN WALLET
━━━━━━━━━━━━━━━━━━

👤 ${ctx.from.first_name}

💵 Wallet:
${Number(user.balance).toFixed(2)} BLX

🏦 Cold Storage:
${Number(user.bank).toFixed(2)} BLX

⚡ Hash Rate:
${user.hashRate}

🖥 Active Rigs:
${user.rigs}

🎖 Level:
${user.level}

⛏ Total Mined:
${Number(user.mined).toFixed(2)} BLX
  `);

});

// ========================================
// VAULT
// ========================================
bot.command('vault', (ctx) => {

  const user = getUser(ctx.from.id);

  const totalAssets =
    Number(user.balance) +
    Number(user.bank);

  ctx.reply(`
🔐 BL0X VAULT
━━━━━━━━━━━━━━━━━━

🐺 COYOTE RUNNERZ SECURE STORAGE

💵 Wallet:
${Number(user.balance).toFixed(2)} BLX

🏦 Cold Storage:
${Number(user.bank).toFixed(2)} BLX

💎 Total Assets:
${totalAssets.toFixed(2)} BLX

🔐 Encryption:
ACTIVE

🛡 Security:
MILITARY GRADE
  `);

});

// ========================================
// MINE
// ========================================
bot.command('mine', (ctx) => {

  const user = getUser(ctx.from.id);

  const now = Date.now();
  const cooldown = 10000;

  if (now - user.lastMine < cooldown) {

    const wait = Math.ceil(
      (cooldown - (now - user.lastMine)) / 1000
    );

    return ctx.reply(
      `⏳ Mining cooldown active.\nWait ${wait} seconds.`
    );
  }

  const reward = Number(
    (
      (Math.random() * 5)
      + user.hashRate
      + (user.level * 0.5)
    ).toFixed(2)
  );

  user.balance += reward;
  user.mined += reward;
  user.xp += 10;
  user.lastMine = now;

  user.walletHistory.push(
    `+${reward} BLX mined`
  );

  if (user.xp >= user.level * 100) {

    user.level += 1;
    user.hashRate += 2;
    user.energy += 10;
    user.xp = 0;

    ctx.reply(`
🚀 NODE LEVEL INCREASED
━━━━━━━━━━━━━━━━━━

🎖 Level:
${user.level}

⚡ Hash Rate:
${user.hashRate}
    `);
  }

  saveUsers();

  ctx.reply(`
⛏ BLOCK SUCCESSFULLY MINED
━━━━━━━━━━━━━━━━━━

💰 Reward:
${reward} BLX

💵 Wallet:
${Number(user.balance).toFixed(2)} BLX

⚡ Hash Rate:
${user.hashRate}

🖥 Active Rigs:
${user.rigs}
  `);

});

// ========================================
// HASHRATE
// ========================================
bot.command('hashrate', (ctx) => {

  const user = getUser(ctx.from.id);

  ctx.reply(`
⚡ HASHRATE REPORT
━━━━━━━━━━━━━━━━━━

⚡ Current Hash Rate:
${user.hashRate}

🖥 Active Rigs:
${user.rigs}

🔋 Energy:
${user.energy}%

🎖 Level:
${user.level}
  `);

});

// ========================================
// STATS
// ========================================
bot.command('stats', (ctx) => {

  const user = getUser(ctx.from.id);

  ctx.reply(`
📊 NODE STATS
━━━━━━━━━━━━━━━━━━

⛏ Total Mined:
${Number(user.mined).toFixed(2)} BLX

💵 Wallet:
${Number(user.balance).toFixed(2)} BLX

🏦 Cold Storage:
${Number(user.bank).toFixed(2)} BLX

⚡ Hash Rate:
${user.hashRate}

🖥 Mining Rigs:
${user.rigs}

🎖 Level:
${user.level}

⭐ XP:
${user.xp}/${user.level * 100}
  `);

});

// ========================================
// NETWORK
// ========================================
bot.command('network', (ctx) => {

  ctx.reply(`
🌐 COYOTE RUNNERZ NETWORK
━━━━━━━━━━━━━━━━━━

🟢 Status:
ONLINE

⛏ BL0XCHAIN:
ACTIVE

🔐 Encryption:
ENABLED

⚡ Blockchain Stability:
OPTIMAL

🌍 Active Miners:
${Object.keys(users).length}

💱 BLX Value:
$${blxPrice.toFixed(2)}
  `);

});

// ========================================
// POOL
// ========================================
bot.command('pool', (ctx) => {

  ctx.reply(`
🌐 BL0XCHAIN MINING POOL
━━━━━━━━━━━━━━━━━━

🟢 Pool Status:
ACTIVE

⚡ Pool Hashing:
STABLE

🌍 Connected Miners:
${Object.keys(users).length}

🔗 Synchronization:
ONLINE
  `);

});

// ========================================
// NODES
// ========================================
bot.command('nodes', (ctx) => {

  ctx.reply(`
🖥 BL0XCHAIN NODE GRID
━━━━━━━━━━━━━━━━━━

🟢 Core Nodes:
ONLINE

⚡ Validation Layer:
ACTIVE

🔐 Encryption Nodes:
STABLE

🌍 Distributed Infrastructure:
CONNECTED
  `);

});

// ========================================
// PRICE
// ========================================
bot.command('price', (ctx) => {

  ctx.reply(`
💱 BLX MARKET VALUE
━━━━━━━━━━━━━━━━━━

1 BLX =
$${blxPrice.toFixed(2)}
  `);

});

// ========================================
// RIG MARKET
// ========================================
bot.command('rigs', (ctx) => {

  ctx.reply(`
🖥 MINING RIG MARKET
━━━━━━━━━━━━━━━━━━

/buystarter
Starter GPU Rig
💰 250 BLX
⚡ +5 Hash Rate

/buyadvanced
Advanced Mining Rig
💰 1000 BLX
⚡ +20 Hash Rate

/buyquantum
Quantum ASIC Node
💰 5000 BLX
⚡ +100 Hash Rate
  `);

});

// ========================================
// BUY FUNCTION
// ========================================
function buyRig(ctx, rigKey) {

  const user = getUser(ctx.from.id);

  const rig = rigs[rigKey];

  if (user.balance < rig.cost) {

    return ctx.reply(
      `❌ Need ${rig.cost} BLX`
    );
  }

  user.balance -= rig.cost;
  user.hashRate += rig.hash;
  user.rigs += 1;

  saveUsers();

  ctx.reply(`
✅ RIG DEPLOYED
━━━━━━━━━━━━━━━━━━

🖥 ${rig.name}

⚡ Hash Rate:
${user.hashRate}

🖥 Total Rigs:
${user.rigs}

💵 Wallet:
${Number(user.balance).toFixed(2)} BLX
  `);

}

bot.command('buystarter', (ctx) => {
  buyRig(ctx, 'starter');
});

bot.command('buyadvanced', (ctx) => {
  buyRig(ctx, 'advanced');
});

bot.command('buyquantum', (ctx) => {
  buyRig(ctx, 'quantum');
});

// ========================================
// BANK
// ========================================
bot.command('bank', (ctx) => {

  const user = getUser(ctx.from.id);

  ctx.reply(`
🏦 BL0XCHAIN COLD STORAGE
━━━━━━━━━━━━━━━━━━

💵 Wallet:
${Number(user.balance).toFixed(2)} BLX

🔐 Secure Vault:
${Number(user.bank).toFixed(2)} BLX

COMMANDS

/deposit amount
/withdraw amount
  `);

});

// ========================================
// DEPOSIT
// ========================================
bot.command('deposit', (ctx) => {

  const user = getUser(ctx.from.id);

  const amount = Number(
    ctx.message.text.split(' ')[1]
  );

  if (!amount || amount <= 0) {
    return ctx.reply(
      'Use: /deposit amount'
    );
  }

  if (user.balance < amount) {
    return ctx.reply(
      '❌ Insufficient wallet balance'
    );
  }

  user.balance -= amount;
  user.bank += amount;

  saveUsers();

  ctx.reply(`
🏦 DEPOSIT SUCCESSFUL
━━━━━━━━━━━━━━━━━━

🔐 Vault:
${Number(user.bank).toFixed(2)} BLX
  `);

});

// ========================================
// WITHDRAW
// ========================================
bot.command('withdraw', (ctx) => {

  const user = getUser(ctx.from.id);

  const amount = Number(
    ctx.message.text.split(' ')[1]
  );

  if (!amount || amount <= 0) {
    return ctx.reply(
      'Use: /withdraw amount'
    );
  }

  if (user.bank < amount) {
    return ctx.reply(
      '❌ Insufficient vault balance'
    );
  }

  user.bank -= amount;
  user.balance += amount;

  saveUsers();

  ctx.reply(`
🏦 WITHDRAWAL SUCCESSFUL
━━━━━━━━━━━━━━━━━━

💵 Wallet:
${Number(user.balance).toFixed(2)} BLX
  `);

});

// ========================================
// SEND
// ========================================
bot.command('send', (ctx) => {

  const sender = getUser(ctx.from.id);

  const args = ctx.message.text.split(' ');

  const receiverId = args[1];
  const amount = Number(args[2]);

  if (!receiverId || !amount) {

    return ctx.reply(
      'Use: /send userid amount'
    );
  }

  if (sender.balance < amount) {

    return ctx.reply(
      '❌ Insufficient BLX'
    );
  }

  const receiver = getUser(receiverId);

  sender.balance -= amount;
  receiver.balance += amount;

  saveUsers();

  ctx.reply(`
💸 TRANSFER COMPLETE
━━━━━━━━━━━━━━━━━━

Sent:
${amount} BLX

To:
${receiverId}

💵 Wallet:
${Number(sender.balance).toFixed(2)} BLX
  `);

});

// ========================================
// LAUNCH
// ========================================
bot.launch();

console.log('🐺 COYOTE RUNNERZ // BL0XCHAIN ONLINE');

// ========================================
// SAFE STOP
// ========================================
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
