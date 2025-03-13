// Importa os módulos necessários
const mineflayer = require('mineflayer');
const axios = require('axios');
const { pathfinder, Movements, goals: { GoalFollow } } = require('mineflayer-pathfinder');

// Configuração do bot
const botConfig = {
  host: '192.168.100.170',   // IP do servidor Minecraft
  port: 27215,               // Porta do servidor
  username: 'ANNABEL',       // Nome do bot
  auth: 'offline',           // Modo offline (para online use 'mojang')
  version: '1.21.4'          // Versão do Minecraft (ajuste se necessário)
};

// Cria o bot
const bot = mineflayer.createBot(botConfig);

// Carrega o plugin pathfinder
bot.loadPlugin(pathfinder);

bot.on('login', () => {
  console.log('ANNABEL conectada com sucesso ao servidor!');
  bot.chat('Olá! Estou online e pronta para conversar.');
  
  // Configura os movimentos padrão do pathfinder
  const mcData = require('minecraft-data')(bot.version);
  const defaultMovements = new Movements(bot, mcData);
  bot.pathfinder.setMovements(defaultMovements);
});

// Manipulador de chat
bot.on('chat', async (username, message) => {
  // Ignora mensagens enviadas pelo próprio bot
  if (username === bot.username) return;

  console.log(`Mensagem recebida de ${username}: ${message}`);

  // Comando para conversar com a IA via API (aceita !ai e !ia)
  if (message.startsWith('anna ') || message.startsWith('!ia ')) {
    const userPrompt = message.slice(4).trim();
    console.log(`Prompt enviado para a API: ${userPrompt}`);

    // Se o prompt for exatamente "oi" (ignorando maiúsculas/minúsculas)
    if (userPrompt.toLowerCase() === 'oi') {
      bot.chat('anna oi tudo bem');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:11434/api/chat',
        {
          model: 'llama3.2',
          messages: [{ role: 'user', content: userPrompt }],
          stream: false
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log('Resposta da API:', response.data);
      
      if (response.data && response.data.message && response.data.message.content) {
        bot.chat(response.data.message.content);
      } else {
        bot.chat('Desculpe, não consegui obter uma resposta da IA.');
      }
    } catch (err) {
      console.error('Erro ao consultar a API:', err.message);
      bot.chat('Desculpe, ocorreu um erro ao chamar a IA.');
    }
  }
  // Comando para seguir o jogador que chamou
  else if (message.startsWith('!seguir')) {
    const target = bot.players[username] && bot.players[username].entity;
    if (!target) {
      bot.chat('Não consigo te ver para seguir.');
      return;
    }
    bot.chat(`Seguindo você, ${username}!`);
    const goal = new GoalFollow(target, 1); // Mantém distância de 1 bloco
    bot.pathfinder.setGoal(goal, true);
  }
  // Comando para pular uma vez
  else if (message.startsWith('!pular')) {
    bot.chat('Ok, vou pular!');
    bot.setControlState('jump', true);
    setTimeout(() => {
      bot.setControlState('jump', false);
    }, 500);
  }
  // Comando para "subir": simula uma sequência de pulos para subir
  else if (message.startsWith('!subir')) {
    bot.chat('Vou subir!');
    let count = 0;
    const interval = setInterval(() => {
      bot.setControlState('jump', true);
      setTimeout(() => {
        bot.setControlState('jump', false);
      }, 200);
      count++;
      if (count >= 3) {
        clearInterval(interval);
      }
    }, 400);
  }
  // Comando para "descer": ativa o agachar (sneak) para ajudar a descer
  else if (message.startsWith('!descer')) {
    bot.chat('Descendo!');
    bot.setControlState('sneak', true);
    setTimeout(() => {
      bot.setControlState('sneak', false);
    }, 3000);
  }
});

bot.on('error', (err) => console.error('Erro no bot:', err));
bot.on('end', () => console.log('Bot desconectada do servidor, verifique sua conexão.'));

