const connection = require("./models/db");
const { execSync } = require('child_process');

const options = {
  "--type": {
    value: true,
    default: "alter",
  },
  "--force": {},
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

connection
  .sync({
    alter: true,
    //force: true
  })
  .then(() => console.log("Database synced"))
  //.then(() => connection.close());

  /*try {
    if (options["--dir"] === "up") {
      execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
    } else if (options["--dir"] === "down") {
      execSync('npx sequelize-cli db:migrate:undo', { stdio: 'inherit' });
    } else {
      console.error("Unknown direction. Use --dir up or --dir down.");
    }
  } catch (error) {
    console.error("An error occurred while running the migration script:", error);
  }*/
