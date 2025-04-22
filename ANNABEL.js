// Importa os módulos necessários
const mineflayer = require('mineflayer');
const axios = require('axios');
const { pathfinder, Movements, goals: { GoalFollow } } = require('mineflayer-pathfinder');

const { exec } = require('child_process');

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
  host: 'debian.tail561849.ts.net',   // IP do servidor Minecraft
  port: 1212,               // Porta do servidor
  username: 'ANNABEL',       // Nome do bot
  auth: 'offline',           // Modo offline (para online use 'mojang')
  version: '1.20'          // Versão do Minecraft (ajuste se necessário)
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

bot.on('chat', (username, message) => {
    if (message === "!ope" && admins.includes(username)) {
        const inventoryItems = bot.inventory.items();
        
        if (inventoryItems.length === 0) {
            bot.chat(`${username}, meu inventário está vazio.`);
        } else {
            bot.chat(`${username}, meu inventário contém:`);
            inventoryItems.forEach(item => {
                bot.chat(`- ${item.count}x ${item.name}`);
            });
        }
    }
});


// Função para executar comandos admin (personalize conforme necessário)
function executeAdminCommand(cmd) {
  // Por exemplo, apenas ecoa o comando no chat curto
  console.log('Executando comando admin:', cmd);
  bot.chat(`${cmd}`);
}

function getBalance(username) {
    bot.chat(`/balance ${username}`);

    bot.once('chat', (sender, balanceMessage) => {
        console.log(`Mensagem recebida do servidor: "${balanceMessage}"`); // Log para ver a resposta bruta

        // Teste direto: Apenas exibir a mensagem bruta no chat do bot
        bot.chat(`Mensagem detectada: "${balanceMessage}"`);

        const match = balanceMessage.match(/Saldo de .*?: \$(\d[\d,.]*)/);

        if (!match) {
            console.log("Erro: Não encontrou saldo na mensagem.");
            bot.chat(`${username}, erro ao obter seu saldo.`);
            return;
        }

        const rawBalance = match[1]; // Saldo bruto extraído
        console.log(`Saldo extraído sem formatação: ${rawBalance}`); // Exibe antes de converter

        const balance = parseFloat(rawBalance.replace(',', '')); // Remove vírgulas para converter
        console.log(`Saldo convertido para número: ${balance}`); // Confirma conversão

        bot.chat(`${username}, seu saldo atual é: $${balance.toFixed(2)}`);
    });
}

function buyGoldenApple(username, price) {
    // Verifica o saldo no sistema do jogo antes de prosseguir
    bot.chat(`/balance ${username}`);

    bot.once('messagestr', (balanceMessage) => {
        console.log(`Mensagem do servidor (saldo): "${balanceMessage}"`);

        const match = balanceMessage.match(/Saldo de .*?: \$(\d[\d,.]*)/);
        if (!match) {
            bot.chat(`${username}, erro ao obter saldo.`);
            return;
        }

        const rawBalance = match[1]; // Extração do saldo bruto
        const balance = parseFloat(rawBalance.replace(',', '')); // Conversão correta

        console.log(`Saldo identificado: ${balance}`);

        if (isNaN(balance)) {
            bot.chat(`${username}, erro ao interpretar saldo.`);
            return;
        }

        if (balance >= price) {
            // Deduz o dinheiro do sistema externo do jogo
            bot.chat(`/eco take ${username} ${price}`);

            // 📌 Transfere o valor para o banco MySQL
            db.query(`UPDATE banco SET saldo = saldo + ? WHERE jogador = ?`, [price, username], (err) => {
                if (err) {
                    bot.chat(`${username}, erro ao registrar a transação no banco.`);
                    console.error("Erro ao atualizar saldo no MySQL:", err);
                    return;
                }
                bot.chat(`${username}, você comprou uma maçã dourada por $${price} e o saldo foi registrado no banco!`);
            });

            // Entrega a maçã dourada no jogo
            bot.chat(`/give ${username} minecraft:golden_apple 1`);
        } else {
            bot.chat(`${username}, saldo insuficiente! Você tem apenas $${balance}.`);
        }
    });
}

