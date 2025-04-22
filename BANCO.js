// Importa os módulos necessários
const mineflayer = require('mineflayer');
const axios = require('axios');
const { pathfinder, Movements, goals: { GoalFollow } } = require('mineflayer-pathfinder');
const fs = require('fs');

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
  host: 'debian.tail561849.ts.net', // IP do servidor Minecraft
  port: 1212, // Porta do servidor
  username: 'AMAURI', // Nome do bot
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
  console.log('AMAURI conectada ao servidor!');
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

//📌 Função para comprar esmeraldas no banco
function buyEmerald(player) {
    const emeraldPrice = 250; // Define o preço da esmeralda

    db.query(`SELECT saldo FROM banco WHERE jogador = ?`, [player], (err, result) => {
        if (err) {
            bot.chat(`${player}, erro ao acessar o banco.`);
            console.error("Erro ao consultar saldo:", err);
            return;
        }

        if (result.length > 0 && result[0].saldo >= emeraldPrice) {
            // Deduz o saldo do jogador
            db.query(`UPDATE banco SET saldo = saldo - ? WHERE jogador = ?`, [emeraldPrice, player], (err) => {
                if (err) {
                    bot.chat(`${player}, erro ao processar compra.`);
                    console.error("Erro ao atualizar saldo:", err);
                    return;
                }

                // Dá a esmeralda ao jogador
                bot.chat(`${player}, você comprou uma esmeralda por $${emeraldPrice}!`);
                bot.chat(`/give ${player} minecraft:emerald 1`);
            });
        } else {
            bot.chat(`${player}, saldo insuficiente para comprar uma esmeralda.`);
        }
    });
}

//📌 Função para comprar picareta de Netherit
function buyNetheritePickaxe(player) {
    const pickaxePrice = 2000; // Define o preço da picareta

    db.query(`SELECT saldo FROM banco WHERE jogador = ?`, [player], (err, result) => {
        if (err) {
            bot.chat(`${player}, erro ao acessar o banco.`);
            console.error("Erro ao consultar saldo:", err);
            return;
        }

        if (result.length > 0 && result[0].saldo >= pickaxePrice) {
            // Deduz o saldo do jogador
            db.query(`UPDATE banco SET saldo = saldo - ? WHERE jogador = ?`, [pickaxePrice, player], (err) => {
                if (err) {
                    bot.chat(`${player}, erro ao processar compra.`);
                    console.error("Erro ao atualizar saldo:", err);
                    return;
                }

                // Dá a picareta de Netherite ao jogador com encantamentos
                bot.chat(`${player}, você comprou uma Picareta de Netherite por $${pickaxePrice}!`);
                bot.chat(`/give ${player} minecraft:netherite_pickaxe{Enchantments:[{id:"minecraft:efficiency",lvl:5},{id:"minecraft:unbreaking",lvl:3},{id:"minecraft:fortune",lvl:3}]} 1`);
            });
        } else {
            bot.chat(`${player}, saldo insuficiente para comprar uma Picareta de Netherite.`);
        }
    });
}

// 📌 Compra de Machado de Diamante Encantado
function buyEnchantedAxe(player) {
    db.query(`SELECT saldo FROM banco WHERE jogador = ?`, [player], (err, result) => {
        if (err) throw err;
        if (result.length > 0 && result[0].saldo >= 1000) { // Defina o preço conforme necessário
            db.query(`UPDATE banco SET saldo = saldo - 1000 WHERE jogador = ?`, [player], (err) => {
                if (err) throw err;
                bot.chat(`${player}, você comprou um Machado de Diamante Encantado por $1000!`);
                bot.chat(`/minecraft:give ${player} minecraft:diamond_axe{Enchantments:[{id:"minecraft:efficiency",lvl:5},{id:"minecraft:unbreaking",lvl:3},{id:"minecraft:fortune",lvl:3}]} 1`);
            });
        } else {
            bot.chat(`${player}, saldo insuficiente para comprar.`);
        }
    });
}

