const { Telegraf } = require('telegraf');
const fs = require('fs');
const express = require('express');

const bot = new Telegraf(process.env.BOT_TOKEN || '8786690408:AAEEhOE43llVaUjU8FEzvzD3xWBNkxpKf6c');
const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = './users.json';
const ADMIN_ID = '8667679794';

let users = {};
if (fs.existsSync(DATA_FILE)) {
  users = JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveUsers() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
}

const cooldowns = {};

function createUser(id) {
  if (!users[id]) {
    users[id] = {
      balance: 0,
      bank: 0,
      hashPower: 1,
      level: 1,
      xp: 0,
      rig: 'Starter Burner Rig',
      walletAddress: `BLX-${id}`,
      safeLocked: true,
      lastDaily: 0,
      lastSeen: Date.now(),
      securityLevel: 1,
      burnerStatus: 'ONLINE',
      history: []
    };
    saveUsers();
  }

  if (!users[id].history) users[id].history = [];
  if (!users[id].walletAddress) users[id].walletAddress = `BLX-${id}`;
  if (users[id].safeLocked === undefined) users[id].safeLocked = true;
  if (!users[id].securityLevel) users[id].securityLevel = 1;
  if (!users[id].burnerStatus) users[id].burnerStatus = 'ONLINE';

  users[id].lastSeen = Date.now();
  return users[id];
}

function receiptId() {
  return 'BLX-RCPT-' + Math.floor(100000000 + Math.random() * 900000000);
}

function isAdmin(ctx) {
  return String(ctx.from.id) === ADMIN_ID;
}

let blxPrice = 1.00;

setInterval(() => {
  const change = Math.random() * 0.2 - 0.1;
  blxPrice = Math.max(0.10, +(blxPrice + change).toFixed(2));
  console.log(`💱 BLX PRICE: $${blxPrice}`);
}, 300000);

bot.start((ctx) => {
  createUser(ctx.from.id);

  ctx.reply(`
🐺 [BL🔐X]•SL0TS CORE

Welcome, Coyote Runner'z.

━━━━━━━━━━━━━━━━━━
👛 /wallet
Runner'z Wallet access

🏦 /safe
Coyote'z Bank Safe

⛓ /chain
[BL🔐X]•CHAIN operations

🔥 /burner
Coyote'z Burner network

🛡 /help
Command grid
━━━━━━━━━━━━━━━━━━

🌐 [BL🔐X]•SL0TS ONLINE
`);
});

bot.command('help', (ctx) => {
  ctx.reply(`
📡 [BL🔐X]•SL0TS COMMAND GRID

👛 RUNNER'Z WALLET
/wallet
/balance
/history

🏦 COYOTE'Z BANK SAFE
/safe
/deposit
/withdraw
/locksafe
/unlocksafe

⛓ [BL🔐X]•CHAIN
/chain
/mine
/daily
/price
/market

🔥 COYOTE'Z BURNER
/burner
/send USER_ID AMOUNT
/network
/security
/status
/scan
/ping
/stats
/shop
`);
});

bot.command('wallet', (ctx) => {
  const user = createUser(ctx.from.id);

  ctx.reply(`
👛 RUNNER'Z WALLET
powered by [BL🔐X]•SL0TS

Wallet ID:
${user.walletAddress}

Wallet Balance:
${user.balance.toFixed(2)} BLX

🏦 Bank Safe:
${user.bank.toFixed(2)} BLX

Safe:
${user.safeLocked ? '🔒 LOCKED' : '🔓 UNLOCKED'}

/balance
/history
`);
});

bot.command('balance', (ctx) => {
  const user = createUser(ctx.from.id);

  ctx.reply(`
👛 RUNNER'Z BALANCE

Wallet:
${user.balance.toFixed(2)} BLX

🏦 Coyote'z Bank Safe:
${user.bank.toFixed(2)} BLX
`);
});

bot.command('safe', (ctx) => {
  const user = createUser(ctx.from.id);

  ctx.reply(`
🏦 COYOTE'Z BANK SAFE

Stored BLX:
${user.bank.toFixed(2)} BLX

Safe Status:
${user.safeLocked ? '🔒 LOCKED' : '🔓 UNLOCKED'}

Commands:
/deposit
/withdraw
/locksafe
/unlocksafe
`);
});

bot.command('deposit', (ctx) => {
  const user = createUser(ctx.from.id);
  const amount = user.balance;

  if (amount <= 0) return ctx.reply('❌ No BLX available to deposit.');

  user.balance -= amount;
  user.bank += amount;
  user.history.push(`🏦 Deposited ${amount.toFixed(2)} BLX into Coyote'z Bank Safe`);

  saveUsers();

  ctx.reply(`🏦 Deposited ${amount.toFixed(2)} BLX into Coyote'z Bank Safe.`);
});

