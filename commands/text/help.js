const {prefix} = require('../../config.json');
module.exports = {
  name: 'help',
  usage: `${prefix} help <command_name>`,
  description: 'Command that will explain to you the other commands.',
  async execute(interaction, args, client){
    const {MessageEmbed} = require('discord.js');

    const help_embed = new MessageEmbed();

    client.commands.each(command => {
      help_embed.addField(command.name, command.description, false);
    });

    interaction.reply({embeds: [help_embed]});

  }
}
