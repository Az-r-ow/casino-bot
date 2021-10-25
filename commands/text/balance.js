const User = require('../../db_connection.js');
module.exports = {
  name: 'balance',
  description: 'Check your balance',
  async execute(interaction, client){
    await User.findOne({id: interaction.member.id}).then(user_data => {
      //No user found
      // Send an empty balance
      if(!user_data)return interaction.reply('Your balance is \`0\`');
      
      interaction.reply(`Your balance is : \`${user_data.balance}\``);
    })
  }
}
