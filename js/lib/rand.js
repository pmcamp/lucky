// Math.floor(Math.random()*n+1)
// The Central Randomizer 1.3 (C) 1997 by Paul Houle (houle@msc.cornell.edu)
// See: http://www.msc.cornell.edu/~houle/javascript/randomizer.html
rnd.today = new Date();
rnd.seed = rnd.today.getTime();

function rnd() {
  rnd.seed = (rnd.seed * 9301 + 49297) % 233280;
  return rnd.seed / (233280.0);
};

function rand(number) {
  return Math.ceil(rnd() * number);
};
// end central randomizer