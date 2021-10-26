const { SlashCommandBuilder } = require('@discordjs/builders');

// Creating the slash command <leaderboard>
const command = new SlashCommandBuilder().setName('leaderboard').setDescription('Get a list of the richest users.');

module.exports.data = command;
