module.exports = {
  name: 'help',
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