function tradeDiamondForMoney(username, quantity) {
    const pricePerDiamond = 100; // Valor por diamante

    bot.chat(`${username}, jogue ${quantity} diamantes no chão perto de mim para vender!`);

    // Evento para capturar os diamantes quando caem perto do bot
    bot.on('itemDrop', (entity) => {
    if (!entity.item) {
        console.log("Aviso: Nenhum item encontrado na entidade dropada.");
        return;
    }

    if (entity.item.name === "diamond") {
        console.log(`Item detectado: ${entity.item.name}, Quantidade: ${entity.item.count}`);
        bot.chat(`/eco give ${username} ${entity.item.count * 100}`);
        bot.chat(`${username}, você trocou ${entity.item.count} diamantes por $${entity.item.count * 100}!`);
    }
});
}

function repairTool(username, toolType) {
    const price = 45; // Valor fixo da restauração

    // Verifica saldo antes de consertar
    bot.chat(`/balance ${username}`);

    bot.once('messagestr', (balanceMessage) => {
        console.log(`Mensagem do servidor (saldo): "${balanceMessage}"`);

        const match = balanceMessage.match(/Saldo de .*?: \$(\d[\d,.]*)/);
        if (!match) {
            bot.chat(`${username}, erro ao obter saldo.`);
            return;
        }

        const rawBalance = match[1];
        const balance = parseFloat(rawBalance.replace(',', ''));

        console.log(`Saldo identificado: ${balance}`);

        if (isNaN(balance)) {
            bot.chat(`${username}, erro ao interpretar saldo.`);
            return;
        }

        if (balance >= price) {
            bot.chat(`/eco take ${username} ${price}`);
            bot.chat(`/repair ${username} ${toolType}`);
            bot.chat(`${username}, sua ${toolType} foi restaurada por $${price}!`);
        } else {
            bot.chat(`${username}, saldo insuficiente! Você tem apenas $${balance}.`);
        }
    });
}

function sellWoodLogs(username, quantity, price) {
    const woodLogNames = ["minecraft:oak_log", "minecraft:spruce_log", "minecraft:birch_log"]; // Suporte para diferentes tipos de tronco

    // Obtém o inventário atualizado do jogador
    const inventory = bot.inventory.items();
    const woodLogs = inventory.filter(item => woodLogNames.includes(item.name));

    // Soma corretamente todas as pilhas de troncos no inventário
    const totalLogs = woodLogs.reduce((sum, item) => sum + item.count, 0);

    console.log(`${username}, você tem ${totalLogs} troncos disponíveis.`); // Log para depuração

    if (totalLogs < quantity) {
        bot.chat(`${username}, você não tem ${quantity} troncos suficientes para vender.`);
        return;
    }

    // **Transferir os troncos para o inventário do bot**
    bot.chat(`/give ANNABEL minecraft:oak_log ${quantity}`);

    // Dá dinheiro ao jogador
    bot.chat(`/eco give ${username} ${price}`);
    bot.chat(`${username}, você vendeu ${quantity} troncos por R$${price}, que foram adicionados ao inventário do bot!`);
}

function findNearestPlayer() {
    let closestPlayer = null;
    let minDistance = Infinity;

    for (const [name, entity] of Object.entries(bot.entities)) {
        if (entity.type === 'player' && name !== bot.username) {
            const distance = bot.entity.position.distanceTo(entity.position);
            if (distance < minDistance) {
                minDistance = distance;
                closestPlayer = name;
            }
        }
    }

    return closestPlayer;
}

bot.on('entityInteract', (entity, interaction) => {
    if (entity.username && admins.includes(entity.username) && interaction === 'rightClick') {
        bot.chat(`${entity.username}, abrindo meu inventário para você!`);
        bot.openChest(bot.inventory);
    }
});

