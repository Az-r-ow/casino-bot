const { SlashCommandBuilder } = require('@discordjs/builders');

// Creating the slash command <shop>
const command = new SlashCommandBuilder().setName('shop').setDescription('Check your current shop.')
                .addStringOption(option => option.setName('item_name')
                                           .setDescription('The name of the item that you want to check.')
                                           .setRequired(false));

module.exports.data = command;
