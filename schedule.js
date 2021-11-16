const schedule = require("node-schedule");
const scraper = require("./scraper");

schedule.scheduleJob("*/5 * * * *", () => {
  scraper.init();
});