// 📌 Compra de Picareta de Diamante Encantada
function buyEnchantedPickaxe(player) {
    db.query(`SELECT saldo FROM banco WHERE jogador = ?`, [player], (err, result) => {
        if (err) throw err;
        if (result.length > 0 && result[0].saldo >= 1200) { 
            db.query(`UPDATE banco SET saldo = saldo - 1200 WHERE jogador = ?`, [player], (err) => {
                if (err) throw err;
                bot.chat(`${player}, você comprou uma Picareta de Diamante Encantada por $1200!`);
                bot.chat(`/minecraft:give ${player} minecraft:diamond_pickaxe{Enchantments:[{id:"minecraft:efficiency",lvl:5},{id:"minecraft:unbreaking",lvl:3},{id:"minecraft:fortune",lvl:3}]} 1`);
            });
        } else {
            bot.chat(`${player}, saldo insuficiente para comprar.`);
        }
    });
}

// 📌 Compra de Espada de Diamante Encantada
function buyEnchantedSword(player) {
    db.query(`SELECT saldo FROM banco WHERE jogador = ?`, [player], (err, result) => {
        if (err) throw err;
        if (result.length > 0 && result[0].saldo >= 1500) { 
            db.query(`UPDATE banco SET saldo = saldo - 1500 WHERE jogador = ?`, [player], (err) => {
                if (err) throw err;
                bot.chat(`${player}, você comprou uma Espada de Diamante Encantada por $1500!`);
                bot.chat(`/minecraft:give ${player} minecraft:diamond_sword{Enchantments:[{id:"minecraft:sharpness",lvl:5},{id:"minecraft:unbreaking",lvl:3},{id:"minecraft:looting",lvl:3}]} 1`);
            });
        } else {
            bot.chat(`${player}, saldo insuficiente para comprar.`);
        }
    });
}




// 📌 Função para verificar saldo de SOL executando como www-data via Docker
function getSolanaBalance() {
    return new Promise((resolve, reject) => {
        const command = 'sudo docker run --rm -v /home/astral/astralcoin:/solana-token -v /home/astral/astralcoin/solana-data:/root/.config/solana heysolana solana balance $walletAddress 2>&1';
        
        exec(command, (error, stdout) => {
            if (error) {
                reject(`Erro ao executar comando Solana: ${error.message}`);
                return;
            }
            resolve(stdout.trim());
        });
    });
}

// 📌 Executa a verificação de saldo de Solana
async function checkBalancesol() {
    try {
        const solBalance = await getSolanaBalance();
        console.log(`Saldo Solana: ${solBalance}`);
		bot.chat(`Saldo Solana: ${solBalance}`);
    } catch (error) {
        console.error(error);
    }
}

function generatePandaWallet(playerName) {
    return new Promise((resolve, reject) => {
        const walletPath = `/solana-token/wallets/${playerName}_wallet.json`;

        // 📌 Criação da carteira no Docker
        const createCommand = `sudo -u www-data docker run --rm -v /home/astral/astralcoin/wallets:/solana-token/wallets \
        -v /home/astral/astralcoin/solana-data:/root/.config/solana \
        heysolana solana-keygen new --no-passphrase --outfile ${walletPath} --force 2>&1`;

        exec(createCommand, (error, stdout) => {
            if (error) {
                reject(`Erro ao criar carteira PANDA FULL para ${playerName}: ${error.message}`);
                return;
            }

            console.log("Saída do comando:", stdout);

            const walletData = stdout.trim().split('\n');

            // Captura o endereço público (pubkey)
            const walletAddressLine = walletData.find(line => line.includes('pubkey'));
            const walletAddress = walletAddressLine ? walletAddressLine.split(': ')[1] : null;

            // Captura a seed phrase
            const seedIndex = walletData.findIndex(line => line.includes('Save this seed phrase to recover your new keypair:'));
            const secretPhrase = seedIndex !== -1 ? walletData.slice(seedIndex + 1, seedIndex + 12).join(' ') : null;

            if (!walletAddress || !secretPhrase) {
                reject(`Erro ao extrair dados da carteira para ${playerName}. Formato inesperado.`);
                return;
            }

            // 📌 Leitura do arquivo JSON via Docker
            const readCommand = `sudo -u www-data docker run --rm -v /home/astral/astralcoin:/solana-token \
            -v /home/astral/astralcoin/solana-data:/root/.config/solana \
            heysolana cat ${walletPath}`;

            exec(readCommand, (err, jsonOutput) => {
                if (err) {
                    reject(`Erro ao ler arquivo da carteira para ${playerName}: ${err.message}`);
                    return;
                }

                try {
                    const secretKeyArray = JSON.parse(jsonOutput.trim());
                    const privateKey = secretKeyArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

                    // 📌 Imprimir no console para depuração
                    console.log("📜 Seed Phrase:", secretPhrase);
                    console.log("🔑 Chave Privada (Array):", secretKeyArray);
                    console.log("🔒 Chave Privada (Hex):", privateKey);

                    // 📌 Buscar o ID do jogador
                    const getPlayerIdQuery = `SELECT id FROM jogadores WHERE nome = ?`;
                    db.query(getPlayerIdQuery, [playerName], (playerErr, results) => {
                        if (playerErr) {
                            console.error("❌ Erro ao buscar jogador:", playerErr);
                            reject(playerErr);
                            return;
                        }

                        let jogadorId;

                        if (results.length === 0) {
                            // 📌 Jogador não encontrado, então cria um novo
                            const insertPlayerQuery = `INSERT INTO jogadores (nome) VALUES (?)`;
                            db.query(insertPlayerQuery, [playerName], (insertErr, insertResult) => {
                                if (insertErr) {
                                    console.error("❌ Erro ao cadastrar jogador:", insertErr);
                                    reject(insertErr);
                                    return;
                                }

                                jogadorId = insertResult.insertId;
                                salvarCarteira(jogadorId, walletAddress, privateKey, secretPhrase, resolve, reject);
                            });
                        } else {
                            jogadorId = results[0].id;
                            salvarCarteira(jogadorId, walletAddress, privateKey, secretPhrase, resolve, reject);
                        }
                    });

                } catch (error) {
                    reject(`Erro ao processar JSON da carteira para ${playerName}: ${error.message}`);
                }
            });
        });
    });
}

