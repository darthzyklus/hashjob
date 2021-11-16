const fastify = require("fastify")({ logger: true });
const fs = require("fs").promises;
const path = require("path");

fastify.register(require("fastify-static"), {
  root: path.join(__dirname, "public"),
  prefix: "/", // optional: default '/'
});

fastify.get("/", async (_, reply) => {
  return reply.sendFile("index.html");
});

fastify.get("/api/rates", async (_, reply) => {
  const data = await fs.readFile("./data/rates.json", "utf8").catch((error) => {
    console.log(error.message);
  });

  if (!data) {
    return reply.callNotFound();
  }

  const json = JSON.parse(data);

  return json;
});

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await fastify.listen(PORT);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
