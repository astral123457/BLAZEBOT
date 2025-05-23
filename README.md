# Bot do Minecraft com inteligecia da Ai executar comandos executa eles exemplo: 
          screen -A -m -d -S ANNA node ANNABEL.js
          screen -r ANNA
          screen -ls
          kill 00000
# Agora, crie o banco chamado banco e sua tabela principal:
```CREATE DATABASE banco;

USE banco;

CREATE TABLE banco (
    id INT PRIMARY KEY AUTO_INCREMENT,
    jogador VARCHAR(50) UNIQUE,
    saldo DECIMAL(10,2) DEFAULT 500,
    divida DECIMAL(10,2) DEFAULT 0,
    investimento DECIMAL(10,2) DEFAULT 0
);

CREATE TABLE jogadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE carteiras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jogador_id INT NOT NULL,
    endereco VARCHAR(100) UNIQUE NOT NULL,
    chave_privada TEXT NOT NULL,
    frase_secreta TEXT NOT NULL,
    FOREIGN KEY (jogador_id) REFERENCES jogadores(id) ON DELETE CASCADE
);

CREATE TABLE livro_caixa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jogador VARCHAR(255) NOT NULL,
    tipo_transacao VARCHAR(255) NOT NULL, -- Ex: "compra", "transferencia"
    valor FLOAT NOT NULL,
    moeda VARCHAR(10) NOT NULL, -- Ex: "SOL", "moedas"
    assinatura VARCHAR(255) NOT NULL, -- Signature gerada na transação
    data_hora DATETIME DEFAULT CURRENT_TIMESTAMP
);

```
![image](https://github.com/user-attachments/assets/c8564722-0171-4fb4-8b81-b459d966686a)

# Fluxo Grama
```mermaid
graph TD;
    Inicio --> Configuração_do_bot
    Configuração_do_bot --> Login_do_bot
    Login_do_bot --> Nova_entidade_detectada?
    Nova_entidade_detectada? --> Sim_E_Verificar_se_é_mob_hostil
    Sim_E_Verificar_se_é_mob_hostil --> hostil?
    hostil? --> Sim_Equipar_espada_e_atacar
    hostil? --> Não_Ignorar_entidade
    Sim_Equipar_espada_e_atacar --> Fim
    Não_Ignorar_entidade --> Fim
    
    Login_do_bot --> Comando_recebido_via_chat
    Comando_recebido_via_chat --> Comando_TPA?
    Comando_TPA? --> Sim_Enviar_solicitação_TPA
    Sim_Enviar_solicitação_TPA --> Fim

    Comando_recebido_via_chat --> Sim_Seguir_jogador
    Sim_Seguir_jogador --> Fim
    Comando_recebido_via_chat --> Não_Comando_dormir?
    Não_Comando_dormir? --> Fim
    Comando_recebido_via_chat --> Sim_Procurar_cama_e_dormir
    Sim_Procurar_cama_e_dormir --> Fim
    Comando_recebido_via_chat --> Não_Comando_atacar?
    Não_Comando_atacar? --> Fim
    Comando_recebido_via_chat --> Sim_Buscar_mob_e_atacar
    Sim_Buscar_mob_e_atacar --> Fim
    Comando_recebido_via_chat --> Não_Comando_equipar?
    Não_Comando_equipar? --> Fim
    Comando_recebido_via_chat --> Sim_Equipar_espada_e_armaduras
    Sim_Equipar_espada_e_armaduras --> Fim
    Comando_recebido_via_chat --> Não_Comando_pular/subir/descer?
    Não_Comando_pular/subir/descer? --> Fim
    Comando_recebido_via_chat --> Sim_Executar_ação_física
    Sim_Executar_ação_física --> Fim
    Comando_recebido_via_chat --> Não_Comando_admin?
    Não_Comando_admin? --> Fim
    Comando_recebido_via_chat --> Sim_Validar_código_e_executar_comando
    Sim_Validar_código_e_executar_comando --> Fim
```
![image](https://github.com/user-attachments/assets/c8564722-0171-4fb4-8b81-b459d966686a)

# Programs do projeto 
https://nodejs.org/en/download

# Install modules
              mkdir nome-do-projeto

              cd nome-do-projeto
              
              npm init -y 

              npm install --no-audit

              npm set audit false
              
              npm install mineflayer mineflayer-pathfinder minecraft-data

              npm install mineflayer axios mineflayer-pathfinder

              npm install mysql2
              
              screen -A -m -d -S ANNA node ANNABEL.js
              
              para sair sem fexar o terminal CTRL + A + D os 3 juntos por vez 1 2 3 
              
              para fechar screen -ls
              
              ve o numero e digita kill 00000

# Dica varivel global que uso

Use o PowerShell como admin e executa isto:

          [System.Environment]::SetEnvironmentVariable("NODE_HOME", "C:\Program Files\nodejs", "Machine")

          PS C:\Users\astra\OneDrive\Área de Trabalho\aurora> node AURORA.js

          AURORA conectada com sucesso ao servidor!


# Depedecia llama3.2

https://github.com/ollama/ollama

Observe que o Bot ANNABEL usa: 

ollama run llama3.2 para pc fracos com baixa memoria ram

ja o Bot AURORA usa: DeepSeek-R1	7B	4.7GB	ollama run deepseek-r1

Seu niveu de memoria ram

## Modelos de AI Tabela 2025


| Model              | Parameters | Size  | Download                         |
| ------------------ | ---------- | ----- | -------------------------------- |
| Gemma 3            | 1B         | 815MB | `ollama run gemma3:1b`           |
| Gemma 3            | 4B         | 3.3GB | `ollama run gemma3`              |
| Gemma 3            | 12B        | 8.1GB | `ollama run gemma3:12b`          |
| Gemma 3            | 27B        | 17GB  | `ollama run gemma3:27b`          |
| QwQ                | 32B        | 20GB  | `ollama run qwq`                 |
| DeepSeek-R1        | 7B         | 4.7GB | `ollama run deepseek-r1`         |
| DeepSeek-R1        | 671B       | 404GB | `ollama run deepseek-r1:671b`    |
| Llama 3.3          | 70B        | 43GB  | `ollama run llama3.3`            |
| Llama 3.2          | 3B         | 2.0GB | `ollama run llama3.2`            |
| Llama 3.2          | 1B         | 1.3GB | `ollama run llama3.2:1b`         |
| Llama 3.2 Vision   | 11B        | 7.9GB | `ollama run llama3.2-vision`     |
| Llama 3.2 Vision   | 90B        | 55GB  | `ollama run llama3.2-vision:90b` |
| Llama 3.1          | 8B         | 4.7GB | `ollama run llama3.1`            |
| Llama 3.1          | 405B       | 231GB | `ollama run llama3.1:405b`       |
| Phi 4              | 14B        | 9.1GB | `ollama run phi4`                |
| Phi 4 Mini         | 3.8B       | 2.5GB | `ollama run phi4-mini`           |
| Mistral            | 7B         | 4.1GB | `ollama run mistral`             |
| Moondream 2        | 1.4B       | 829MB | `ollama run moondream`           |
| Neural Chat        | 7B         | 4.1GB | `ollama run neural-chat`         |
| Starling           | 7B         | 4.1GB | `ollama run starling-lm`         |
| Code Llama         | 7B         | 3.8GB | `ollama run codellama`           |
| Llama 2 Uncensored | 7B         | 3.8GB | `ollama run llama2-uncensored`   |
| LLaVA              | 7B         | 4.5GB | `ollama run llava`               |
| Granite-3.2         | 8B         | 4.9GB | `ollama run granite3.2`          |

> [!NOTE]
> Você deve ter pelo menos 8 GB de RAM disponíveis para executar os modelos 7B, 16 GB para executar os modelos 13B e 32 GB para executar os modelos 33B.

node Banco.js
os comandos tem que ser com ! e nao com /
!balance → Mostra o saldo do jogador.
!loan [quantia] → Solicita um empréstimo.
!paydebt [quantia] → Paga parte da dívida.
!invest [quantia] → Investimento com retorno futuro.
!buyapple compra maca por 500 conto


fiz no banco de dados o ruin que usa outro dinheiro
aqui a gente tem a Des graça e o Sucesso o Significado de Annabel e Graça Agora, quando um jogador usa o comando /balance, se ele não estiver no banco de dados, será automaticamente registrado com um saldo inicial de $500! 
Tente usar /balance no jogo e veja se seu nome é registrado corretamente! Se precisar de mais ajustes, me avise. 
Quer adicionar um bônus de boas-vindas para novos jogadores? 

![image](https://github.com/user-attachments/assets/5cc1de6e-fb1a-4cb7-a4ce-595849109d1e)

     
      
![image](https://github.com/user-attachments/assets/e0ba7a84-16a0-4a9b-badd-75350d4e3928)

# Diagrama de Fluxo Simples

       [Início: Bot se conecta]
       
                     │
                     ▼
       [Evento: 'login' é disparado]
                     │
                     ▼
         [Carrega plugin pathfinder]
                     │
                     ▼
         [Aguarda comandos no chat]
                     │
       ┌─────────────┼─────────────┐
       │                           │
       ▼                           ▼
     [Comando: anna/!ia ...]   [Outros comandos (!seguir, !pular, !subir, !descer)]
       │                           │
       ▼                           ▼
      [Requisição à API e resposta]   [Executa ação no jogo]

Comando para conversar com a IA: 

Mensagens que começam com "anna " ou "!ia "

"oi", o bot responde de forma padrão ("anna oi tudo bem"). 

faz uma requisição POST para a API (supostamente um endpoint local com o modelo llama3.2 e retorna a resposta da IA no chat do jogo.

Comando !seguir: Quando um jogador digita esse comando, o bot identifica a entidade do jogador que enviou a mensagem e ativa um objetivo (GoalFollow) do plugin pathfinder para segui-lo mantendo uma distância de 1 bloco.

Comandos de Movimento:

!pular: O bot ativa o controle de pulo por 500 ms;

!subir: Realiza uma sequência de pulos (3 pulos com intervalos de 400 ms) simulando a ação de subir;

!descer: Ativa o controle de "sneak" (agachar) por 3 segundos, ajudando a descer com segurança.

![image](https://github.com/user-attachments/assets/93025053-73fb-4e49-8cd8-77332714f014)

Quando logar, o bot exibirá algo como:

Online [BOT_ID:1234]

Use esse número (nesse exemplo, 1234) para os comandos admin.
mas voce deve estar na lista de admin do boot

!admin 4027 /playsound minecraft:ambient.cave ambient @a ~ ~ ~ 1 1 0

![image](https://github.com/user-attachments/assets/864f59c3-bad9-4edc-acf9-93f7bf6a1d05)

Agendador de tarefas

Pressione as teclas Windows + R no teclado para abrir o Executar.

Digite taskschd.msc e pressione Enter. Isso abrirá diretamente o Agendador de Tarefas.

1 exemplo no meu caso Programa/Script: C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe

2 argumento: -ExecutionPolicy Bypass -File "Aurora.ps1"

3 Diretorio: C:\Users\astra\OneDrive\Área de Trabalho\aurora

![image](https://github.com/user-attachments/assets/564ffcff-8a54-4d43-b406-96568e3767c2)

Bot BANCO.js

![image](https://github.com/user-attachments/assets/0a2d21de-9d89-4cd3-8073-0b205522d2b1)

coamndos:

!createpandawallet // cria sua carteira caso nao tenha uma carteira 


!pandabalance // ainda nao esta funcionando esperimental para moeda pandafull


!transferpanda // ainda nao esta funcionando esperimental para moeda pandafull


!solana // mostra o saldo da carteira solana


!balance // mostra o saldo da moeda do jogo


!loan <value>//pega emprestimo


!paydebt <value> <player>// paga outro jogador com a moeda do jogo


!invest <value> // investe um valor para receber de volta com um tempo acoes


!buyapple // compra uma maça encantanda por 500 moedas do jogo


!buyaxe // nao esta funcionando 


!buypickaxe // nao esta funcionando


!buysword // nao esta funcionando


!buyemerald // compra esmeralda por 250 moedas do jogo


!compra // compra 3000 moedas por 3 sol criptomoeda dev


!transferencia <valor> <player> //  tranfere o Sol dev criptomoeda para do seu amigo exemplo: !transferencia 2 BerserkerWolf


!buynetheritepickaxe // nao esta funcionando


!transacoes //mostra transacoes da ultima hora



![image](https://github.com/user-attachments/assets/c580036e-9a0c-486b-8aa5-4f6bf8e1ca31)

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/H2H411P12P)





