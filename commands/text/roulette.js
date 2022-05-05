const {MessageButton, MessageActionRow} = require('discord.js');
const load_barrel = require('../../helpers/load_barrel.js');
const {prefix} = require('../../config.json');
const { wonImgUrl, loseImgUrl } = require('../../helpers/consts.js');


module.exports = {
  name: 'roulette',
  usage: `${prefix} roulette <amount>`,
  description: 'Survive the roulette game to gain your bet.\n6 bullets gun is used, the more you replay, the more you gain (x4 if you survive the 5 shots).\nAlways count your shots because this is a realistic version of the game!',
  async execute(interaction, args, client){

    const { User } = require('../../db_connection.js');
    //No arguments provided
    // Return error message
    if((args.length === 1) || !+args[1] || +args[1] <= 1)return interaction.reply({embeds: [{
      description: "You have to bet something ! ",
    }]
    });

    const user_bet = +args[1];
    let curr_multiplier = 1.3;
    let curr_round = 0;

    let enough_balance = true;
    let user_balance;

    try {
      await User.findOne({id: interaction.author.id}).then(user_data => {
        if(user_bet > user_data.balance){
          enough_balance = false;
          interaction.reply({embeds: [{
            description: "You don't have that much money !"
          }]});
        };
        user_balance = user_data.balance;
      });
    } catch (e) {
      console.log('An error has occured while trying to fetch ' + interaction.author.id + ' profile : ', e);
      return interaction.reply({
        content: 'You must have some money first ! Claim your daily coins to be able to gamble.'
      })
    };

    // Quit if the user doesn't have enough
    if(!enough_balance)return;

    // Let the game begin :
    let barrel = load_barrel();

    client.active_interactions.set(interaction.author.id, interaction);

    if(barrel.indexOf(1) === 0){
      user_balance -= Math.ceil(user_bet);
      try {
        await User.findOneAndUpdate({id: interaction.author.id}, {balance: user_balance});
      } catch (e) {
        console.log(`An error has occured while updating ${interaction.author.id} balance`, e);
        return interaction.reply({embed: [{
          description: 'An error has occured please contact the developper'
        }]});
      };
      client.active_interactions.delete(interaction.author.id);
      return interaction.reply({
        embeds: [{
        description: 'Unlucky ! You died.',
        color: 0xff0000,
        image: {
          url: loseImgUrl
        }
      }]
    })
    }


    //Adding the buttons
    const row = new MessageActionRow();
    const yes = new MessageButton().setLabel("Yes").setStyle("SUCCESS").setCustomId('1');
    const no = new MessageButton().setLabel("No").setStyle("DANGER").setCustomId('0');

    row.addComponents(yes, no);

    //Send a message with buttons to contiue or not
    interaction.reply({
      embeds: [{
      description: `Phew, you survived round \`1\`.\nDo you want to keep playing ?\n\*If you want to keep playing press yes\*`,
      fields: [{name: 'Multiplier :', value: '\`x1\`', inline: false}]
    }],
    components: [row]
  }).then(message => {
    const filter = (c_interaction) => c_interaction.isButton() && c_interaction.user.id === interaction.author.id;

    const collector = message.createMessageComponentCollector({filter, idle: 15000});


    collector.on('collect', i => {
      // If the user wants to bail
      if(i.customId === "0"){
        // Calculate the user's new balance
        let balance = Math.ceil((user_balance - user_bet) + (user_bet * curr_multiplier));

        User.findOneAndUpdate({id: interaction.author.id}, {balance}).then(() => {

          i.reply({
            embeds: [{
              description: `You secured \`${curr_multiplier}x\` your bet !`
            }]
          })

          collector.stop('user_bailed');
        }).catch(e =>{
          console.log(`A database error has occured while updating ${interaction.author.id} balance to ${balance} : `, e);
          i.reply({
            content: 'An error has occured please contact the developper.'
          })
        });

      }else{

        function round(value, decimals) {
          return Number(Math.round(value +'e'+ decimals) +'e-'+ decimals).toFixed(decimals);
        }
        //Increment the multiplier by 1
        curr_multiplier = Number.parseFloat(curr_multiplier) + Number.parseFloat(0.3);
        curr_multiplier = round(curr_multiplier, 1)

        //Move to the next round
        curr_round += 1;

        // Check if dead
        if(barrel.indexOf(1) === curr_round){
          let balance = user_balance - Math.ceil(user_bet);

          User.findOneAndUpdate({id: interaction.author.id}, {balance}).then(() => {

            i.reply({
              embeds: [{
                description: `Unfortunately, you died !`,
                color: 0xff0000
              }]
            }).then(() => collector.stop('user_died'));

          }).catch(e =>{
            console.log(`A database error has occured while updating ${interaction.author.id} balance to ${balance} : `, e);
            i.reply({
              content: 'An error has occured please contact the developper.'
            })
          });
          return;
        };
        message.edit({
          embeds: [{
            description: `You survived another round !`,
            fields: [{name: 'Multiplier :', value: `\`${curr_multiplier}x\``, inline: false}]
          }]
        });
        i.reply({
          embeds: [{
            description: `You survived ! Your multiplier is now : \`${curr_multiplier}x\``,
            color: 0x2ECC71
          }],
          ephemeral: true
        })
      }
    });

    collector.on('end', (collected, reason) => {
      // The reason string that will be displayed in the message
      let s_reason = reason === "idle" ? "(timeout)" :
                     reason === "user_died" ? "(You lost)" :
                     reason === "user_bailed" ? "(You left the game)" : "";

      let image_url = reason === "user_bailed" ? wonImgUrl : loseImgUrl;

      let color = reason === "user_bailed" ? 0x2ECC71 : 0xff0000;

      if(reason === "idle"){
        let balance = user_balance - user_bet;

        User.findOneAndUpdate({id: interaction.author.id}, {balance}).catch(e => {
          console.log('An error has occured while updating ' + interaction.author.id + ' balance : ', e);
        });
      }

      message.components[0].components.forEach(button => button.disabled = true);

      message.edit({
        embeds: [{
          description: `Game ended ${s_reason} !`,
          color,
          image: {
            url: image_url
          }
        }],
        components: message.components
      })

      client.active_interactions.delete(interaction.author.id);
    });

  }).catch(e => {
    console.log(`An error has occured while replying to ${interaction.author.id} : `, e);
  });
  }
}
