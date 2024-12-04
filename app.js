const Hapi = require("hapi");
require("dotenv").config();
const Person = require("./model/person.model");
// const Joi = require("joi");

// initialize server

const init = async () => {
  const server = Hapi.Server({
    host: "localhost",
    port: process.env.PORT || 6789,
  });

  // routes

  server.route({
    method: "GET",
    path: "/",
    handler: (request, h) => {
      return "Hello World!";
    },
  });

  // get all the persons
  server.route({
    method: "GET",
    path: "/persons",
    handler: async (request, h) => {
      try {
        const people = await Person.find().exec();
        const response = h.response(people);
        response.code = 200;
        response.header("Content-Type", "text/plain");
        return response;
      } catch (err) {
        return h.response(err).code(500);
      }
    },
  });

  server.route({
    method: "POST",
    path: "/persons",
    options: {
      // was done using `config`
      payload: {
        allow: ["Application/json"],
      },
      validate: {
        // add validation here
      },
    },
    handler: async (request, h) => {
      try {
        console.log("request", request);
        const newPerson = new Person(request.payload);
        const result = await newPerson.save();
        return h.response(result);
      } catch (err) {
        return h.response(err).code(500);
      }
    },
  });

  //get one person by his id
  server.route({
    method: "GET",
    path: "/person/:id",
    handler: async (request, h) => {
      try {
        const userId = request.params.id;
        const person = await Person.findById(userId).exec();

        if (!person) {
          return h.response("person not found").code(404);
        }
        const response = h.response(person);
        response.code = 200;
        response.headers("Content-Type", "application/json");
        return response;
      } catch (err) {
        return h.response(err).code(500);
      }
    },
  });

  // edit person's data
  server.route({
    method: "PUT",
    path: "/person/{id}",
    handler: async (request, h) => {
      try {
        const person = await Person.findByIdAndUpdate(
          request.params.id,
          request.payload,
          { new: true }
        );
        return h.response(person);
      } catch (err) {
        return h.response(err).code(500);
      }
    },
  });
  // start server
  try {
    await server.start();
    console.log(`Hapi server running at ${server.info.uri}`);

    // then connect to mongodb
    require("./db/dbConnect");
  } catch (error) {
    console.error("Hapi server failed to connect");
  }
};

// start the server
init();

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});
