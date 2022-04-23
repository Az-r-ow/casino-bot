const {User} = require('../../db_connection.js');
const {prefix} = require('../../config.json');
module.exports = {
  name: 'balance',
  usage: `${prefix} balance <user_tag>`,
  description: 'Check your balance',
  async execute(interaction, args, client){

    const {userMention} = require('@discordjs/builders');

    //Define this var with a default value
    let user_id = interaction.member.id;

    if(args.length > 1){
      // Assign it the tag if matched
      user_id = args[1].match(/\d{18}/g) ? args[1].match(/\d{18}/g)[0] : interaction.member.id;
    };

    user_id = !args.length ? user_id : args[0].match(/\d{18}/g) ? args[0] : user_id;

    let username;

    const user = await interaction.guild.members.fetch(user_id).then(user =>{
      username = user.user.username;
    });


    await User.findOne({id: user_id, guild_id: interaction.guildId}).then(user_data => {
      //No user found
      // Send an empty balance
      if(!user_data)return interaction.reply({
        embeds: [{
          fields: [{name: `${username}\'s Balance :`, value: '\`0\`'}]
        }]
      });

      interaction.reply({embeds: [{
        fields: [{name: `${username}\'s Balance :`, value: `\`${user_data.balance}\`` }]
      }]
    });
    })
  }
}
