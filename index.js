const fs = require('fs');
const {Client, Intents, Collection} = require('discord.js');
const {token, prefix} = require('./config.json');

// Connect to the db
require('./db_connection.js');

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES], presence: {status: 'online', activities: [{name: `${prefix} help`, type: 'WATCHING', url: 'https://punk-tee.com'}]}});

//Setting up collections for caching active interactions
client.active_interactions = new Collection();

//Setting up collections for caching commands
client.commands = new Collection();

const command_files = fs.readdirSync('./commands/text').filter(file => file.endsWith('.js'));

// Loading the commands into the collection
for(const file of command_files){

  const command = require(`./commands/text/${file}`);

  console.log(`${file} has been loaded !`);

  client.commands.set(command.name, command);

}


client.once('ready', () => {
  console.log('All set !');

  // client.options.presence.status = 'online';
  // client.options.presence.activities = [{name: prefix, type: 'WATCHING', url: 'https://punk-tee.com'}]

});

client.on('messageCreate', async message => {

  //Ignore messages if they're not sent by a user and does not start with the prefix
  if(message.author.bot || !message.content.startsWith(prefix))return;

  //If the user has already an active interaction ignore his message
  if(client.active_interactions.get(message.author.id))return;

  let args = message.content.replace(/\s+/g, " ").split(" ").splice(1);

  if(!args.length)return;

  let commandName = args[0].toLowerCase();

  const command = client.commands.get(commandName);

  // If the command is not found exit
  if(!command)return;

  if(command.restricted && message.author.id !== "468141864134901770")return;

  try{

    await command.execute(message, args, client);

  }catch (e){
    console.log('An error has occured while excuting your command : ', e);
    await message.reply("An error has occured !");
  };

});

client.on('interactionCreate', async interaction => {
  if(!interaction.isCommand())return;

  const command = client.commands.get(interaction.commandName);

  // This variable is only valid in case I have one option proposed
  const args = interaction.options._hoistedOptions.length ? interaction.options._hoistedOptions[0].value.replace(/\s+/g, " ").split(" ") : [];

  // If the command is not found exit
  if(!command)return;

  try{
    await command.execute(interaction, args, client);
  }catch(e){
    console.log('An error has occured while interacting with your command : ', e);
    interaction.reply({content: "There was an error while trying to execute this command."});
  }
})


client.login(token);
