const mongoose = require("mongoose");
require("dotenv").config();

const app = require("./app");

const DB = process.env.DATABASE_LOCAL_URL;

mongoose
  .connect(DB)
  .then(() => {
    console.log("database connected");
  })
  .catch((err) => {
    console.log(`failed to connect database! ${err.message}.`);
  });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App is running on PORT ${port}.`);
});
