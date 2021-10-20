const mongoose = require('mongoose');


mongoose.connect('mongodb://127.0.0.1:27017/users');
const db = mongoose.connection;

db.on('error', () => {
  console.error.bind(console, 'connection error');
  process.kill(1);
});

db.once('open', () => {
  console.log("Connected to the db !");
})

const userSchema = new mongoose.Schema({
  id: String,
  balance: {type: Number, default: 0},
  last_claimed: {type: Date, default: null}
});

const User = mongoose.model('users', userSchema);

module.exports = User;
