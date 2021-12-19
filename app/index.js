var config = require('./config.json');
const query = require("source-server-query");
const schedule = require('node-schedule');
const moment = require('moment');
const Discord = require('discord.js');
require("file-logger")(true);
const client = new Discord.Client();
const fs = require('fs');

var message_instances = [];

// console.log('Servers to watch:', config.server.length);
GetServerStatus();

async function main() {
  var j = schedule.scheduleJob('0 * * * * *', async function () {
    loadConfig();
    await GetServerStatus();
    message_instances.forEach(function (message, index, object) {
      message.edit(GenerateStatusMessage())
        .catch(function (err) {
          console.log(err);
          if(err.message == 'Unknown Message'){
            object.splice(index, 1);
            // message was deleted from a user, and removed from instance
            console.log('message deleted and removed');
            console.log('message_instances');
            console.log(message_instances);
          }
        })
    });
  });

  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });

  client.on('message', async msg => {
    if (msg.content === '!status' && msg.channel.name == 'status') {
      msg.delete();
      let message = await msg.channel.send(GenerateStatusMessage());
      message_instances.push(message);
    }
  });

  client.login(config.discord.bottoken);

}
main().catch(console.error);

function GetServerStatus() {
  loadConfig();
  config.server.forEach(element => {
    query.info(element.ip, element.rconport, 5000)
      .then(function (value) {
        if (Object.keys(value).length === 0) {
          console.log(element.name, 'offline');
          element.status = '💔';
          element.players = 0;
          element.maxplayers = 0;
        } else {
          element.status = '💚';
          element.players = value.playersnum;
          element.maxplayers = value.maxplayers;
        }
      })
      .catch(console.log)
      .then(query.close);
  });
}

function GenerateStatusMessage() {

  let main_content = '```\n';
  let content;
  let players_cluster = 0;
  config.server.forEach(element => {
    let status_row = element.status + ' - ' + element.name + ' - Spieler: ' + element.players + '/' + element.maxplayers + '\n';
    players_cluster = players_cluster + element.players;
    main_content = main_content + status_row;
  });
  content = main_content + 'Cluster Spieler: ' + players_cluster + '\n' + 'Letzte Aktualisierung: ' + moment().format('HH:mm') + '\n```';
  return content;
}

function loadConfig(){
  let readData = fs.readFileSync('./status_bot_config.json');
  config.server = JSON.parse(readData.toString()).server;
}