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

// Lista de administradores (substitua pelos nomes dos admins)
const admins = ['007amauri', 'Admin2'];

// Variáveis globais para identificação e comando admin pendente
const botIDCode = Math.floor(1000 + Math.random() * 9000);  // Código de 4 dígitos
let pendingAdminCommand = null;  // Estrutura para armazenar solicitação pendente

// Cria o bot
const bot = mineflayer.createBot(botConfig);

// Carrega o plugin pathfinder
bot.loadPlugin(pathfinder);

bot.on('login', () => {
  console.log('ANNABEL conectada com sucesso ao servidor!');
  // Exibe o código de identificação para que todos saibam que se trata de um bot
  bot.chat(`Online [BOT_ID:${botIDCode}]`);
  
  // Configura os movimentos padrão do pathfinder
  const mcData = require('minecraft-data')(bot.version);
  const defaultMovements = new Movements(bot, mcData);
  bot.pathfinder.setMovements(defaultMovements);
});

// Função para executar comandos admin (personalize conforme necessário)
function executeAdminCommand(cmd) {
  // Por exemplo, apenas ecoa o comando no chat curto
  console.log('Executando comando admin:', cmd);
  bot.chat(`${cmd}`);
}

bot.on('chat', async (username, message) => {
  // Ignora mensagens enviadas pelo próprio bot
  if (username === bot.username) return;

  console.log(`Mensagem de ${username}: ${message}`);

  // Comando para conversar com a IA via API (aceita "anna " e "!ia ")
  if (message.startsWith('anna ') || message.startsWith('!ia ')) {
    const userPrompt = message.slice(4).trim();
    console.log(`Prompt enviado para a API: ${userPrompt}`);

    // Resposta simples para o "oi"
    if (userPrompt.toLowerCase() === 'oi') {
      bot.chat('Oi, tudo ok.');
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
        bot.chat('Falha na resposta.');
      }
    } catch (err) {
      console.error('Erro na API:', err.message);
      bot.chat('Erro na API.');
    }
  }
  // Comando para seguir o jogador que chamou
  else if (message.startsWith('!seguir')) {
    const target = bot.players[username] && bot.players[username].entity;
    if (!target) {
      bot.chat('Não te vejo.');
      return;
    }
    bot.chat(`Seguindo, ${username}!`);
    const goal = new GoalFollow(target, 1); // Mantém distância de 1 bloco
    bot.pathfinder.setGoal(goal, true);
  }
  // Comando para pular uma vez
  else if (message.startsWith('!pular')) {
    bot.chat('Pulando!');
    bot.setControlState('jump', true);
    setTimeout(() => {
      bot.setControlState('jump', false);
    }, 500);
  }
  // Comando para "subir": sequência de pulos
  else if (message.startsWith('!subir')) {
    bot.chat('Subindo!');
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
  // Comando para "descer": agachar para facilitar a descida
  else if (message.startsWith('!descer')) {
    bot.chat('Descendo!');
    bot.setControlState('sneak', true);
    setTimeout(() => {
      bot.setControlState('sneak', false);
    }, 3000);
  }
  // Comando administrativo: uso !admin <código> <comando>
  else if (message.startsWith('!admin ')) {
    // Exemplo: !admin 1234 reiniciar
    const args = message.split(' ');
    const providedCode = args[1];
    const adminCmd = args.slice(2).join(' ');
    
    if (providedCode !== botIDCode.toString()) {
      bot.chat('Código errado.');
      return;
    }
    
    if (admins.includes(username)) {
      // Se é admin, executa o comando direto
      bot.chat('Ok.');
      executeAdminCommand(adminCmd);
    } else {
      // Se não for admin, cria uma solicitação pendente e pergunta a todos
      pendingAdminCommand = {
        requestedBy: username,
        command: adminCmd,
        requestedAt: Date.now()
      };
      bot.chat(`${username} pediu: ${adminCmd}. Admin confirme com !confirmar ${botIDCode}`);
    }
  }
  // Comando para confirmar solicitação admin: !confirmar <código>
  else if (message.startsWith('!confirmar ')) {
    const args = message.split(' ');
    const providedCode = args[1];
    
    if (providedCode !== botIDCode.toString()) {
      bot.chat('Código errado.');
      return;
    }
    if (!admins.includes(username)) {
      bot.chat('Apenas admin pode confirmar.');
      return;
    }
    if (pendingAdminCommand) {
      // Verifica se a solicitação não expirou (30 segundos de validade)
      if (Date.now() - pendingAdminCommand.requestedAt > 30000) {
        bot.chat('Solicitação expirada.');
        pendingAdminCommand = null;
        return;
      }
      bot.chat('Ok.');
      executeAdminCommand(pendingAdminCommand.command);
      pendingAdminCommand = null;
    } else {
      bot.chat('Sem solicitação.');
    }
  }
});

bot.on('error', (err) => console.error('Erro no bot:', err));
bot.on('end', () => console.log('Bot desconectada do servidor.'));

