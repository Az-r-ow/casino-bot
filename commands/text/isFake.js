const {prefix} = require('../../config.json')
module.exports = {
  name: "isfake",
  usage: `${prefix} isfake <address>`,
  description: "Check if an address is a scam.",
  async execute(interaction, args, client){
    if(args.length <= 1)return interaction.reply({
      embeds: [{
        title: "What are you verifying ?",
        fields: [{name: "Usage :", value: this.usage, inline: false}],
        color: 0xff0000
      }]
    });

    if(args[1] === "B4ZBQsfCct7p2xFiJHtqyQjEaVZFko52K1vAYXCXTQXF")return interaction.reply({
      embeds: [{
        title: "That is our address !",
        color: 0x2ECC71
      }]
    });

    interaction.reply({
      embeds: [{
        title: "Scam !",
        color: 0xff0000
      }]
    });
  }
}
