const {prefix} = require('../../config.json');
module.exports = {
  name: "daily",
  usage: `${prefix} daily`,
  description: "Claim your daily coins.",
  async execute(interaction, client){
    // A function that will generate a random number between 50 and 150
    function daily_amount(){
      return Math.floor((Math.random() * 100) + 50);
    }

    const User = require('../../db_connection.js');
    const ms_to_readable = require('../../helpers/ms_to_readable.js');

    await User.findOne({id: interaction.member.id}).then(user => {

      //The amount that the user has won for today
      const amount_won = daily_amount();

      // If the user has not been found
      // He will be added to the db and he will earn the daily coins
      // And the timestamp will be updated.

      if(!user){
        console.log('No user was found !');
        let newUser = new User({
          id: interaction.member.id,
          balance: amount_won,
          last_claimed: Date.now()
        });

        newUser.save().catch(e => {
          console.log("An error has occured while creating an account for the user : ", e);
          interaction.reply('An error has occured while creating your account please retry later.')
        });

        interaction.reply(`You have earned \`${amount_won}\` today ! Come back tomorrow for more.`)
      }else{

        // Checking if the user is allowed to claim
        const current_time = Date.now();

        // By comparing now's time with his last_claimed timestamp
        const time_left_ms = (user.last_claimed.getTime() + (1000 * 60 * 60 * 24) - current_time);
        const time_left = ms_to_readable(time_left_ms);
        if((current_time - user.last_claimed.getTime()) < 1000 * 60 * 60 * 24)return interaction.reply(`You still have to wait ${time_left}`);

        // If all is set, the last_claimed will be updated to match now's time
        // And the user's balance will be updated
        const amount_won = daily_amount();

        user.balance += amount_won;

        User.findOneAndUpdate({id: interaction.member.id}, {balance: user.balance, last_claimed: Date.now()}).then(() => {
          interaction.reply(`You earned : ${amount_won} today ! \nYou now have : ${user.balance}`);
        }).catch(e => {
          console.log(`An error has occured while trying to update ${interaction.member.id}'s balance which should be of : ${user.balance}'`);
        })
      }
    })
  }
}
