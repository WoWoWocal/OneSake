const PIRATE_ADJECTIVES = [
  'Fearless',
  'Cunning',
  'Ruthless',
  'Stormy',
  'Golden',
  'Salty',
  'Daring',
  'Brave',
  'Wild',
  'Sly',
  'Iron',
  'Crimson',
  'Bold',
  'Reckless',
  'Savage',
  'Nimble',
  'Mighty',
  'Wicked',
];

const PIRATE_NAMES = [
  'Blackbeard',
  'Rackham',
  'Bonney',
  'Read',
  'Kidd',
  'Morgan',
  'Teach',
  'Drake',
  'Vane',
  'Roberts',
  'Sparrow',
  'Barbossa',
  'Turner',
  'Hook',
  'Silver',
  'Flint',
  'Luffy',
  'Zoro',
  'Nami',
  'Shanks',
  'Buggy',
  'Law',
  'Kid',
  'Roger',
  'Mihawk',
  'Crocodile',
];

function pickRandom(items: string[]): string {
  return items[Math.floor(Math.random() * items.length)];
}

export function generatePirateName(maxLength = 24): string {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const generatedName = `${pickRandom(PIRATE_ADJECTIVES)} ${pickRandom(PIRATE_NAMES)}`;

    if (generatedName.length <= maxLength) {
      return generatedName;
    }
  }

  return `${pickRandom(PIRATE_ADJECTIVES)} ${pickRandom(PIRATE_NAMES)}`
    .slice(0, maxLength)
    .trim();
}
