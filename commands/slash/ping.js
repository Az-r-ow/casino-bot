const { SlashCommandBuilder } = require('@discordjs/builders');

// Creating the slash command <ping>
const command = new SlashCommandBuilder().setName('ping').setDescription('Replies with pong !');

module.exports.data = command;
