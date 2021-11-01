// This file should be ran in the index.js file
// It will load the items in the db

const {ShopItem, User, db} = require('./db_connection.js');


db.dropCollection('shop_items', function(err, res){
  if(err){
    console.log(err)
  }else if(res){
    console.log('Collection deleted');
  }
})

let whitelist_item = new ShopItem({
  id: 1,
  name: 'whitelist',
  price: 1000000,
  feature: 'This item will give you access to the whitelist'
});

whitelist_item.save().then(item => {
  console.log(`${item.name} has been created !`)
}).catch(e => {
  console.log('An error has occured while creating an item : ', e);
});

let resetDaily = Date.now() - ( 1000 * 60 * 60 * 24);

User.updateMany({}, {last_claimed: resetDaily}).then(res => {
  console.log('Dailies has been resetted.');
  console.log('Matched = ', res.matchedCount);
  console.log('Modified = ', res.modifiedCount);
  console.log("did everything go smoothly ? ", res.acknowledged);
})
