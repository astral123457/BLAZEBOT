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
