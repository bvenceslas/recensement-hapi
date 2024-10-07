const mongoose = require("mongoose");

const PersonSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  phone: String,
  email: String,
});

const Person = mongoose.model("persons", PersonSchema);

module.exports = Person;