bot.on('entitySpawn', (entity) => {
    if (entity.name === "item" && entity.metadata) {
        const itemName = entity.metadata[10]?.name;

        if (itemName === "diamond") {
            const nearestPlayer = findNearestPlayer();

            if (nearestPlayer) {
                bot.chat(`/eco give ${nearestPlayer} 100`);
                bot.chat(`${nearestPlayer}, você trocou um diamante por $100!`);
            } else {
                bot.chat(`Nenhum jogador perto para receber a venda.`);
            }
        }
    }
});

bot.on('chat', (username, message) => {
    if (message === "vender tronco") {
        sellWoodLogs(username, 10, 122); // Define a venda de 10 troncos por R$122
    }
});

bot.on('chat', (username, message) => {
    const args = message.split(' ');
    
    if (args[0] === "restaurar") {
        const toolType = args[1]; // Identifica o tipo da ferramenta
        
        if (["picareta", "machado", "espada"].includes(toolType)) {
            repairTool(username, toolType);
        } else {
            bot.chat(`${username}, ferramenta inválida! Use: restaurar picareta | restaurar machado | restaurar espada`);
        }
    }
});

bot.on('chat', (username, message) => {
    const args = message.split(' ');

    if (args[0] === "diamante") {
        const quantity = parseInt(args[1]) || 1; // Se não definir quantidade, assume 1
        tradeDiamondForMoney(username, quantity);
    }
});

bot.on('chat', (username, message) => {
    if (message === "maca") {
        buyGoldenApple(username, 500); // Define o preço da maçã dourada como $500
    }
});

bot.on('messagestr', (message) => {
    console.log(`Mensagem do servidor (raw): "${message}"`);

    // Verifica se a mensagem NÃO foi enviada pelo próprio bot
    if (!message.includes(bot.username) && message.includes("Saldo de")) { 
        const match = message.match(/Saldo de .*?: \$(\d[\d,.]*)/);

        if (match) {
            const rawBalance = match[1]; // Extraindo saldo bruto
            const balance = parseFloat(rawBalance.replace(',', '')); // Convertendo corretamente

            console.log(`Saldo identificado no console: ${balance}`); // Exibindo saldo extraído
            bot.chat(`${message.split(":")[0]}, seu saldo atual é: $${balance.toFixed(2)}`);
        }
    }
});

bot.on('chat', async (username, message) => {
    if (message === 'saldo') {
        getBalance(username); // Agora a função está definida antes de ser chamada
    }
});

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
          model: 'llama3.2:1b',
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
  
  else if (message.startsWith('buy ')) {
    const args = message.split(' ');
    if (args.length < 2) {
        bot.chat('Uso correto: buy <valor> [comando]');
        return;
    }

    const value = parseInt(args[1]); // Obtém o valor digitado
    const adminCommand = args.slice(2).join(' '); // Captura o comando opcional

    if (isNaN(value) || value <= 0) {
        bot.chat('Valor inválido. Digite um número positivo.');
        return;
    }

    // Verifica saldo antes de prosseguir
    bot.chat(`/balance ${username}`);

    bot.once('messagestr', (balanceMessage) => {
        console.log(`Mensagem bruta do saldo: "${balanceMessage}"`);

        const match = balanceMessage.match(/Saldo de .*?: \$(\d[\d,.]*)/);
        if (!match) {
            bot.chat(`${username}, erro ao obter saldo.`);
            return;
        }

        const rawBalance = match[1]; // Extração do saldo bruto
        const balance = parseFloat(rawBalance.replace(',', '')); // Conversão correta

        console.log(`Saldo identificado: ${balance}`);

        if (isNaN(balance)) {
            bot.chat(`${username}, erro ao interpretar saldo.`);
            return;
        }

        if (balance >= value) {
            bot.chat(`/eco take ${username} ${value}`);
            bot.chat(`${username}, compra realizada! Seu saldo restante: $${(balance - value).toFixed(2)}`);

            if (adminCommand) {
                bot.chat(adminCommand); // Executa comando do admin
                console.log(`Comando de admin executado: ${adminCommand}`);
            }
        } else {
            bot.chat(`${username}, saldo insuficiente! Você tem apenas $${balance}.`);
        }
    });
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
