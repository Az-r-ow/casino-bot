const {prefix} = require('../../config.json');
module.exports = {
  name: 'help',
  usage: `${prefix} help <command_name>`,
  description: 'Command that will explain to you the other commands.',
  async execute(interaction, args, client){
    const {MessageEmbed} = require('discord.js');

    const help_embed = new MessageEmbed();

    await client.commands.each(command => {
      let slash_availability = command.slash ? "(Available in slash)" : "";
      help_embed.addField(`${command.name} ${slash_availability}`, command.description, false);
    });

    interaction.reply({embeds: [help_embed]});

  }
}
