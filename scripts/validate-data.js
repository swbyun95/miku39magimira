const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dataPath = path.join(root, 'data', 'site-data.json');
const text = fs.readFileSync(dataPath, 'utf8');
const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function requireString(value, label) {
  if (typeof value !== 'string' || !value.trim()) fail(`${label} is required`);
}

function requireArray(value, label) {
  if (!Array.isArray(value)) fail(`${label} must be an array`);
}

function checkUrl(value, label, required = false) {
  if (!value) {
    if (required) fail(`${label} is required`);
    return;
  }
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) fail(`${label} must be http/https`);
  } catch {
    fail(`${label} is not a valid URL: ${value}`);
  }
}

function checkLinks(links, label) {
  if (links == null) return;
  requireArray(links, label);
  if (!Array.isArray(links)) return;
  links.forEach((link, index) => {
    requireString(link.label, `${label}[${index}].label`);
    checkUrl(link.url, `${label}[${index}].url`, true);
  });
}

function checkUnique(items, keyFn, label) {
  const seen = new Set();
  items.forEach((item, index) => {
    const key = keyFn(item);
    if (!key) return;
    if (seen.has(key)) fail(`${label}[${index}] duplicates key: ${key}`);
    seen.add(key);
  });
}

function checkCard(item, label) {
  requireString(item.id, `${label}.id`);
  requireString(item.eventId, `${label}.eventId`);
  requireString(item.section, `${label}.section`);
  requireString(item.title, `${label}.title`);
  requireString(item.date, `${label}.date`);
  requireString(item.place, `${label}.place`);
  checkUrl(item.mapUrl, `${label}.mapUrl`);
  if (item.reservation != null && !Array.isArray(item.reservation)) {
    fail(`${label}.reservation must be an array`);
  }
  checkLinks(item.links, `${label}.links`);
  if (!Number.isInteger(item.displayOrder)) warn(`${label}.displayOrder should be an integer`);
}

function checkGoods(item, label) {
  requireString(item.id, `${label}.id`);
  requireString(item.eventId, `${label}.eventId`);
  requireString(item.name, `${label}.name`);
  requireString(item.priceText, `${label}.priceText`);
  requireString(item.area, `${label}.area`);
  checkUrl(item.sourceUrl, `${label}.sourceUrl`, true);
  checkUrl(item.imageUrl, `${label}.imageUrl`);
}

function checkBooth(item, label, market = false) {
  requireString(item.eventId, `${label}.eventId`);
  requireString(item.number, `${label}.number`);
  requireString(item.name, `${label}.name`);
  requireString(item.items, `${label}.items`);
  checkLinks(item.links, `${label}.links`);
  checkUrl(item.imageUrl, `${label}.imageUrl`);
  if (market) {
    requireArray(item.days, `${label}.days`);
    requireArray(item.members, `${label}.members`);
  }
}

let data;
try {
  data = JSON.parse(text);
} catch (error) {
  fail(`JSON parse failed: ${error.message}`);
}

if (text.includes('???')) fail('file contains ??? replacement text');
if (text.includes('\uFFFD')) fail('file contains unicode replacement character');

if (data) {
  if (data.schemaVersion !== '2.0') fail('schemaVersion must be 2.0');
  if (!isObject(data.site)) fail('site must be an object');
  else {
    requireString(data.site.title, 'site.title');
    requireString(data.site.dataVersion, 'site.dataVersion');
    requireString(data.site.lastUpdated, 'site.lastUpdated');
    requireString(data.site.notice, 'site.notice');
  }

  requireArray(data.events, 'events');
  requireArray(data.places, 'places');
  requireArray(data.programs, 'programs');
  requireArray(data.collaborations, 'collaborations');
  requireArray(data.stagePrograms, 'stagePrograms');
  requireArray(data.goods, 'goods');
  if (!isObject(data.booths)) fail('booths must be an object');
  else {
    requireArray(data.booths.expo, 'booths.expo');
    requireArray(data.booths.creatorMarket, 'booths.creatorMarket');
  }

  (data.events || []).forEach((event, index) => {
    requireString(event.id, `events[${index}].id`);
    requireString(event.title, `events[${index}].title`);
    requireString(event.period, `events[${index}].period`);
    requireString(event.venue, `events[${index}].venue`);
    checkUrl(event.venueMap, `events[${index}].venueMap`);
    checkLinks(event.quickLinks, `events[${index}].quickLinks`);
  });

  (data.places || []).forEach((place, index) => {
    requireString(place.id, `places[${index}].id`);
    requireString(place.name, `places[${index}].name`);
    checkUrl(place.mapUrl, `places[${index}].mapUrl`);
  });

  (data.programs || []).forEach((item, index) => checkCard(item, `programs[${index}]`));
  (data.collaborations || []).forEach((item, index) => checkCard(item, `collaborations[${index}]`));
  (data.stagePrograms || []).forEach((item, index) => {
    requireString(item.eventId, `stagePrograms[${index}].eventId`);
    requireString(item.time, `stagePrograms[${index}].time`);
    requireString(item.title, `stagePrograms[${index}].title`);
    checkUrl(item.link, `stagePrograms[${index}].link`, true);
  });
  (data.goods || []).forEach((item, index) => checkGoods(item, `goods[${index}]`));
  (data.booths?.expo || []).forEach((item, index) => checkBooth(item, `booths.expo[${index}]`));
  (data.booths?.creatorMarket || []).forEach((item, index) => checkBooth(item, `booths.creatorMarket[${index}]`, true));

  checkUnique(data.events || [], item => item.id, 'events');
  checkUnique(data.places || [], item => item.id, 'places');
  checkUnique([...(data.programs || []), ...(data.collaborations || [])], item => item.id, 'cards');
  checkUnique(data.goods || [], item => item.id, 'goods');

  const counts = {
    cards: (data.programs || []).length + (data.collaborations || []).length,
    stagePrograms: (data.stagePrograms || []).length,
    goods: (data.goods || []).length,
    expoBooths: (data.booths?.expo || []).length,
    creatorMarket: (data.booths?.creatorMarket || []).length
  };
  console.log(JSON.stringify({ status: errors.length ? 'failed' : 'ok', counts, warnings }, null, 2));
}

if (errors.length) {
  console.error('\nValidation errors:');
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}
