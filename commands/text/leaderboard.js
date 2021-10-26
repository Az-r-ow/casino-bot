const {prefix} = require('../../config.json');
module.exports = {
  name: 'leaderboard',
  usage: `${prefix} leaderboard`,
  description: 'Get the list of the top 5 richest users in the server.',
  async execute(interaction, args, client){
    const User = require('../../db_connection.js');

    await User.find({}).sort({balance: "desc"}).limit(5).then(async data => {
       await data.forEach(async user_data => {
        await interaction.guild.members.fetch(user_data.id).then(user => {
          user_data.username = user.user.username;
        });
      });


      let data_fields = data.map(user => {
        return {name: user.username, value: user.balance.toString(), inline: false};
      })

      interaction.reply({
        embeds: [{
          fields: data_fields
        }]
      }).catch(e => {
        console.log('An error has occured while sending a reply : ', e);
      })

    }).catch(e => {
      console.log('An error has occured while fetching the leaderboard : ', e);
      interaction.reply('An error has occured while fetching the list.')
    })
  }
}
