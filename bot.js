const TelegramBot = require('node-telegram-bot-api');

const token = '8786690408:AAGkc_Kfch8gJvs1E6AY9aAEuAfXgPFP-Ug';

const bot = new TelegramBot(token, {
    polling: {
        interval: 300,
        autoStart: true,
        params: {
            timeout: 10
        }
    },
    request: {
        family: 4
    }
});

const ADMIN_ID = 0;

function secureMessage(title, body) {

    return `
━━━━━━━━━━━━━━━━━━━━
${title}
━━━━━━━━━━━━━━━━━━━━
${body}
`;

}

bot.onText(/\/start/, (msg) => {

    bot.sendMessage(

        msg.chat.id,

        secureMessage(
            '🔐 BL0X Chain Communications',
            'Authentication successful.\nSecure connection established.'
        )

    );

});

bot.onText(/\/help/, (msg) => {

    bot.sendMessage(

        msg.chat.id,

`━━━━━━━━━━━━━━━━━━━━
📡 BL0X Command Directory
━━━━━━━━━━━━━━━━━━━━

/panel
/status
/network
/nodes
/communications
/clearance
/admin
/help`

    );

});

bot.onText(/\/panel/, (msg) => {

    bot.sendMessage(

        msg.chat.id,

        secureMessage(
            '🔐 BL0X Control Panel',
            'Select a secure module below.'
        ),

        {
            reply_markup: {
                inline_keyboard: [

                    [
                        { text: '🛡 Systems', callback_data: 'systems' },
                        { text: '🌐 Network', callback_data: 'network' }
                    ],

                    [
                        { text: '📡 Communications', callback_data: 'communications' },
                        { text: '🔒 Clearance', callback_data: 'clearance' }
                    ],

                    [
                        { text: '🧠 Nodes', callback_data: 'nodes' },
                        { text: '👑 Admin', callback_data: 'admin' }
                    ]

                ]
            }
        }

    );

});

bot.onText(/\/status/, (msg) => {

    bot.sendMessage(

        msg.chat.id,

        secureMessage(
            '🛡 System Status',
            'All BL0X Chain systems operational.'
        )

    );

});

bot.onText(/\/network/, (msg) => {

    bot.sendMessage(

        msg.chat.id,

        secureMessage(
            '🌐 Network Core',
            'BL0X Chain routing stable.\nEncrypted node communications active.'
        )

    );

});

bot.onText(/\/nodes/, (msg) => {

    bot.sendMessage(

        msg.chat.id,

        secureMessage(
            '🧠 Node Matrix',
            'All network nodes synchronized successfully.'
        )

    );

});

bot.onText(/\/communications/, (msg) => {

    bot.sendMessage(

        msg.chat.id,

        secureMessage(
            '📡 Communications Channel',
            'Secure communications systems online.'
        )

    );

});

bot.onText(/\/clearance/, (msg) => {

    bot.sendMessage(

        msg.chat.id,

        secureMessage(
            '🔒 Security Clearance',
            'Clearance authorization verified.'
        )

    );

});

bot.onText(/\/admin/, (msg) => {

    if (msg.from.id !== ADMIN_ID) {

        return bot.sendMessage(
            msg.chat.id,
            '⛔ Unauthorized administrative access.'
        );

    }

    bot.sendMessage(

        msg.chat.id,

        secureMessage(
            '👑 Administrative Core',
            'Administrator privileges confirmed.'
        )

    );

});

bot.on('callback_query', (query) => {

    const msg = query.message;

    if (query.data === 'systems') {

        bot.sendMessage(
            msg.chat.id,
            '🛡 BL0X systems stable.'
        );

    }

    if (query.data === 'network') {

        bot.sendMessage(
            msg.chat.id,
            '🌐 BL0X network secure and operational.'
        );

    }

    if (query.data === 'communications') {

        bot.sendMessage(
            msg.chat.id,
            '📡 Communications channels encrypted.'
        );

    }

    if (query.data === 'clearance') {

        bot.sendMessage(
            msg.chat.id,
            '🔒 Security clearance verified.'
        );

    }

    if (query.data === 'nodes') {

        bot.sendMessage(
            msg.chat.id,
            '🧠 Node synchronization complete.'
        );

    }

    if (query.data === 'admin') {

        if (msg.from.id !== ADMIN_ID) {

            return bot.sendMessage(
                msg.chat.id,
                '⛔ Unauthorized administrative access.'
            );

        }

        bot.sendMessage(
            msg.chat.id,
            '👑 Administrative systems unlocked.'
        );

    }

});

console.log(`
━━━━━━━━━━━━━━━━━━━━
🔐 BL0X Chain Online
━━━━━━━━━━━━━━━━━━━━
`);