bot.command('withdraw', (ctx) => {
  const user = createUser(ctx.from.id);

  if (user.safeLocked) return ctx.reply('🔒 Coyote\'z Bank Safe is locked. Use /unlocksafe first.');
  if (user.bank <= 0) return ctx.reply('❌ No BLX stored in Coyote\'z Bank Safe.');

  const amount = user.bank;
  user.bank = 0;
  user.balance += amount;
  user.history.push(`💸 Withdrew ${amount.toFixed(2)} BLX from Coyote'z Bank Safe`);

  saveUsers();

  ctx.reply(`💸 Withdrew ${amount.toFixed(2)} BLX from Coyote'z Bank Safe.`);
});

bot.command('locksafe', (ctx) => {
  const user = createUser(ctx.from.id);
  user.safeLocked = true;
  user.history.push('🔒 Coyote\'z Bank Safe locked');
  saveUsers();
  ctx.reply('🔒 Coyote\'z Bank Safe locked.');
});

bot.command('unlocksafe', (ctx) => {
  const user = createUser(ctx.from.id);
  user.safeLocked = false;
  user.history.push('🔓 Coyote\'z Bank Safe unlocked');
  saveUsers();
  ctx.reply('🔓 Coyote\'z Bank Safe unlocked.');
});

bot.command('chain', (ctx) => {
  ctx.reply(`
⛓ [BL🔐X]•CHAIN PANEL

/mine
Run Chain mining cycle

/daily
Claim daily Coyote Runner'z drop

/price
Current BLX signal

/market
BLX market status
`);
});

bot.command('mine', (ctx) => {
  const id = ctx.from.id;
  const user = createUser(id);
  const now = Date.now();

  if (cooldowns[id] && now - cooldowns[id] < 30000) {
    const remaining = Math.ceil((30000 - (now - cooldowns[id])) / 1000);
    return ctx.reply(`⏳ [BL🔐X]•CHAIN cooldown: ${remaining}s`);
  }

  cooldowns[id] = now;

  const reward = +(Math.random() * user.hashPower).toFixed(2);
  user.balance += reward;
  user.xp += 5;
  user.history.push(`⛓ Mined ${reward} BLX through [BL🔐X]•CHAIN`);

  if (user.xp >= 100) {
    user.level += 1;
    user.hashPower += 1;
    user.xp = 0;
    user.history.push(`🔥 Coyote'z Burner upgraded to level ${user.level}`);
  }

  saveUsers();

  ctx.reply(`
⛓ [BL🔐X]•CHAIN COMPLETE

+${reward} BLX

👛 Wallet:
${user.balance.toFixed(2)} BLX

🔥 Burner Power:
${user.hashPower}

📶 Level:
${user.level}
`);
});

bot.command('daily', (ctx) => {
  const user = createUser(ctx.from.id);
  const now = Date.now();
  const cooldown = 86400000;

  if (now - user.lastDaily < cooldown) {
    const hours = Math.ceil((cooldown - (now - user.lastDaily)) / 3600000);
    return ctx.reply(`⏳ Daily drop already claimed. Try again in ${hours}h.`);
  }

  const reward = 100;
  user.balance += reward;
  user.lastDaily = now;
  user.history.push(`🎁 Claimed daily Coyote Runner'z drop: ${reward} BLX`);

  saveUsers();

  ctx.reply(`
🎁 COYOTE RUNNER'Z DAILY DROP

+${reward} BLX

👛 Wallet:
${user.balance.toFixed(2)} BLX
`);
});

bot.command('price', (ctx) => {
  ctx.reply(`💱 BLX Market Signal: $${blxPrice}`);
});

bot.command('market', (ctx) => {
  const trend = blxPrice >= 1 ? 'BULLISH' : 'VOLATILE';

  ctx.reply(`
💱 BLX MARKET STATUS

Current Price:
$${blxPrice}

Market Trend:
${trend}

⛓ [BL🔐X]•CHAIN ECONOMY ACTIVE
`);
});

bot.command('burner', (ctx) => {
  ctx.reply(`
🔥 COYOTE'Z BURNER PANEL

/send USER_ID AMOUNT
Move BLX through Burner

/network
Burner network status

/security
Security status

/status
Live platform status

/scan
Chain scan

/ping
Burner response check

/stats
Runner stats

/shop
Burner upgrades
`);
});

