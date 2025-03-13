# Bot do Minecraft com inteligecia da Ai executar comandos executa eles exemplo: 
          screen -A -m -d -S ANNA node ANNABEL.js
          screen -r ANNA
          screen -ls
          kill 00000

Install modules
     mkdir nome-do-projeto
     cd nome-do-projeto
     npm init -y 
     npm install mineflayer mineflayer-pathfinder minecraft-data
     screen -A -m -d -S ANNA node ANNABEL.js
     para sair sem fexar o terminal CTRL + A + D os 3 juntos por vez 1 2 3 
     para fechar screen -ls
     ve o numero e digita kill 00000
     
      
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

Comando para conversar com a IA: Mensagens que começam com "anna " ou "!ia " extraem o prompt do usuário. Se o prompt for exatamente "oi", o bot responde de forma padrão ("anna oi tudo bem"). Para outros prompts, ele faz uma requisição POST para a API (supostamente um endpoint local com o modelo llama3.2) e retorna a resposta da IA no chat do jogo.

Comando !seguir: Quando um jogador digita esse comando, o bot identifica a entidade do jogador que enviou a mensagem e ativa um objetivo (GoalFollow) do plugin pathfinder para segui-lo mantendo uma distância de 1 bloco.

Comandos de Movimento:

!pular: O bot ativa o controle de pulo por 500 ms;

!subir: Realiza uma sequência de pulos (3 pulos com intervalos de 400 ms) simulando a ação de subir;

!descer: Ativa o controle de "sneak" (agachar) por 3 segundos, ajudando a descer com segurança.
