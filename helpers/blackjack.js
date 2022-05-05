const { MessageEmbed } = require('discord.js');
const { User } = require('../db_connection.js');

// This function will filter out the emojis and return the numeric value of the hand
function getTotalHandValue(array) {
  let total = 0;
  const noSymbolHand = array.map(card => card.slice(0, card.length - 2));

  for (const card of noSymbolHand){
    if(isNaN(card)) {
      if (card === "A") {
        total = total + 11 > 21 ? total + 1 : total + 11;
      } else {
        total += 10;
      }
    }else{
      total += parseInt(card);
    }
  };
  return total;
}


/**
 * blackjackEmbed - Will return a message Embed specific to the current blackjack state
 *
 * @param  {type} player     The username of the player
 * @param  {type} dealer     The username of the bot
 * @param  {Array} playerHand The array of the cards the user has
 * @param  {Array} dealerHand The array of the cards the dealer has
 * @param  {Object} reason     In case of a loss or win, the reason to the loss or win
 * @return {type}            The message embed
 */
function blackjackEmbed(player, dealer, playerHand, dealerHand, state) {

  let bjEmbed = new MessageEmbed()
    .setColor("BLUE")
    .setTitle(`${player}'s blackjack game`)
    .addField(`${player} (Player)`, `Cards - ${playerHand.map(card => "\`" + card + "\`").join(" ")}\nTotal - ${getTotalHandValue(playerHand)}`, true);

  if(state) {
    bjEmbed.addField(`${dealer} (Dealer)`,`Cards - ${dealerHand.map(card => "\`" + card + "\`").join(" ")}\nTotal - ${getTotalHandValue(dealerHand)}`, true)
      .setColor(state.color)
      .setDescription(state.message);
  }else {
    bjEmbed.addField(`${dealer} (Dealer)`,`Cards - ${dealerHand.map((card, index) => card = index === 1 ? "\`?\`" : "\`" + card + "\`").join(" ")}\nTotal - ?`, true);
  };

  return bjEmbed;

};


/**
 * pickCardRandom - Pick a card randomly by removing the cards already picked
 *
 * @param  {Array} pickedCards The array of cards already picked
 * @return {String}             The card picked
 */
function pickCardRandom(pickedCards) {
  let deck = [
    '1♠️', '1❤️',  '1♣️',  '1♦️',  '2♠️',  '2❤️', '2♣️',
    '2♦️', '3♠️',  '3❤️',  '3♣️',  '3♦️',  '4♠️', '4❤️',
    '4♣️', '4♦️',  '5♠️',  '5❤️',  '5♣️',  '5♦️', '6♠️',
    '6❤️', '6♣️',  '6♦️',  '7♠️',  '7❤️',  '7♣️', '7♦️',
    '8♠️', '8❤️',  '8♣️',  '8♦️',  '9♠️',  '9❤️', '9♣️',
    '9♦️', '10♠️', '10❤️', '10♣️', '10♦️', 'J♠️', 'J❤️',
    'J♣️', 'J♦️',  'Q♠️',  'Q❤️',  'Q♣️',  'Q♦️', 'K♠️',
    'K❤️', 'K♣️',  'K♦️'
  ];

  // Shuffling the deck
  deck = deck.sort((a, b) => 0.5 - Math.random());

  deck = pickedCards ? deck.filter((card) => !pickedCards.includes(card)) : deck;
  
  return deck[Math.floor(Math.random() * deck.length)];
};

async function endGame(player, messageSent, newEmbed, state, client) {
  // Step 1 : Disable the buttons and edit the message

  // Disable the buttons
  messageSent.components[0].components.forEach(button => button.disabled = true);

  try {

    // Edit the message
    await messageSent.edit({
      embeds: [newEmbed],
      components: messageSent.components
    });

    // Step 2 : remove the interaction from the active_interactions
    client.active_interactions.delete(player.id);

    // Step 3 : Update the user's balance
    await User.findOneAndUpdate({id: player.id}, {balance: state.finalPlayerBalance})

  } catch (e) {
    throw e
  }
}

module.exports = {
  blackjackEmbed,
  getTotalHandValue,
  pickCardRandom,
  endGame
};