bot.command('send', (ctx) => {
  const id = ctx.from.id;
  const user = createUser(id);
  const args = ctx.message.text.split(' ');

  if (args.length < 3) return ctx.reply('Usage: /send USER_ID AMOUNT');

  const targetId = args[1];
  const amount = parseFloat(args[2]);

  if (isNaN(amount) || amount <= 0) return ctx.reply('❌ Invalid BLX amount.');
  if (user.balance < amount) return ctx.reply('❌ Not enough BLX in Runner\'z Wallet.');

  const target = createUser(targetId);
  const txid = receiptId();

  user.balance -= amount;
  target.balance += amount;

  user.history.push(`🔥 Sent ${amount.toFixed(2)} BLX to ${targetId} | ${txid}`);
  target.history.push(`🔥 Received ${amount.toFixed(2)} BLX from ${id} | ${txid}`);

  saveUsers();

  ctx.reply(`
🔥 COYOTE'Z BURNER RECEIPT

TX:
${txid}

Sent:
${amount.toFixed(2)} BLX

From:
${id}

To:
${targetId}

Status:
CONFIRMED
`);
});

bot.command('history', (ctx) => {
  const user = createUser(ctx.from.id);

  if (!user.history.length) return ctx.reply('📭 No Coyotez Burner history yet.');

  ctx.reply(`
📜 COYOTEZ BURNER HISTORY

${user.history.slice(-10).join('\n')}
`);
});

bot.command('network', (ctx) => {
  ctx.reply(`
🌐 COYOTE'Z BURNER NETWORK

Coyote Runner'z:
${Object.keys(users).length}

⛓ [BL🔐X]•CHAIN:
ACTIVE

🔥 Burner:
ONLINE

🏦 Bank Safe:
SECURED
`);
});

bot.command('security', (ctx) => {
  const user = createUser(ctx.from.id);

  ctx.reply(`
🛡 COYOTE'Z SECURITY

Security Level:
${user.securityLevel}

Burner Status:
${user.burnerStatus}

Bank Safe:
${user.safeLocked ? 'LOCKED' : 'UNLOCKED'}

⛓ [BL🔐X]•CHAIN SECURE
`);
});

bot.command('status', (ctx) => {
  const activeUsers = Object.values(users).filter(
    u => Date.now() - u.lastSeen < 86400000
  ).length;

  ctx.reply(`
🌐 [BL🔐X]•SL0TS LIVE STATUS

Coyote Runner'z:
${Object.keys(users).length}

24H Active:
${activeUsers}

BLX:
$${blxPrice}

⛓ [BL🔐X]•CHAIN:
ACTIVE

🔥 Coyote'z Burner:
ONLINE

🏦 Coyote'z Bank Safe:
SECURED
`);
});

bot.command('scan', (ctx) => {
  const user = createUser(ctx.from.id);
  const risk = Math.floor(Math.random() * 100);
  const traffic = Math.floor(Math.random() * 5000);

  ctx.reply(`
🛰 [BL🔐X]•CHAIN SCAN

Wallet:
${user.walletAddress}

Traffic Load:
${traffic}

Security Score:
${100 - risk}%

Threat Index:
${risk}%

🔥 Burner Status:
${risk > 70 ? 'HIGH RISK' : 'STABLE'}
`);
});

bot.command('ping', (ctx) => {
  ctx.reply(`
📡 COYOTE'Z BURNER RESPONSE

Status:
ONLINE

Latency:
STABLE

🌐 [BL🔐X]•SL0TS ACTIVE
`);
});

bot.command('stats', (ctx) => {
  const user = createUser(ctx.from.id);

  ctx.reply(`
📊 COYOTE RUNNER'Z STATS

🔥 Burner Rig:
${user.rig}

⛓ Chain Power:
${user.hashPower}

📶 Level:
${user.level}

XP:
${user.xp}/100

👛 Wallet:
${user.balance.toFixed(2)} BLX

🏦 Bank Safe:
${user.bank.toFixed(2)} BLX
`);
});

bot.command('shop', (ctx) => {
  ctx.reply(`
🔥 COYOTE'Z BURNER UPGRADES

/buystarter = 25 BLX
/buy3060 = 50 BLX
/buy4090 = 200 BLX
/buyasic = 500 BLX
`);
});

function buyRig(ctx, cost, power, rigName) {
  const user = createUser(ctx.from.id);

  if (user.balance < cost) return ctx.reply('❌ Not enough BLX in Runner\'z Wallet.');

  user.balance -= cost;
  user.hashPower += power;
  user.rig = rigName;
  user.history.push(`🔥 Purchased ${rigName} for ${cost} BLX`);

  saveUsers();

  ctx.reply(`
✅ COYOTE'Z BURNER UPGRADED

Rig:
${rigName}

Power Added:
+${power}

Wallet:
${user.balance.toFixed(2)} BLX
`);
}

bot.command('buystarter', (ctx) => buyRig(ctx, 25, 2, 'Starter Burner Rig+'));
bot.command('buy3060', (ctx) => buyRig(ctx, 50, 5, 'RTX 3060 Burner Rig'));
bot.command('buy4090', (ctx) => buyRig(ctx, 200, 15, 'RTX 4090 Burner Rig'));
bot.command('buyasic', (ctx) => buyRig(ctx, 500, 40, 'ASIC Burner Rig'));

