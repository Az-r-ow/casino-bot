const { SlashCommandBuilder } = require('@discordjs/builders');

// Creating the slash command
const command = new SlashCommandBuilder().setName('floor').setDescription('Check the floor price of the collection.')

module.exports.data = command;
