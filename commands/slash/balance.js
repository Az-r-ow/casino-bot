const { SlashCommandBuilder } = require('@discordjs/builders');

// Creating the slash command <balance>
const command = new SlashCommandBuilder().setName('balance').setDescription('Check your current balance.');

module.exports.data = command;
