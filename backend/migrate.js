const connection = require("./models/db");
const { execSync } = require('child_process');
const { usersFixtures, productsFixtures, shopFixtures } = require('./fixtures/fixtures');
const options = {
  "--type": {
    value: true,
    default: "alter",
  },
  "--force": {
    value: true,
  },
  "--dir": {
    default: "up",
  },
};

const args = process.argv.slice(2);

do {
  const arg = args.shift();
  if (arg in options) {
    if (options[arg].value) {
      options[arg] = args.shift();
    } else {
      options[arg] = options[arg].default ?? true;
    }
  }
} while (args.length);

const syncDatabaseAndLoadFixtures = async () => {
  try {
    await connection.sync({
      alter: options["--type"] === "alter",
      force: options["--force"] === true,
    });
    console.log("Database synced");

    if (options["--force"] === true) {
      console.log("Fixtures loaded successfully.");
    }

    if (options["--dir"] === "up") {
      execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
    } else if (options["--dir"] === "down") {
      execSync('npx sequelize-cli db:migrate:undo', { stdio: 'inherit' });
    } else {
      console.error("Unknown direction. Use --dir up or --dir down.");
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

syncDatabaseAndLoadFixtures();
