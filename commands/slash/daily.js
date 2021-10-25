const { SlashCommandBuilder } = require('@discordjs/builders');

// Creating the slash command <daily>
const command = new SlashCommandBuilder().setName('daily').setDescription('Claim your daily coins');

module.exports.data = command;
