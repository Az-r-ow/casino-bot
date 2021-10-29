const mongoose = require('mongoose');
const {dbUrl} = require('./config.json');


mongoose.connect(dbUrl);
const db = mongoose.connection;

db.on('error', () => {
  console.error.bind(console, 'connection error');
  process.kill(1);
});

db.once('open', () => {
  console.log("Connected to the db !");
})

const shop_itemSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: Number,
  feature: String
});

const ShopItem = mongoose.model('shop_items', shop_itemSchema);

const userSchema = new mongoose.Schema({
  id: String,
  balance: {type: Number, default: 0},
  last_claimed: {type: Date, default: null}
});

const User = mongoose.model('users', userSchema);

module.exports = {User, ShopItem, db};