// 📌 Função auxiliar para salvar a carteira no banco
function salvarCarteira(jogadorId, walletAddress, privateKey, secretPhrase, resolve, reject) {
    const sql = `INSERT INTO carteiras (jogador_id, endereco, chave_privada, frase_secreta) VALUES (?, ?, ?, ?)`;
    db.query(sql, [jogadorId, walletAddress, privateKey, secretPhrase], (dbErr) => {
        if (dbErr) {
            console.error("❌ Erro ao salvar carteira no banco:", dbErr);
            reject(dbErr);
            return;
        }
        console.log("✅ Carteira salva no banco com sucesso!");
        resolve({ walletAddress, privateKey, secretPhrase });
    });
}

// 📌 Registra a carteira no MySQL
async function registerPandaWallet(playerName) {
    try {
        const wallet = await generatePandaWallet(playerName);

        // 📌 Verifica se o jogador já existe no banco
        db.query(`SELECT id FROM jogadores WHERE nome = ?`, [playerName], (err, result) => {
            if (err) {
                console.error(`Erro ao buscar jogador:`, err);
                return;
            }

            let jogadorId;

            if (result.length > 0) {
                jogadorId = result[0].id; // Se o jogador existir, pega o ID
            } else {
                // Se não existir, insere e obtém o ID
                db.query(`INSERT INTO jogadores (nome) VALUES (?)`, [playerName], (err, insertResult) => {
                    if (err) {
                        console.error(`Erro ao inserir jogador:`, err);
                        return;
                    }
                    jogadorId = insertResult.insertId; // Obtém ID recém-criado

                    // 📌 Agora insere a carteira no banco
                    db.query(`
                        INSERT INTO carteiras (jogador_id, endereco, chave_privada, frase_secreta) 
                        VALUES (?, ?, ?, ?)`, 
                        [jogadorId, wallet.walletAddress, wallet.privateKey, wallet.secretPhrase], (err) => {
                            if (err) {
                                console.error(`Erro ao salvar carteira no banco:`, err);
                                return;
                            }
                            console.log(`Carteira PANDA FULL criada para ${playerName}: ${wallet.walletAddress}`);
                    });
                });
            }
        });

    } catch (error) {
        console.error(error);
    }
}



function getTokenBalance(playerName) {
    return new Promise(async (resolve, reject) => {
        try {
            // 📌 Obtendo a carteira do jogador
            const playerWallet = await getPlayerWallet(playerName);
            if (!playerWallet) {
                reject(`${playerName}, você ainda não tem uma carteira PANDA FULL registrada.`);
                return;
            }

            // 📌 Executando comando para verificar saldo na carteira do jogador
            const command = `sudo -u www-data docker run --rm -v /home/astral/astralcoin:/solana-token -v /home/astral/astralcoin/solana-data:/root/.config/solana heysolana spl-token balance ${playerWallet} 2>&1`;

            exec(command, (error, stdout) => {
                if (error) {
                    reject(`Erro ao buscar saldo da carteira do jogador ${playerName}: ${error.message}`);
                    return;
                }
                resolve(stdout.trim());
            });

        } catch (error) {
            reject(`Erro ao verificar carteira do jogador ${playerName}: ${error.message}`);
        }
    });
}

