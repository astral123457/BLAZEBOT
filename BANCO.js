// Importa os módulos necessários
const mineflayer = require('mineflayer');
const axios = require('axios');
const { pathfinder, Movements, goals: { GoalFollow } } = require('mineflayer-pathfinder');

const mysql = require('mysql2');

// Configuração do banco de dados
const db = mysql.createConnection({
    host: 'debian.tail561849.ts.net',
    user: 'root',
    password: '0073007',
    database: 'banco'
});

db.connect(err => {
    if (err) throw err;
    console.log('Conectado ao banco MariaDB!');
});

// Configuração do bot
const botConfig = {
  host: 'debian.tail561849.ts.net', // IP do servidor Minecraft
  port: 1212, // Porta do servidor
  username: 'ANNABEL', // Nome do bot
  auth: 'offline', // Modo offline (para online use 'mojang')
  version: '1.20' // Versão do Minecraft (ajuste se necessário)
};

// Lista de administradores
const admins = ['007amauri', 'Admin2'];

// Variáveis do sistema bancário
const playerBalances = {}; // Armazena saldo dos jogadores
const playerLoans = {}; // Armazena dívidas dos jogadores
const playerInvestments = {}; // Armazena investimentos

// Cria o bot
const bot = mineflayer.createBot(botConfig);
bot.loadPlugin(pathfinder);

bot.on('login', () => {
  console.log('ANNABEL conectada ao servidor!');
  bot.chat(`Estou online! [BOT_ID:${Math.floor(1000 + Math.random() * 9000)}]`);
});

function registerPlayer(player) {
    db.query(`INSERT IGNORE INTO banco (jogador, saldo, divida, investimento) VALUES (?, 500, 0, 0)`, [player], (err) => {
        if (err) throw err;
        bot.chat(`${player}, você foi registrado no banco! Saldo inicial: $500.`);
    });
}


// 📌 Verifica saldo do jogador
function checkBalance(player) {
    db.query(`SELECT saldo FROM banco WHERE jogador = ?`, [player], (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
            registerPlayer(player); // Registra automaticamente
        } else {
            bot.chat(`${player}, seu saldo bancário é de $${result[0].saldo}.`);
        }
    });
}

// 📌 Empréstimos
function giveLoan(player, amount) {
    db.query(`UPDATE banco SET divida = divida + ?, saldo = saldo + ? WHERE jogador = ?`, [amount * 1.1, amount, player], (err) => {
        if (err) throw err;
        bot.chat(`${player}, empréstimo aprovado! Nova dívida: $${amount * 1.1}.`);
    });
}

// 📌 Pagamento de dívida
function payDebt(player, amount) {
    db.query(`UPDATE banco SET divida = GREATEST(divida - ?, 0), saldo = saldo - ? WHERE jogador = ?`, [amount, amount, player], (err) => {
        if (err) throw err;
        bot.chat(`${player}, pagamento de $${amount} realizado.`);
    });
}

// 📌 Investimentos
function invest(player, amount) {
    db.query(`UPDATE banco SET investimento = investimento + ?, saldo = saldo - ? WHERE jogador = ?`, [amount, amount, player], (err) => {
        if (err) throw err;
        bot.chat(`${player}, investimento de $${amount} realizado.`);
    });
}

// 📌 Compra de Maçã Encantada
function buyEnchantedApple(player) {
    db.query(`SELECT saldo FROM banco WHERE jogador = ?`, [player], (err, result) => {
        if (err) throw err;
        if (result.length > 0 && result[0].saldo >= 500) {
            db.query(`UPDATE banco SET saldo = saldo - 500 WHERE jogador = ?`, [player], (err) => {
                if (err) throw err;
                bot.chat(`${player}, você comprou uma Maçã Encantada por $500!`);
                bot.chat(`/give ${player} minecraft:enchanted_golden_apple 1`);
            });
        } else {
            bot.chat(`${player}, saldo insuficiente para comprar.`);
        }
    });
}

// 📌 Atualiza juros a cada 60s
setInterval(() => {
    db.query(`UPDATE banco SET divida = divida * 1.02 WHERE divida > 0`, (err) => {
        if (err) throw err;
    });
}, 60000);

// 📌 Retorno de investimentos a cada 5 min
setInterval(() => {
    db.query(`UPDATE banco SET saldo = saldo + investimento * 1.25, investimento = 0 WHERE investimento > 0`, (err) => {
        if (err) throw err;
    });
}, 300000);

// 📌 Comandos do bot
bot.on('chat', (username, message) => {
    if (username === bot.username) return;

    const args = message.split(' ');
    const command = args[0];
    const amount = parseFloat(args[1]);

    switch (command) {
        case '!balance':
            checkBalance(username);
            break;
        case '!loan':
            giveLoan(username, amount);
            break;
        case '!paydebt':
            payDebt(username, amount);
            break;
        case '!invest':
            invest(username, amount);
            break;
        case '!buyapple':
            buyEnchantedApple(username);
            break;
    }
});