// Importa os módulos necessários
const mineflayer = require('mineflayer');
const axios = require('axios');
const { pathfinder, Movements, goals: { GoalFollow, GoalBlock } } = require('mineflayer-pathfinder');
const Vec3 = require('vec3'); // Necessário para lidar com vetores

// Configuração do bot
const botConfig = {
  host: '192.168.100.170',   // IP do servidor Minecraft
  port: 27215,               // Porta do servidor
  username: 'AURORA',        // Nome do bot
  auth: 'offline',           // Modo offline (para online use 'mojang')
  version: '1.21.4'          // Versão do Minecraft (ajuste se necessário)
};

// Lista de administradores (substitua pelos nomes dos admins)
const admins = ['007amauri', 'Admin2'];

// Variáveis globais para identificação e comando admin pendente
const botIDCode = Math.floor(1000 + Math.random() * 9000); // Código de 4 dígitos
let pendingAdminCommand = null; // Estrutura para armazenar solicitação pendente

// Cria o bot
const bot = mineflayer.createBot(botConfig);

// Carrega o plugin pathfinder
bot.loadPlugin(pathfinder);

bot.on('login', () => {
  console.log('AURORA conectada com sucesso ao servidor!');
  bot.chat(`Online [BOT_ID:${botIDCode}]`);
  
  const mcData = require('minecraft-data')(bot.version);
  const defaultMovements = new Movements(bot, mcData);
  bot.pathfinder.setMovements(defaultMovements);
});

// Evento de proteção automática: quando uma nova entidade aparecer
bot.on('entitySpawn', (entity) => {
  if (!entity || !entity.name) return;
  const mobName = entity.name.toLowerCase();
  if (mobName.includes('zombie') || mobName.includes('skeleton') || mobName.includes('griper') || mobName.includes('spider')) {
    defenderContraMob(entity);
  }
});

// Função para perseguir e atacar continuamente o mob
async function defenderContraMob(mob) {
  if (!mob) return;
  
  
  await equiparEspada();
  
  

  // Faz o bot seguir o mob (mantendo uma distância de 1 bloco)
  const followGoal = new GoalFollow(mob, 1);
  bot.pathfinder.setGoal(followGoal, true);

  // Inicia um loop para atacar a cada 1 segundo
  const attackInterval = setInterval(() => {
    // Se o mob não for mais válido ou (se disponível) estiver com saúde 0 ou inferior, finaliza o ataque
	// Verifica se há blocos ou madeira na frente
 
    if (!mob || !mob.isValid || (mob.health !== undefined && mob.health <= 0)) {
      clearInterval(attackInterval);
      bot.pathfinder.setGoal(null);// Para de seguir
      return;
    }
    // Continua o ataque
    bot.attack(mob);
  }, 1000);
}

// Função para equipar uma espada (procura no inventário um item que contenha "sword")
async function equiparEspada() {
	
	const blockInFront = bot.blockAt(bot.entity.position.offset(1, 0, 0));
  const sword = bot.inventory.items().find(item => item.name.toLowerCase().includes('sword'));
  if (sword) {
    await bot.equip(sword, 'hand');
  } else if (blockInFront) {
    if (blockInFront.name.includes("wood", 'hand')) {
      await equiparFerramenta("axe", 'hand'); // Machados geralmente contêm "axe" no nome
    } else if (blockInFront.name.includes("stone")) {
      await equiparFerramenta("pickaxe", 'hand'); // Picaretas geralmente contêm "pickaxe" no nome
    }
  }
}


// Verifica e garante que a espada, machado e picareta estão disponíveis no inventário
async function verificarOuDarFerramentas() {
  const espada = bot.inventory.items().find(item => item.name.includes("sword"));
  const machado = bot.inventory.items().find(item => item.name.includes("axe"));
  const picareta = bot.inventory.items().find(item => item.name.includes("pickaxe"));

  if (!espada) {
    await bot.chat("/give @p minecraft:diamond_sword");
  }
  if (!machado) {
    await bot.chat("/give @p minecraft:diamond_axe");
  }
  if (!picareta) {
    await bot.chat("/give @p minecraft:diamond_pickaxe");
  }
}

