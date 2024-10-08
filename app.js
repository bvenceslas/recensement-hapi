const Hapi = require("@hapi/hapi");
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

  // get all the persons
  server.route({
    method: "GET",
    path: "/persons",
    handler: async (request, h) => {
      try {
        const people = await Person.find().exec();
        return h.response(people).code(200).type("application/json");
      } catch (err) {
        console.error("Error fetching persons:", err);
        return h.response({ error: "Internal Server Error" }).code(500);
      }
    },
  });

  server.route({
    method: "POST",
    path: "/persons",
    handler: async (request, h) => {
      try {
        const personSchema = Joi.object({
          firstName: Joi.string().required(),
          lastName: Joi.string(),
          phone: Joi.string().min(10).required(),
          email: Joi.string().email().required(),
        });

        const { error } = personSchema.validate(request.payload);

        if (error) {
          return h.response({ error: error.details[0].message }).code(400);
        }

        const payload = request.payload;
        const newPerson = new Person(payload);
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
    path: "/persons/{id}",
    handler: async (request, h) => {
      try {
        const userId = request.params.id;
        const person = await Person.findById(userId).exec();

        if (!person) {
          const response = h.response("person not found");
          response.code = 404;
          return response;
        }

        const response = h.response(person);

        return response;
      } catch (err) {
        return h.response(err).code(500);
      }
    },
  });

  // edit person's data
  server.route({
    method: "PUT",
    path: "/persons/{id}",
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

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
