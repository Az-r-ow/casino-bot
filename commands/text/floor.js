// I will be implementing a new way of sending messages instead of having to import MessageEmbed and forming it every time.
//const ResponseMessage = require('../../templates/Response_Message.js');
const {MessageEmbed} = require('discord.js');
const axios = require('axios');

module.exports = {
  name: "floor",
  description: "Check the floor price of the collection",
  async execute(interaction, args, client){

    interaction.reply('This command is temporarly disabled.')

  }
}
