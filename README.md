# Bot do Minecraft com inteligecia da Ai executar comandos executa eles exemplo: 
          screen -A -m -d -S ANNA node ANNABEL.js
          screen -r ANNA
          screen -ls
          kill 00000

Install modules
              mkdir nome-do-projeto

              cd nome-do-projeto
              
              npm init -y 

              npm install --no-audit

              npm set audit false
              
              npm install mineflayer mineflayer-pathfinder minecraft-data
              
              screen -A -m -d -S ANNA node ANNABEL.js
              
              para sair sem fexar o terminal CTRL + A + D os 3 juntos por vez 1 2 3 
              
              para fechar screen -ls
              
              ve o numero e digita kill 00000

# Dica varivel global que uso

use o PowerShell como admin e executa isto:

          [System.Environment]::SetEnvironmentVariable("NODE_HOME", "C:\Program Files\nodejs", "Machine")

          PS C:\Users\astra\OneDrive\Área de Trabalho\aurora> node AURORA.js

          AURORA conectada com sucesso ao servidor!


# Depedecia llama3.2

https://github.com/ollama/ollama
     
      
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