bot.command('myid', (ctx) => {
  ctx.reply(`Your Telegram ID: ${ctx.from.id}`);
});

bot.command('admin', (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply('❌ Admin only.');

  ctx.reply(`
🛡 COYOTE'Z BURNER ADMIN

/mint USER_ID AMOUNT
/burn USER_ID AMOUNT
/user USER_ID
/safelock USER_ID
/safeunlock USER_ID
/resetuser USER_ID
/system
`);
});

bot.command('mint', (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply('❌ Admin only.');

  const args = ctx.message.text.split(' ');
  if (args.length < 3) return ctx.reply('Usage: /mint USER_ID AMOUNT');

  const target = createUser(args[1]);
  const amount = parseFloat(args[2]);

  if (isNaN(amount) || amount <= 0) return ctx.reply('❌ Invalid amount.');

  target.balance += amount;
  target.history.push(`🛡 Admin minted ${amount.toFixed(2)} BLX`);

  saveUsers();

  ctx.reply(`✅ Minted ${amount.toFixed(2)} BLX.`);
});

bot.command('burn', (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply('❌ Admin only.');

  const args = ctx.message.text.split(' ');
  if (args.length < 3) return ctx.reply('Usage: /burn USER_ID AMOUNT');

  const target = createUser(args[1]);
  const amount = parseFloat(args[2]);

  if (isNaN(amount) || amount <= 0) return ctx.reply('❌ Invalid amount.');

  target.balance = Math.max(0, target.balance - amount);
  target.history.push(`🛡 Admin burned ${amount.toFixed(2)} BLX`);

  saveUsers();

  ctx.reply(`🔥 Burned ${amount.toFixed(2)} BLX.`);
});

bot.command('user', (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply('❌ Admin only.');

  const args = ctx.message.text.split(' ');
  if (args.length < 2) return ctx.reply('Usage: /user USER_ID');

  const target = createUser(args[1]);

  ctx.reply(`
🐺 COYOTE RUNNER'Z FILE

Wallet:
${target.walletAddress}

Wallet BLX:
${target.balance.toFixed(2)}

Bank Safe BLX:
${target.bank.toFixed(2)}

Safe:
${target.safeLocked ? 'LOCKED' : 'UNLOCKED'}

Rig:
${target.rig}

Power:
${target.hashPower}
`);
});

bot.command('safelock', (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply('❌ Admin only.');

  const args = ctx.message.text.split(' ');
  if (args.length < 2) return ctx.reply('Usage: /safelock USER_ID');

  const target = createUser(args[1]);
  target.safeLocked = true;
  saveUsers();

  ctx.reply('🔒 User Bank Safe locked.');
});

bot.command('safeunlock', (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply('❌ Admin only.');

  const args = ctx.message.text.split(' ');
  if (args.length < 2) return ctx.reply('Usage: /safeunlock USER_ID');

  const target = createUser(args[1]);
  target.safeLocked = false;
  saveUsers();

  ctx.reply('🔓 User Bank Safe unlocked.');
});

bot.command('resetuser', (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply('❌ Admin only.');

  const args = ctx.message.text.split(' ');
  if (args.length < 2) return ctx.reply('Usage: /resetuser USER_ID');

  delete users[args[1]];
  saveUsers();

  ctx.reply('🧹 User reset complete.');
});

bot.command('system', (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply('❌ Admin only.');

  ctx.reply(`
🐺 [BL🔐X]•SL0TS SYSTEM

Coyote Runner'z:
${Object.keys(users).length}

BLX:
$${blxPrice}

⛓ [BL🔐X]•CHAIN:
ACTIVE

🔥 Coyote'z Burner:
ONLINE

🏦 Coyote'z Bank Safe:
SECURED
`);
});

setInterval(() => {
  for (const id in users) {
    const user = createUser(id);
    const reward = +(user.hashPower * 0.1).toFixed(2);

    user.balance += reward;
    user.history.push(`⛓ Passive [BL🔐X]•CHAIN cycle earned ${reward} BLX`);
  }

  saveUsers();
  console.log('⛓ Passive [BL🔐X]•CHAIN cycle completed');
}, 600000);

app.get('/', (req, res) => {
  res.send('🐺 [BL🔐X]•SL0TS // Coyote Runner\'z Network Online');
});

app.listen(PORT, () => {
  console.log(`🌐 [BL🔐X]•SL0TS running on port ${PORT}`);
});

bot.launch();

console.log('🐺 [BL🔐X]•SL0TS ONLINE');
console.log('⛓ [BL🔐X]•CHAIN ACTIVE');
console.log('🔥 Coyote\'z Burner ONLINE');
