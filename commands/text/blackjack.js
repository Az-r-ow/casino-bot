const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

const { prefix } = require("../../config.json");
const { User } = require("../../db_connection.js");
const {
  blackjackEmbed,
  getTotalHandValue,
  pickCardRandom,
  endGame
} = require('../../helpers/blackjack.js');

module.exports = {
  name: "blackjack",
  usage: `${prefix} blackjack <amount>`,
  description: "Play a game of blackjack.",
  aliases: ['bj'],
  async execute(interaction, args, client){

    // Filtering user args
    if((args.length === 1) || !+args[1] || +args[1] <= 1)return interaction.reply("You have to bet something.");

    // The amount the user has specified to gamble
    const userBet = Math.floor(args[1]);

    let player;

    try {
      // Check the user's balance
      player = await User.findOne({id: interaction.member.id});
    } catch (e) {
      console.log('An error occured while fetching from the db :', interaction.member.id, ' : ', e);
    }

    // Check if user found
    // Check if user has enough money
    let reason = !player ? "You should start by claiming your daily. \`!c daily\`"
                 : player.balance < userBet ? "You can't bet more than you have in your balance."
                 : false;

    if(reason)return interaction.reply(reason);

    // Add a client interaction to the user to avoid multiple commands in the same time
    client.active_interactions.set(interaction.author.id, interaction);


    // Starting with empty hands
    let dealerHand = [];
    let playerHand = [];
    let playerUsername = interaction.member.user.username;
    let dealerUsername = client.user.username;

    // The amount if won
    let wonAmount = Math.floor(userBet * (2 / 3));

    const states = {
      won: {
        color: [60, 252, 60], // Green
        message: `You won : **${wonAmount}**`,
        finalPlayerBalance: player.balance + userBet + wonAmount
      },
      lost: {
        color: [252, 60, 60], // Red
        message: `You lost your bet Unfortunately !\nAmount lost : **${userBet}**`,
        finalPlayerBalance: player.balance - userBet
      },
      tied: {
        color: [252, 239, 60], // Yellow
        message: `Game tied!\nYou get your money back.`,
        finalPlayerBalance: player.balance
      },
      timeout: {
        color: [252, 239, 60],
        message: 'The game has timeout, be faster next time.\nThe dealer took your money.',
        finalPlayerBalance: player.balance - userBet
      },
      forfeit: {
        color: [252, 239, 60],
        message: 'You forfeited the game, that\'s sad, you get half your money back.',
        finalPlayerBalance: player.balance - Math.floor(userBet / 2)
      }
    }

    // Giving two cards for each the dealer and the player
    for (let i = 0; i < 2; i++){
      playerHand.push(pickCardRandom(playerHand + dealerHand));
      dealerHand.push(pickCardRandom(playerHand + dealerHand));
    };

    // Forming the embed message
    const bjEmbed = blackjackEmbed(playerUsername, dealerUsername, playerHand, dealerHand);

    // Adding the buttons to it
    const row = new MessageActionRow();
    const hitButton = new MessageButton().setLabel("Hit").setStyle("PRIMARY").setCustomId('hit');
    const standButton = new MessageButton().setLabel("Stand").setStyle("PRIMARY").setCustomId('stand');
    const forfeitButton = new MessageButton().setLabel("Forfeit").setStyle("PRIMARY").setCustomId('forfeit');
    row.addComponents(hitButton, standButton, forfeitButton);

    const messageSent = await interaction.reply({embeds: [bjEmbed], components: [row]});

    const filter = c_interaction => c_interaction.isButton() && c_interaction.user.id === interaction.member.id;

    // In case of a blackjack
    if (getTotalHandValue(playerHand) === 21){
      // In the very rare case of the dealer blackjacking as well, it's a tie
      if(getTotalHandValue(dealerHand) === 21){
        const newBjEmbed = blackjackEmbed(playerUsername, dealerUsername, playerHand, dealerHand, states.tied);
        return endGame(player, messageSent, newBjEmbed, states.tie, client);
      }

      // In the case of the user blackjacking and the dealer not
      const newBjEmbed = blackjackEmbed(playerUsername, dealerUsername, playerHand, dealerHand, states.won);
      return endGame(player, messageSent, newBjEmbed, states.won, client);
    };

    const collector = await messageSent.createMessageComponentCollector({filter, idle: 15000});

    // When a user clicks the button
    collector.on('collect', button => {
      const userPick = button.customId

      button.deferUpdate();

      if (userPick === 'hit'){
        let newCard = pickCardRandom(playerHand + dealerHand);
        playerHand.push(newCard);

        // If the player's hand is not busted
        if (getTotalHandValue(playerHand) <= 21)return messageSent.edit({embeds: [blackjackEmbed(playerUsername, dealerUsername, playerHand, dealerHand)]});

        // If the player's hand is busted
        const newBjEmbed = blackjackEmbed(playerUsername, dealerUsername, playerHand, dealerHand, states.lost);
        return endGame(player, messageSent, newBjEmbed, states.lost, client);

      } else {
        collector.stop(userPick);
      }
    });

    // If the button triggers an end state
    collector.on('end', (collected, reason) => {

      // Reason 1 : The reason forfeited
      if (reason === 'forfeit'){
        const newBjEmbed = blackjackEmbed(playerUsername, dealerUsername, playerHand, dealerHand, states.forfeit);
        return endGame(player, messageSent, newBjEmbed, states.forfeit, client);
      };

      if (reason === 'idle'){
        const newBjEmbed = blackjackEmbed(playerUsername, dealerUsername, playerHand, dealerHand, states.timeout);
        return endGame(player, messageSent, newBjEmbed, states.timeout, client);
      }

      // Reason 2 : The user Stands

      // User hand has a smaller value than the dealer's hand
      if (getTotalHandValue(playerHand) <= getTotalHandValue(dealerHand)){
        const newBjEmbed = blackjackEmbed(playerUsername, dealerUsername, playerHand, dealerHand, states.lost);
        return endGame(player, messageSent, newBjEmbed, states.lost, client);
      };

      // User's hand bigger than the dealer's hand
      // Pick until dealer's hand bigger
      while (getTotalHandValue(playerHand) >= getTotalHandValue(dealerHand)) {
        let newCard = pickCardRandom(playerHand + dealerHand);
        dealerHand.push(newCard);
      };

      // After it's bigger compare to see if the dealer has busted or won :
      if (getTotalHandValue(playerHand) <= getTotalHandValue(dealerHand) && !(getTotalHandValue(dealerHand) > 21)){
        const newBjEmbed = blackjackEmbed(playerUsername, dealerUsername, playerHand, dealerHand, states.lost);
        return endGame(player, messageSent, newBjEmbed, states.lost, client);
      } else {
        const newBjEmbed = blackjackEmbed(playerUsername, dealerUsername, playerHand, dealerHand, states.won);
        return endGame(player, messageSent, newBjEmbed, states.won, client);
      }
    })
  }
}
