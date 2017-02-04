const fs = require('fs');
const jsonfile = require('jsonfile')
jsonfile.spaces = 2;

const x = require('x-ray');
const xray = x();

const sources = require('./sources.config');

function processEmoji (category) {
  return (err, obj) => {
    if (err) { console.error(`xray error: ${err}`); return; }

    // Remove empty results
    const emoji = obj.filter(emoji => emoji !== '');

    // Write out our category file
    jsonfile.writeFile(`./results/${category}.json`, emoji, (err) => {
      if (err) { console.error(err); return; };
      console.log(`${category}.json written!`);
    });
  }
}

const categories = Object.keys(sources);

categories.forEach((category) => {
  console.log(`Scraping category: ${category}...`);
  const pageString = '.entry-content p:last-child a';

  // Work out how many pages
  let numPages = 0;
  xray(sources[category], pageString, [''])((err, item) => {
    if (err) { console.error(err); return; };

    numPages = item.length;

    // Scrape emoji with limits!
    xray(sources[category], '.copyjava tr', ['td'] )
      .limit(numPages)
      .paginate(`${pageString}:last-child@href`)
      (processEmoji(category));
  });
});
