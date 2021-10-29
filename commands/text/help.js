const {prefix} = require('../../config.json');
module.exports = {
  name: 'help',
  usage: `${prefix} help <command_name>`,
  description: 'Command that will explain to you the other commands.',
  async execute(interaction, args, client){
    const {MessageEmbed} = require('discord.js');

    const help_embed = new MessageEmbed();

    let public_commands = await client.commands.filter(command => !command.restricted);

    await public_commands.each(command => {
      let slash_availability = command.slash ? "(Available in slash)" : "";
      help_embed.addField(`${prefix} ${command.name} ${slash_availability}`, command.description, false);
    });

    interaction.reply({embeds: [help_embed]});

  }
}
