var config = require('./config.json');
const query = require("source-server-query");
const schedule = require('node-schedule');
const moment = require('moment');
const Discord = require('discord.js');
const SteamID = require('steamid');
var execSh = require("exec-sh");
require("file-logger")(true);
const client = new Discord.Client();
const fs = require('fs');

var message_instances = [];
// var WhereAmISearchQueue = [];
// var SearchActive = false;
var countActiveSearch = 0;
const MaxActiveSearch = 10;
const support_channel_id = '654803927350640658';
const ping_channel_id = '758023769242599604';
const prefix = '!';

// console.log('Servers to watch:', config.server.length);

async function main() {
  await GetServerStatus();
  var j = schedule.scheduleJob('0 * * * * *', async function () {
    await GetServerStatus();
    message_instances.forEach(function (message, index, object) {
      message.edit(GenerateStatusMessage())
        .catch(function (err) {
          console.log(err);
          if (err.message == 'Unknown Message') {
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
    const args = msg.content.slice(prefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
    if (msg.content === '!status' && msg.channel.name == 'status-rollenzuweisung') {
      msg.delete();
      let message = await msg.channel.send(GenerateStatusMessage());
      message_instances.push(message);
    }
    if (command === 'whereami') {
      if (!args.length) {
        return msg.channel.send(`Du musst deine SteamID64 angeben, ${msg.author}!`);
      } else {
        let sid = new SteamID(args[0]);
        if (sid.isValid() === false) {
          return msg.channel.send(`Falsche SteamID64, ${msg.author}!`);
        } else {
          msg.channel.send('Dein Charakter wird auf dem Cluster gesucht, dieser Vorgang kann bis zu 5 Minuten dauern...');
          console.log('search started for ', args[0]);
          countActiveSearch++;
          execSh('bash ./search.sh ' + args[0], true,
            function (err, stdout, stderr) {
              console.log("error: ", err);
              console.log("stdout: ", stdout);
              msg.channel.send(stdout + `${msg.author}`);
              countActiveSearch--;
              console.log('countActiveSearch: ', countActiveSearch);
              console.log("stderr: ", stderr);
            })
        }
      }
    }
  });

  client.on("voiceStateUpdate", function (oldMember, newMember) {
    var newUserChannel = newMember.channelID;
    var textChannel = client.channels.cache.get(ping_channel_id);
    console.log(newMember.member.user);
    if (newUserChannel === support_channel_id) {
      textChannel.send(`<@${newMember.member.user.id}> hat den Support betreten!`)
    }
  })

  client.login(config.discord.bottoken);

}
main().catch(console.error);

async function GetServerStatus() {
  return new Promise(async function (resolve, reject) {
    await loadConfig();
    console.log('GetServerStatus ->');
    console.log(config.server);
    let iterator = 1;
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
          query.close;
          if (config.server.length <= iterator) {
            console.log('GetServerSTatus done:');
            console.log(config.server);
            resolve();
          }
          iterator++;
        })
        .catch(console.log)
    });
  });
}

function GenerateStatusMessage() {
  let main_content = '```\n';
  let content;
  let players_cluster = 0;
  console.log('GenerateStatusMessage ->');
  console.log(config.server);
  config.server.forEach(element => {
    let status_row = element.status + ' - ' + element.name + ' - Spieler: ' + element.players + '/' + element.maxplayers + '\n';
    players_cluster = players_cluster + element.players;
    main_content = main_content + status_row;
  });
  content = main_content + 'Cluster Spieler: ' + players_cluster + '\n' + 'Letzte Aktualisierung: ' + moment().format('HH:mm') + '\n```';
  return content;
}

async function loadConfig() {
  new Promise(function (resolve, reject) {
    let readData = fs.readFileSync('./status_bot_config.json');
    config.server = JSON.parse(readData.toString()).server;
    resolve();
  });

  // config.server = Object.assign(config.server, server);
  // console.log(config);
}