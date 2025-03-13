const { createBot } = require('mineflayer');
const { pathfinder, goals, Movements } = require('mineflayer-pathfinder');
const minecraftData = require('minecraft-data');

const botConfig = {
    host: '192.168.100.170',
    port: 27215,
    username: 'AURORA',
    auth: 'offline',
    version: '1.21.4'
};

let bot;
let lastMessageTime = 0;
const messageCooldown = 2000;

function createBotInstance() {
    bot = createBot(botConfig);
    bot.loadPlugin(pathfinder);

    bot.on('login', () => {
        console.log('Bot conectado com sucesso no servidor');
        sendMessage('Olá! Estou online e pronto para interagir.');
    });

    bot.on('chat', (username, message) => {
        if (username === bot.username) return;

        const args = message.split(' '); // Dividir a mensagem em partes
        const command = args[0].toLowerCase();

        if (command === 'tpa') {
            if (args.length > 1) {
                const targetPlayer = args[1];
                enviarTPA(targetPlayer);
            } else {
                sendMessage('Use o comando assim: tpa [nome_do_jogador]');
            }
        }
    });

    async function enviarTPA(username) {
        try {
            sendMessage(`/tpa ${username}`);
            sendMessage(`Enviei uma solicitação de TPA para ${username}!`);
        } catch (err) {
            console.error('[ERROR] Falha ao enviar solicitação de TPA:', err.message);
        }
    }

    function sendMessage(message) {
        const now = Date.now();
        if (now - lastMessageTime > messageCooldown) {
            bot.chat(message);
            lastMessageTime = now;
        }
    }
}

process.on('uncaughtException', (err) => {
    console.error('[GLOBAL ERROR]', err.message);
});

createBotInstance();
