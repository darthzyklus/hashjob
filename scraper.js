const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs").promises;

const scrapeUrl = async () => {
  const result = await axios.get(process.env.MAIN_URL);
  const $html = cheerio.load(result.data);

  return $html;
};

const getHashRate = async ($html) => {
  return $html("#b-hashrate").text();
};

const saveHashRate = async (hashRate) => {
  const item = {
    value: hashRate,
    date: new Date().toISOString(),
  };

  const storeData = {
    data: [item],
  };

  const fileData = await fs
    .readFile("./data/hash-rates.json", "utf8")
    .catch((error) => {
      console.log(error.message);
    });

  if (fileData) {
    const json = JSON.parse(fileData);
    json.data.push(item);

    // if is has more than 7 days of data
    if (json.data.length > 2016) {
      json.data = json.data.slice(1, 2016);
    }

    storeData.data = json.data;
  }

  await fs.writeFile("./data/hash-rates.json", JSON.stringify(storeData));
};

const saveRates = async (rates) => {
  const date = new Date().toISOString();
  const items = rates.map((rate) => ({ ...rate, date }));

  const storeData = {
    data: items,
  };

  const fileData = await fs
    .readFile("./data/rates.json", "utf8")
    .catch((error) => {
      console.log(error.message);
    });

  if (fileData) {
    const json = JSON.parse(fileData);
    json.data.push(...items);

    // if is has more than 1 days of data
    if (json.data.length > 2880) {
      json.data = json.data.slice(10, 2880);
    }

    storeData.data = json.data;
  }

  await fs.writeFile("./data/rates.json", JSON.stringify(storeData));
};

const getRates = async ($html) => {
  const elements = [];
  const panels = $html(".panel-info");

  for (let i = 0; i < panels.length; i++) {
    elements.push(panels[i]);
  }

  const ratePanel = elements.find((el) => {
    const header = $html(el).find(".panel-heading");
    return header.text().includes("Contributor Hashrates");
  });

  const tableRows = $html(ratePanel).find("table tr");
  const rates = [];

  for (let i = 0; i < tableRows.length; i++) {
    const columns = $html(tableRows[i]).find("td");
    const rate = {
      username: $html(columns[columns.length - 3]).text(),
      "kh/s": $html(columns[columns.length - 2]).text(),
      "cha/day": $html(columns[columns.length - 1]).text(),
    };

    if (rate.username) {
      rates.push(rate);
    }
  }

  return rates;
};

const init = async () => {
  const $html = await scrapeUrl();
  const rates = await getRates($html);
  await saveRates(rates);
};

const scraper = {};

scraper.init = init;

module.exports = scraper;
