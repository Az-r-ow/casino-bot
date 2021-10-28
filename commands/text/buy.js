const {prefix} = require('../../config.json');
const {User, ShopItem} = require('../../db_connection.js')
module.exports = {
  name: "buy",
  usage: `${prefix} buy <item_name>`,
  description: 'Buy an item that is in the shop',
  async execute(interaction, args, client){
    if(args.length === 1)return interaction.reply("What do you want to buy ?");

    let item_name = args[1].toLowerCase();
    let item;
    let user_profile;

    try{
      item = await ShopItem.findOne({name: item_name});
      if(!item)return interaction.reply("This item is not in the shop");
      user_profile = await User.findOne({id: interaction.member.id});
    }catch (e){
      console.log('An error has occured in the try statement : ', e);
    };

    if(!user_profile || user_profile.balance < item.price)return interaction.reply('You don\'t have enough money to buy this item.');

    let new_balance = user_profile.balance - item.price;

    if(item.name === "whitelist"){
      const role_id = "903040449588121621";

      interaction.member.roles.add(role_id).then(async ()=>{
        await User.findOneAndUpdate({id: interaction.member.id}, {balance: new_balance}).catch(e => console.log("An error has occured while updating " + interaction.member.id + " Balance", e));
        interaction.reply({
          embeds: [{
            description: "You are now whitelisted !",
            color: 0x9437E3
          }]
        })
      });
    }else{
      //Do something which is not specified yet !
    }
  }
}
