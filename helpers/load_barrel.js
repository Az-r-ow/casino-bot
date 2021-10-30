//This function will return a barrel with one bullet
module.exports = function load_barrel(){
  let array = [];
  let barrel = [0, 0, 0, 0, 0, 0];
  let z = 6;
  for(let i = 0; i < 6; i++){
    let round = new Array(z).fill(i);
    array = array.concat(round);
    z--
  };
  let rnd_bullet_index = array[Math.ceil((Math.random() * array.length) - 1)];
  barrel[rnd_bullet_index] = 1;
  return barrel;
};
