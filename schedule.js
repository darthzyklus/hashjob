const schedule = require("node-schedule");
const scraper = require("./scraper.js");

schedule.scheduleJob("*/5 * * * *", () => {
  scraper.init();
});
