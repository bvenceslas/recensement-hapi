const { required } = require("joi");
const mongoose = require("mongoose");

const PersonSchema = mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
});

const Person = mongoose.model("persons", PersonSchema);

module.exports = Person;
