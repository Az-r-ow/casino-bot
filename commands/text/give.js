module.exports = {
  name: "give",
  description: "This is a restricted command only used by the creator of the bot",
  restricted: true,
  async execute(interaction, args, client){
    const {User } = require('../../db_connection.js');
    if(args.length <= 2)return interaction.reply("How much and to who are you giving ?");

    let user_id = args[1].match(/\d{18}/g) ? args[1].match(/\d{18}/g)[0] : interaction.member.id;

    if(!+args[2])return interaction.reply("You have to specify a number");

    let number = +args[2];

    let user = await User.findOne({id: user_id});

    if(!user){
      let new_user = new User({
        id: user_id,
        balance: number
      });

      new_user.save().then(()=>{
        interaction.reply('This user has been given ' + number);
      })
    }else{
      let new_balance = user.balance + number;

      User.findOneAndUpdate({id: user_id}, {balance: new_balance}).then(() => {
        interaction.reply('This user has been given ' + number);
      })
    }
  }
}
