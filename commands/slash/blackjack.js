const { SlashCommandBuilder } = require('@discordjs/builders');

// Setting the slash command for <blackjack>
const command = new SlashCommandBuilder().setName('blackjack').setDescription("Play a game of blackjack")
  .addUserOption(option => option.setName("bet").setDescription("The amount you want to bet").setRequired(true))

module.exports.data = command;
