const { Telegraf } = require('telegraf');
const fs = require('fs');

// ============================================
// BOT TOKEN
// ============================================
const BOT_TOKEN = process.env.BOT_TOKEN;

// ============================================
// CREATE BOT
// ============================================
const bot = new Telegraf(BOT_TOKEN);

// ============================================
// GLOBALS
// ============================================
let blxPrice = 1.00;

const gpuShop = {
  buy3060: {
    cost: 250,
    power: 5
  },

  buy4090: {
    cost: 1000,
    power: 20
  },

  buyasic: {
    cost: 5000,
    power: 100
  }
};

// ============================================
// DATABASE
// ============================================
let users = {};

if (fs.existsSync('./users.json')) {
  users = JSON.parse(fs.readFileSync('./users.json'));
}

function saveUsers() {
  fs.writeFileSync('./users.json', JSON.stringify(users, null, 2));
}

function getUser(id) {
  if (!users[id]) {
    users[id] = {
      balance: 0,
      hashPower: 1
    };

    saveUsers();
  }

  return users[id];
}

// ============================================
// START COMMAND
// ============================================
bot.start((ctx) => {
  getUser(ctx.from.id);

  ctx.reply(`
🚀 Welcome to BL0XSL0TS

Commands:
/mine
/balance
/price
/shop
  `);
});

// ============================================
// MINE
// ============================================
bot.command('mine', (ctx) => {
  const user = getUser(ctx.from.id);

  const earned = user.hashPower * 0.25;

  user.balance += earned;

  saveUsers();

  ctx.reply(`
⛏ Mining Complete

⚡ HashPower: ${user.hashPower}
💰 Earned: ${earned.toFixed(2)} BLX
💳 Balance: ${user.balance.toFixed(2)} BLX
  `);
});

// ============================================
// BALANCE
// ============================================
bot.command('balance', (ctx) => {
  const user = getUser(ctx.from.id);

  ctx.reply(`
💳 Wallet

Balance: ${user.balance.toFixed(2)} BLX
⚡ HashPower: ${user.hashPower}
  `);
});

// ============================================
// PRICE
// ============================================
setInterval(() => {
  const change = Math.random() * 0.2 - 0.1;

  blxPrice += change;

  if (blxPrice < 0.01) {
    blxPrice = 0.01;
  }

  blxPrice = Math.round(blxPrice * 100) / 100;

  console.log(`💱 BLX price updated: $${blxPrice}`);
}, 60000);

bot.command('price', (ctx) => {
  ctx.reply(`💱 Current BLX price: $${blxPrice.toFixed(2)}`);
});

// ============================================
// SHOP
// ============================================
bot.command('shop', (ctx) => {
  ctx.reply(`
🛒 BL0X GPU SHOP

RTX 3060
Cost: 250 BLX
Command:
/buy3060

RTX 4090
Cost: 1000 BLX
Command:
/buy4090

ASIC Miner
Cost: 5000 BLX
Command:
/buyasic
  `);
});

// ============================================
// BUY FUNCTION
// ============================================
function buyGPU(ctx, item) {
  const user = getUser(ctx.from.id);

  const gpu = gpuShop[item];

  if (!gpu) {
    return ctx.reply('❌ Invalid GPU.');
  }

  if (user.balance < gpu.cost) {
    return ctx.reply('❌ Not enough BLX.');
  }

  user.balance -= gpu.cost;
  user.hashPower += gpu.power;

  saveUsers();

  ctx.reply(`
✅ Purchase Successful

⚡ Added HashPower: +${gpu.power}
💰 Remaining Balance: ${user.balance.toFixed(2)} BLX
  `);
}

// ============================================
// BUY COMMANDS
// ============================================
bot.command('buy3060', (ctx) => {
  buyGPU(ctx, 'buy3060');
});

bot.command('buy4090', (ctx) => {
  buyGPU(ctx, 'buy4090');
});

bot.command('buyasic', (ctx) => {
  buyGPU(ctx, 'buyasic');
});

// ============================================
// PASSIVE MINING
// ============================================
setInterval(() => {
  Object.keys(users).forEach((id) => {
    users[id].balance += users[id].hashPower * 0.05;
  });

  saveUsers();

  console.log('⛏ Passive mining cycle completed');
}, 300000);

// ============================================
// LAUNCH
// ============================================
bot.command('daily', (ctx) => {
  const user = getUser(ctx.from.id);

  if (!user.lastDaily) {
    user.lastDaily = 0;
  }

  const now = Date.now();

  if (now - user.lastDaily < 86400000) {
    return ctx.reply('⏳ Daily already claimed.');
  }

  user.lastDaily = now;
  user.balance += 100;

  saveUsers();

  ctx.reply(`
🎁 Daily Reward Claimed

+100 BLX
💰 New Balance: ${user.balance.toFixed(2)} BLX
  `);
});

// ============================================
// LAUNCH
// ============================================
// ============================================
// SEND BLX
// ============================================

bot.command('send', (ctx) => {
  const user = getUser(ctx.from.id);

  const args = ctx.message.text.split(' ');

  if (args.length < 3) {
    return ctx.reply('Usage: /send USER_ID AMOUNT');
  }

  const targetId = args[1];
  const amount = parseFloat(args[2]);

  if (isNaN(amount) || amount <= 0) {
    return ctx.reply('❌ Invalid amount.');
  }

  if (user.balance < amount) {
    return ctx.reply('❌ Not enough BLX.');
  }

  const targetUser = getUser(targetId);

  user.balance -= amount;
  targetUser.balance += amount;

  saveUsers();

  ctx.reply(`
✅ Transfer Successful

📤 Sent: ${amount.toFixed(2)} BLX
💰 Remaining Balance: ${user.balance.toFixed(2)} BLX
  `);
});
// ============================================
// START BOT
// ============================================

bot.telegram.setMyCommands([
  { command: 'start', description: 'Start BL0XSL0TS' },
  { command: 'mine', description: 'Mine BLX' },
  { command: 'balance', description: 'View balance' },
  { command: 'stats', description: 'View miner stats' },
  { command: 'price', description: 'Current BLX price' },
  { command: 'shop', description: 'Open GPU shop' },
  { command: 'buy3060', description: 'Buy RTX 3060' },
  { command: 'buy4090', description: 'Buy RTX 4090' },
  { command: 'buyasic', description: 'Buy ASIC Miner' }
]);

console.log('🚀 BL0XSL0TS ONLINE');
bot.command('stats', (ctx) => {
  const id = ctx.from.id;

  if (!users[id]) {
    users[id] = {
      balance: 0,
      hashPower: 1,
      level: 1,
      xp: 0
    };
  }

  const user = users[id];

  ctx.reply(`
📊 BL0X MINER STATS

⚡ Hash Power: ${user.hashPower}
💰 Balance: ${user.balance.toFixed(2)} BLX
🏆 Level: ${user.level}
✨ XP: ${user.xp}

💱 Current BLX Price: $${blxPrice.toFixed(2)}
  `);
});

bot.launch();

console.log('🚀 BL0XSL0TS ONLINE');
