module.exports = function ms_to_readable(ms_time){
  const hours = Math.floor(ms_time / (1000 * 60 * 60));
  ms_time -= hours * (1000 * 60 * 60);
  const minutes = Math.floor(ms_time / (1000 * 60));
  ms_time -= minutes * (1000 * 60 * 60);

  return `\`${hours} h-${minutes} m\``;
}
