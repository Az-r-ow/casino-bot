const {MessageButton, MessageActionRow} = require('discord.js');
module.exports = {
  name: 'roulette',
  description: 'Survive the roulette game to gain your bet.\n6 bullets gun is used, the more you replay, the more you gain (x4 if you survive the 5 shots).\nAlways count your shots because this is a realistic version of the game!',
  async execute(interaction, args, client){

    const User = require('../../db_connection.js');
    //No arguments provided
    // Return error message
    if((args.length === 1) || !+args[1] || +args[1] <= 0)return interaction.reply({embeds: [{
      description: "You have to bet something ! ",
    }]
    });

    const user_bet = +args[1];
    let curr_multiplier = 1;

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
    let barrel = [0, 0, 0, 0, 0, 0];

    client.active_interactions.set(interaction.author.id, interaction);

    let random_bullet_placement = Math.floor(Math.random() * 6);

    if(random_bullet_placement === 0){
      user_balance -= user_bet;
      try {
        await User.findOneAndUpdate({id: interaction.author.id}, {balance: user_balance});
      } catch (e) {
        console.log(`An error has occured while updating ${interaction.author.id} balance`, e);
        return interaction.reply({embed: [{
          description: 'An error has occured please contact the developper'
        }]});
      };
      client.active_interactions.delete(interaction.author.id);
      return interaction.reply({embeds: [{
        description: 'Unlucky ! You died.'
      }]})
    }

    // Put a bullet in a random position
    barrel[random_bullet_placement] = 1;

    const row = new MessageActionRow();
    const yes = new MessageButton().setLabel("Yes").setStyle("SUCCESS").setCustomId('1');
    const no = new MessageButton().setLabel("No").setStyle("DANGER").setCustomId('0');

    row.addComponents(yes, no);

    //Send a message with buttons to contiue or not
    interaction.reply({
      embeds: [{
      description: `Phew, you survived round \`1\`.\nDo you want to keep playing ?`,
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
        let balance = (user_balance - user_bet) + (user_bet * curr_multiplier);

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
        //Increment the multiplier by 1
        curr_multiplier += 1;
        // Check if dead
        if(barrel.indexOf(1) === curr_multiplier - 1){
          let balance = user_balance - user_bet;

          User.findOneAndUpdate({id: interaction.author.id}, {balance}).then(() => {

            i.reply({
              embeds: [{
                description: `Unfortunately, you died !`
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
            description: `You survived ! Your multiplier is now : \`${curr_multiplier}x\``
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

      if(reason === "idle"){
        let balance = user_balance - user_bet;

        User.findOneAndUpdate({id: interaction.author.id}, {balance}).catch(e => {
          console.log('An error has occured while updating ' + interaction.author.id + ' balance : ', e);
        });
      }

      message.components[0].components.forEach(button => button.disabled = true);

      message.edit({
        embeds: [{
          description: `Game ended ${s_reason} !`
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