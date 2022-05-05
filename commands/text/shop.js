const {prefix} = require('../../config.json');
const {ShopItem} = require('../../db_connection.js');
const { pinkHex } = require('../../helpers/consts.js');

module.exports = {
  name: 'shop',
  usage: `${prefix} shop <item_name>`,
  description: 'Show the items that are in the shop',
  async execute(interaction, args, client){

    args = args.filter(arg => arg !== this.name);

    if(args.length >= 1){
      let item_name = args[0].toLowerCase() !== this.name ? args[0].toLowerCase() : args[1].toLowerCase();

      await ShopItem.findOne({name: item_name}).then(item_info => {
        interaction.reply({
          embeds: [{
            title: item_info.name,
            description: item_info.feature,
            fields: [{name: 'Price :', value: `\`${item_info.price}\``, inline: false}],
            color: pinkHex
          }]
        })
      }).catch(e => {
        interaction.reply("This item is not in the shop.")
      })
    }else{
      await ShopItem.find({}).then(async shop_items => {
        let embed_fields = await shop_items.map(item => {
          return {name: item.name, value: `Price : \`${item.price}\``}
        });

        let comingSoon = !shop_items.length ? "Coming soon ..." : "";


        interaction.reply({
          embeds: [{
            title: 'Shop :',
            description: comingSoon,
            fields: embed_fields,
            color: pinkHex
          }]
        }).catch(e => console.log(`An error has occured while sending a reply to ${interaction.user.id}`))
      }).catch(e => {
        console.log(`An error has occured while fetching items from the shop : `, e);
        interaction.reply('An error has occured while fetching the items from the shop.')
      })
    }
  }
}
