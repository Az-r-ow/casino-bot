// I will be implementing a new way of sending messages instead of having to import MessageEmbed and forming it every time.
//const ResponseMessage = require('../../templates/Response_Message.js');
const https = require('https');
const {MessageEmbed} = require('discord.js');
module.exports = {
  name: "floor",
  description: "Check the floor price of the collection",
  async execute(interaction, args, client){

    // The data collected from the data stream
    let data;

    const req = https.request(`https://api-mainnet.magiceden.io/rpc/getCollectionEscrowStats/punktee`, res => {

      res.on('data', d => {
        data += d;
      });

      res.on('end', () => {
        // Remove the undefined from the beg of the data String
        // parse it into a json
        let jsonRes = JSON.parse(data.slice(9, data.length));

        // Calculating the price in sol
        let floor_price = jsonRes.results.floorPrice * (10 ** -9);

        let replyMessage = new MessageEmbed().setColor('PURPLE')
                            .setTitle('Floor Price')
                            .setDescription(`\`${floor_price.toFixed(2)}\` SOL`)
                            .setFooter(`Status : ${res.statusCode}`)

        interaction.reply({embeds: [replyMessage]});
      })
    });

    req.on('error', (e) => {
      throw 'Error';
    });

    req.end();

  }
}