// 📌 Função para transferir tokens PANDA FULL
async function transferBalance(recipientName, amount) {
    return new Promise(async (resolve, reject) => {
        try {
            // 📌 Obtendo a carteira do destinatário
            const recipientWallet = await getPlayerWallet(recipientName);

            if (!recipientWallet) {
                reject(`${recipientName} não tem uma carteira PANDA FULL registrada.`);
                return;
            }

            if (isNaN(amount) || amount <= 0) {
                reject(`Valor inválido para transferência.`);
                return;
            }

            // 📌 Executando a transferência da carteira **BANCO** para o jogador
            const command = `sudo -u www-data docker run --rm -v /home/astral/astralcoin:/solana-token -v /home/astral/astralcoin/solana-data:/root/.config/solana heysolana spl-token transfer mntjKpj39H1JJD9vR2Brvt2PPFkoLgbixpoNUYQXtu2 ${amount} ${recipientWallet} --fund-recipient --allow-unfunded-recipient 2>&1`;

            console.log(`Executando transferência: ${command}`); // Para debug

            exec(command, (error, stdout) => {
                if (error) {
                    reject(`Erro ao transferir ${amount} PANDA FULL para ${recipientName}: ${error.message}`);
                    return;
                }
                resolve(stdout.trim());
            });

        } catch (error) {
            reject(`Erro ao processar transferência para ${recipientName}: ${error.message}`);
        }
    });
}

function getPlayerWallet(playerName) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT endereco FROM carteiras WHERE jogador_id = (SELECT id FROM jogadores WHERE nome = ?)`, [playerName], (err, result) => {
            if (err) {
                reject(`Erro ao buscar carteira: ${err.message}`);
                return;
            }
            if (result.length === 0) {
                resolve(null); // Jogador não tem carteira
            } else {
                resolve(result[0].endereco); // Retorna o endereço da carteira
            }
        });
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


bot.on('chat', async (username, message) => {
    if (username === bot.username) return;

    const args = message.split(' ');
    const command = args[0];
    const amount = parseFloat(args[1]);

    // 📌 Verifica se o jogador tem uma carteira no banco
    const playerWallet = await getPlayerWallet(username);

    if (!playerWallet && command !== '!createpandawallet') {
        bot.chat(`${username}, você ainda não tem uma carteira PANDA FULL. Digite !createpandawallet para criar uma.`);
        return;
    }

    switch (command) {
        case '!createpandawallet':
            try {
                await registerPandaWallet(username);
                bot.chat(`${username}, sua carteira PANDA FULL foi criada e registrada!`);
            } catch (error) {
                bot.chat(`${username}, erro ao criar sua carteira.`);
            }
            break;
        case '!pandabalance':
            try {
                const balance = await getTokenBalance(playerWallet);
                bot.chat(`${username}, saldo PANDA FULL: ${balance}`);
            } catch (error) {
                bot.chat(`${username}, erro ao consultar saldo.`);
            }
            break;
        case '!transferpanda':
    if (args.length === 3) {
        const recipientName = args[1];
        const amount = parseFloat(args[2]);

        try {
            const result = await transferBalance(recipientName, amount);
            bot.chat(`${username}, transferência de ${amount} PANDA FULL realizada para ${recipientName}.`);
        } catch (error) {
            bot.chat(`${username}, erro ao transferir tokens: ${error}`);
        }
    } else {
        bot.chat(`${username}, uso inválido. Tente: !transferpanda <jogador_destino> <quantidade>`);
    }
    break;
        case '!solana':
            checkBalancesol();
            break;
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
        case '!buyaxe':
            buyEnchantedAxe(username);
            break;
        case '!buypickaxe':
            buyEnchantedPickaxe(username);
            break;
        case '!buysword':
            buyEnchantedSword(username);
            break;
		case '!buyemerald':
            buyEmerald(username);
            break;
		case '!buynetheritepickaxe':
            buyNetheritePickaxe(username);
            break;
        default:
            bot.chat(`${username}, comando inválido! Use !help para ver a lista de comandos.`);
            break;
    }
});