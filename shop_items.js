// This file should be ran in the index.js file
// It will load the items in the db

const {ShopItem, db} = require('./db_connection.js');


db.dropCollection('shop_items', function(err, res){
  if(err){
    console.log(err)
  }else if(res){
    console.log('Collection deleted');
  }
})

let whitelist_role = new ShopItem({
  id: 1,
  name: 'whitelist',
  price: 3500,
  feature: 'This item will give you access to the whitelist'
});

whitelist_role.save().then(item => {
  console.log(`${item.name} has been created !`)
}).catch(e => {
  console.log('An error has occured while creating an item : ', e);
})
