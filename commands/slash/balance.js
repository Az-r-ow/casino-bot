const { SlashCommandBuilder } = require('@discordjs/builders');

// Creating the slash command <balance>
const command = new SlashCommandBuilder().setName('balance').setDescription('Check your current balance.')
                                                            .addUserOption(option => option.setName('user').setDescription('The user\'s balance.'));

module.exports.data = command;