// Resto dos comandos do bot
bot.on('chat', async (username, message) => {
  if (username === bot.username) return;
  console.log(`Mensagem de ${username}: ${message}`);

  // Comando para conversar com a IA via API (ex.: "Aurora " ou "aurora " ou "!ia ")
  if (message.startsWith('Aurora ') || message.startsWith('aurora ') || message.startsWith('!ia ')) {
    const userPrompt = message.slice(7).trim(); // Remove o prefixo
    console.log(`Prompt enviado para a API: ${userPrompt}`);
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
  // Comando para TPA: use "tpa [nome_do_jogador]"
  else if (message.toLowerCase().startsWith('tpa')) {
    const args = message.split(' ');
    if (args.length < 2) {
      bot.chat('Use o comando assim: tpa [nome_do_jogador]');
      return;
    }
    const targetPlayer = args[1];
    enviarTPA(targetPlayer);
  }
  // Comando para seguir o jogador que chamou
  else if (message.startsWith('!seguir')) {
    const target = bot.players[username] && bot.players[username].entity;
    if (!target) {
      bot.chat('Não te vejo.');
      return;
    }
    bot.chat(`Seguindo, ${username}!`);
    const followGoal = new GoalFollow(target, 1);
    bot.pathfinder.setGoal(followGoal, true);
  }
  // Comando para dormir
  else if (message.startsWith('!dormir')) {
    const bedBlock = bot.findBlock({
      matching: block => block.name.includes('bed'),
      maxDistance: 32
    });
    if (!bedBlock) {
      bot.chat('Não encontrei um leito próximo!');
      return;
    }
    bot.chat('Indo dormir...');
    const goal = new GoalBlock(bedBlock.position.x, bedBlock.position.y, bedBlock.position.z);
    bot.pathfinder.setGoal(goal);
    setTimeout(() => {
      bot.setControlState('jump', true);
      setTimeout(() => {
        bot.setControlState('jump', false);
        bot.lookAt(bedBlock.position.offset(0, -1, 0));
        const faceVector = new Vec3(0, -1, 0);
        bot.activateBlock(bedBlock, faceVector, (err) => {
          if (err) {
            bot.chat(`Não consegui dormir: ${err.message}`);
          } else {
            bot.chat('Agora estou dormindo!');
          }
        });
      }, 500);
    }, 5000);
  }
  // Comando para atacar manualmente (zumbi ou esqueleto)
  else if (message.startsWith('!atacar')) {
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
  // Comando para equipar espada e armaduras
  else if (message.startsWith('!equipar')) {
	  await verificarOuDarFerramentas();
    try {
      if (!bot.heldItem) {
        bot.chat("Não estou segurando nenhum item para equipar como espada!");
      } else {
        await bot.equip(bot.heldItem, 'hand');
        bot.chat("Espada equipada!");
      }
      const armorSlots = { head: 'helmet', chest: 'chestplate', legs: 'leggings', feet: 'boots' };
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
  // Comando para pular
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
  // Comando para "descer"
  else if (message.startsWith('!descer')) {
    bot.chat('Descendo!');
    bot.setControlState('sneak', true);
    setTimeout(() => {
      bot.setControlState('sneak', false);
    }, 3000);
  }
  // Comando administrativo: !admin <código> <comando>
  else if (message.startsWith('!admin ')) {
    const args = message.split(' ');
    const providedCode = args[1];
    const adminCmd = args.slice(2).join(' ');
    if (providedCode !== botIDCode.toString()) {
      bot.chat('Código errado.');
      return;
    }
    if (admins.includes(username)) {
      bot.chat('Ok.');
      executeAdminCommand(adminCmd);
    } else {
      pendingAdminCommand = { requestedBy: username, command: adminCmd, requestedAt: Date.now() };
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

// Função para enviar a solicitação de TPA
async function enviarTPA(targetPlayer) {
  try {
    bot.chat(`/tpa ${targetPlayer}`);
    bot.chat(`Enviei uma solicitação de TPA para ${targetPlayer}!`);
  } catch (err) {
    console.error('[ERROR] Falha ao enviar solicitação de TPA:', err.message);
  }
}
