const {prefix} = require('../../config.json');
const { MessageButton, MessageActionRow } = require('discord.js');
const { wonImgUrl, loseImgUrl } = require('../../helpers/consts.js');

module.exports = {
  name: "highlow",
  description: "Double your bet or loose all",
  usage: `${prefix} ${this.name} <your_bet>`,
  aliases: ['hl'],
  async execute(interaction, args, client){
    // Import the user schema
    const { User } = require('../../db_connection.js');

    // Check the passed args
    if((args.length === 1) || !+args[1] || +args[1] <= 1)return interaction.reply("You have to bet something.");

    const user_bet = Math.floor(args[1]);

    let user_balance;

    try{
      const user_profile = await User.findOne({id: interaction.member.id});
      if(user_profile.balance < user_bet)return interaction.reply("You don't have that much money.");
      user_balance = user_profile.balance;
    }catch (e){
      console.log('An error has occured while fetching ', interaction.member.id, ' : ', e);
    };

    const multiplier = 2;

    //Creating the buttons
    const row = new MessageActionRow();
    const high = new MessageButton().setLabel("High").setStyle("SUCCESS").setCustomId('1');
    const low = new MessageButton().setLabel("Low").setStyle("DANGER").setCustomId('0');

    row.addComponents(high, low);


    interaction.reply({
      embeds: [{
        description: "High or low ?",
        fields: [{name: "Multiplier :", value: `\`${multiplier}x\``, inline: false}],
        color: 0x2ECC71
      }],
      components: [row]
    }).then(async message => {
      const filter = c_interaction => c_interaction.isButton() && c_interaction.user.id === interaction.member.id;

      const collector = message.createMessageComponentCollector({filter, idle: 15000});

      let user_pick;

      // Generate a random number between 1 - 6 (included)
      let dice = Math.floor((Math.random() * 6) + 1);

      collector.on('collect', i => {
        user_pick = i.customId === "0" ? "Low" : "High";

        i.reply({
          content: 'Rolling the dice ...',
          ephemeral: true
        });

        // Win conditions
        if((+i.customId && dice >= 4) || (!+i.customId && dice <= 3))return collector.stop('won');

        //Anything else is lost
        return collector.stop('loss');
      });

      collector.on('end', async (collected, reason) => {
        const color = reason === 'won' ? 0x2ECC71 : 0xff0000;
        const reason_loss = reason === "idle" ? "Timeout" : "Lost";

        // Disable the button to end the interaction
        message.components[0].components.forEach(button => button.disabled = true);

        if(reason === 'won'){
          user_balance = (user_balance - user_bet) + (user_bet * multiplier);
          await User.findOneAndUpdate({id: interaction.member.id}, {balance: user_balance}).catch(e => {
            console.log('An error while updating : ', interaction.member.id,  e);
            return message.edit({
              embeds: [{
                title: 'An error has occured :',
                description: 'Please contact the developper.',
                color
              }],
              components: message.components
            })
          });

          return message.edit({
            embeds: [{
              title: `You won !`,
              fields: [
                {name: `Picked :`, value: `\`${user_pick}\``, inline: true},
                {name: `Rolled :`, value: `\`${dice}\``, inline: true},
                {name: `Multiplier :`, value: `\`${multiplier}x\``, inline: false}
              ],
              color,
              image: {
                url: wonImgUrl
              }
            }],
            components: message.components
          })
        }else{
          user_balance -= user_bet;
          await User.findOneAndUpdate({id: interaction.member.id}, {balance: user_balance}).catch(e => {
            console.log('An error has occured while updating : ', interaction.member.id, e);
            return message.edit('An error has occured !');
          });

          const message_embed = reason === "idle" ? {
            title: `Game timed out !`,
            description: 'You lost this bet.',
            color
          } : {
            title: 'You Lost !',
            fields: [
              {name: `Picked :`, value: `\`${user_pick}\``, inline: true},
              {name: `Rolled :`, value: `\`${dice}\``, inline: true},
              {name: 'Multiplier :', value: `\`0x\``, inline: false}
            ],
            color,
            image: {
              url: loseImgUrl
            }
          };

          return message.edit({
            embeds: [message_embed],
            components: message.components
          })
        }
      })
    })
  }
}
