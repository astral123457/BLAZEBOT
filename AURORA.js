// Importa os módulos necessários
const mineflayer = require('mineflayer');
const axios = require('axios');
const { pathfinder, Movements, goals: { GoalFollow } } = require('mineflayer-pathfinder');

// Configuração do bot
const botConfig = {
  host: '192.168.100.170',   // IP do servidor Minecraft
  port: 27215,               // Porta do servidor
  username: 'AURORA',       // Nome do bot
  auth: 'offline',           // Modo offline (para online use 'mojang')
  version: '1.21.4'          // Versão do Minecraft (ajuste se necessário)
};

// Lista de administradores (substitua pelos nomes dos admins)
const admins = ['007amauri', 'Admin2'];
const Vec3 = require('vec3'); // Certifique-se de ter esse require no início do seu script

// Variáveis globais para identificação e comando admin pendente
const botIDCode = Math.floor(1000 + Math.random() * 9000);  // Código de 4 dígitos
let pendingAdminCommand = null;  // Estrutura para armazenar solicitação pendente

// Cria o bot
const bot = mineflayer.createBot(botConfig);

// Carrega o plugin pathfinder
bot.loadPlugin(pathfinder);

bot.on('login', () => {
  console.log('AURORA conectada com sucesso ao servidor!');
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

  // Comando para conversar com a IA via API (aceita "Aurora " ou "aurora ")
  if (message.startsWith('Aurora ') || message.startsWith('aurora ') || message.startsWith(' ') || message.startsWith('! ')) {
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
          model: 'deepseek-r1',
          messages: [{ role: 'user', content: userPrompt }],
          stream: false
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      // Remove as tags <think>...</think> da resposta
      if (response.data && response.data.message && response.data.message.content) {
        let reply = response.data.message.content;
        reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        bot.chat(reply);
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
    const { GoalFollow } = require('mineflayer-pathfinder').goals;
    const goal = new GoalFollow(target, 1); // Mantém uma distância de 1 bloco
    bot.pathfinder.setGoal(goal, true);
  }
  
 else if (message.startsWith('!dormir')) {
  // Procura um bloco de leito próximo (ajuste o critério se necessário)
  const bedBlock = bot.findBlock({
    matching: block => block.name.includes('bed'),
    maxDistance: 32
  });

  if (!bedBlock) {
    bot.chat('Não encontrei um leito próximo!');
    return;
  }

  bot.chat('Indo dormir...');

  // Usa o goal do pathfinder para levar o bot até o leito
  const { GoalBlock } = require('mineflayer-pathfinder').goals;
  bot.pathfinder.setGoal(new GoalBlock(bedBlock.position.x, bedBlock.position.y, bedBlock.position.z));

  // Aguarda alguns segundos para o bot chegar próximo ao leito
  setTimeout(() => {
    // Faz o bot pular
    bot.setControlState('jump', true);

    setTimeout(() => {
      bot.setControlState('jump', false);

      // Faz o bot olhar para baixo em relação ao leito
      bot.lookAt(bedBlock.position.offset(0, -1, 0));

      // Define um vetor de direção válido (neste caso, apontando para baixo)
      const faceVector = new Vec3(0, -1, 0);

      // Tenta interagir com o leito usando o vetor de direção
      bot.activateBlock(bedBlock, faceVector, (err) => {
        if (err) {
          bot.chat(`Não consegui dormir: ${err.message}`);
        } else {
          bot.chat('Agora estou dormindo!');
        }
      });
    }, 500); // Duração do pulo (tempo para o bot pular antes de interagir)
  }, 5000); // Tempo de espera para o bot chegar até o leito (ajuste se necessário)
}

else // Comando para atacar zumbi ou esqueleto
  if (message.startsWith('!atacar')) {
    const target = bot.nearestEntity((entity) => {
      return entity.name.toLowerCase() === 'zombie' || entity.name.toLowerCase() === 'skeleton';
    });

    if (!target) {
      bot.chat('Nenhum zumbi ou esqueleto encontrado próximo!');
      return;
    }

    bot.chat(`Atacando ${target.name}!`);
    bot.attack(target);
  }
  // Comando para equipar espada (item na mão) e armaduras
  else if (message.startsWith('!equipar')) {
    try {
      // Equipar a espada (item na mão)
      if (!bot.heldItem) {
        bot.chat("Não estou segurando nenhum item para equipar como espada!");
      } else {
        await bot.equip(bot.heldItem, 'hand');
        bot.chat("Espada equipada!");
      }

      // Equipar armaduras
      const armorSlots = {
        head: 'helmet',      // capacete
        chest: 'chestplate', // peitoral
        legs: 'leggings',    // calça
        feet: 'boots'        // botas
      };

      for (const [slot, armorType] of Object.entries(armorSlots)) {
        const armorPiece = bot.inventory.items().find(item =>
          item.name.toLowerCase().includes(armorType)
        );
        
        if (armorPiece) {
          await bot.equip(armorPiece, slot);
          bot.chat(`Equipado ${armorPiece.name} na posição ${slot}!`);
        } else {
          bot.chat(`Nenhum item compatível com ${armorType} encontrado.`);
        }
      }
    } catch (err) {
      console.error("Erro ao equipar itens:", err);
      bot.chat("Erro ao equipar itens!");
    }
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

