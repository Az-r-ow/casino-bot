const {prefix} = require('../../config.json');
module.exports = {
  name: 'leaderboard',
  usage: `${prefix} leaderboard`,
  description: 'Get the list of the top 5 richest users in the server.',
  async execute(interaction, args, client){
    const User = require('../../db_connection.js');

    await User.find({}).sort({balance: "desc"}).limit(5).then(async data => {
      
      // For is used in this case because it supports async await
      for(user_data of data){
        let user_info = await interaction.guild.members.fetch(user_data.id);
        user_data.username = user_info.user.username;
      }

      let user_rank = 1;

      await data.forEach(user => {
        user.username = user_rank === 1 ? '🥇- ' + user.username :
                        user_rank === 2 ? '🥈- ' + user.username :
                        user_rank === 3 ? '🥉- ' + user.username :
                        `${rank}- ${user.username}`;
        user_rank++;
      })


      let data_fields = await data.map(user => {
        return {name: user.username, value: `\`${user.balance.toString()}\``, inline: false};
      })

      interaction.reply({
        embeds: [{
          title: 'Leaderboard :',
          fields: data_fields,
          color: 0x9437E3,
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
