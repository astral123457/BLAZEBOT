import { createBot } from 'mineflayer';
import pkg from 'mineflayer-pathfinder';
const { pathfinder, goals, Movements } = pkg; // Adicione Movements aqui
import minecraftData from 'minecraft-data'; // Importação correta do mcData

const botConfig = {
    host: 'terraperdida.roxycloud.com.br',
    port: 25565,
    username: 'BLAZABOT', // Nome de usuário da conta Minecraft
	auth: 'offline' // Desativa a autenticação online
    //auth: 'microsoft' // Use 'microsoft' para autenticação online
};

let bot;
let village; // Defina a variável `village` globalmente
let lastMessageTime = 0;
const messageCooldown = 2000;

function createBotInstance() {
    bot = createBot(botConfig);
    bot.loadPlugin(pathfinder);

    bot.on('login', () => {
        console.log('Bot conectado com sucesso no servidor');
        descerDaArvore();

        setInterval(descerDaArvore, 10000); // Chama a cada 10 segundos
        setInterval(receberKit, 15000); // Chama a cada 15 segundos
        setInterval(defenderContraZumbi, 20000); // Chama a cada 20 segundos
        setInterval(procurarComida, 25000); // Chama a cada 25 segundos
        setInterval(equiparEspada, 30000); // Chama a cada 30 segundos
        setInterval(verInventarioVillage, 35000); // Chama a cada 35 segundos
    });

    bot.on('kicked', (reason) => {
        console.log('Ocorreu um erro: ' + JSON.stringify(reason));
        reconnect();
    });

    bot.on('error', (error) => {
        console.log('Ocorreu um erro: ' + JSON.stringify(error));
        if (error.code === 'ECONNRESET') {
            reconnect();
        }
    });

    bot.on('chat', (username, message) => {
        if (username === bot.username) return;
        
        if (message === 'descer') descerDaArvore();
        if (message === 'kit') receberKit();
        if (message === 'defender') defenderContraZumbi();
        if (message === 'comida') procurarComida();
        if (message === 'espada') equiparEspada();
        if (message === 'inventario') verInventarioVillage();

        const command = message.toLowerCase().split(' ');

        if (command[0] === 'buscar' && command[1] === 'comida') {
            procurarComida();
        } else if (command[0] === '/oi') {
            receberKit();
        } else {
            sendMessage(message);
        }
    });

    bot.on('entitySpawn', (entity) => {
        console.log(`Entidade Spawn: ${entity.name}`);
        if (entity.name === 'villager') {
            village = entity;
            sendMessage('Encontrei um vilarejo!');
        } else if (entity.displayName === 'Zombie') {
            sendMessage('Cuidado! Um zumbi apareceu.');
            defenderContraZumbi(entity);
        }
    });

    async function procurarComida() {
        const foodItems = ['bread', 'apple', 'cooked_beef', 'cooked_chicken', 'cooked_mutton'];
        sendMessage('Procurando comida...');

        try {
            for (let item of foodItems) {
                let itemData = minecraftData(bot.version).itemsByName[item];
                if (!itemData) {
                    sendMessage(`Item não encontrado: ${item}`);
                    continue;
                }

                let targets = bot.findBlocks({
                    matching: itemData.id,
                    maxDistance: 32,
                    count: 1
                });

                if (targets.length && targets[0].position) {
                    await bot.pathfinder.goto(new goals.GoalBlock(targets[0].position.x, targets[0].position.y, targets[0].position.z));
                    await bot.dig(bot.blockAt(targets[0].position));
                }
            }

            sendMessage('Encontrei comida!');
        } catch (error) {
            sendMessage('Não consegui encontrar comida.');
            console.error(error);
        }
    }

    async function defenderContraZumbi(zumbi) {
        if (zumbi) {
            await equiparEspada();
            bot.attack(zumbi);
            sendMessage('Ataquei o zumbi!');
        }
    }

    async function equiparEspada() {
        const sword = bot.inventory.items().find(item => item.name.includes('sword'));
        if (sword) {
            await bot.equip(sword, 'hand');
        }
    }

    function descerDaArvore() {
        const defaultMove = new Movements(bot, minecraftData(bot.version));
        bot.pathfinder.setMovements(defaultMove);

        const groundY = bot.entity.position.y - 1;
        const goal = new goals.GoalY(groundY);

        bot.pathfinder.setGoal(goal, true);

        sendMessage('Descendo da árvore...');
    }

    function seguirVillage() {
        const defaultMove = new Movements(bot, minecraftData(bot.version));
        bot.pathfinder.setMovements(defaultMove);

        bot.on('entitySpawn', (entity) => {
            if (entity.name === 'villager') {
                const goal = new goals.GoalFollow(entity, 2);
                bot.pathfinder.setGoal(goal, true);
                sendMessage('Seguindo o village...');
            }
        });
    }

    function verInventarioVillage() {
        if (village && village.openContainer) {
            village.openContainer();
        } else {
            console.log('Village não definida ou `openContainer` não disponível');
        }
    }

    function receberKit() {
        sendMessage('Você recebeu um kit com espada, arco e flechas!');

        const sword = bot.inventory.items().find(item => item.name.includes('sword'));
        const bow = bot.inventory.items().find(item => item.name.includes('bow'));
        const arrows = bot.inventory.items().find(item => item.name.includes('arrow'));

        if (sword) {
            bot.equip(sword, 'hand').then(() => {
                sendMessage('Espada equipada!');
            }).catch((err) => {
                sendMessage('Erro ao equipar espada.');
                console.error(err);
            });
        }

        if (bow) {
            bot.equip(bow, 'hand').then(() => {
                sendMessage('Arco equipado!');
            }).catch((err) => {
                sendMessage('Erro ao equipar arco.');
                console.error(err);
            });
        }

        if (arrows) {
            bot.equip(arrows, 'off-hand').then(() => {
                sendMessage('Flechas adicionadas ao inventário!');
            }).catch((err) => {
                sendMessage('Erro ao adicionar flechas.');
                console.error(err);
            });
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

function reconnect() {
    console.log('Tentando reconectar...');
    setTimeout(createBotInstance, 5000);
}

createBotInstance();
