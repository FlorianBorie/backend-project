require("babel-register");
const { success, error, checkAndChange } = require("./assets/functions");
const mysql = require("promise-mysql");
const bodyParser = require("body-parser");
const express = require("express");
const expressOasGenerator = require("express-oas-generator");
const app = express();
const morgan = require("morgan")("dev");
const config = require("./assets/config");
const bcrypt = require("bcrypt");
const passport = require("passport");
const db = mysql

  .createConnection({
    host: config.db.host,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password
  })
  .then(db => {
    console.log("Connected.");

    const app = express();

    let MembersRouter = express.Router();
    let Members = require("./assets/classes/members-class")(db, config);

    app.use(morgan);
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    MembersRouter.route("/:id")

      // Récupère un membre avec son ID
      .get(async (req, res) => {
        let member = await Members.getById(req.params.id);
        res.json(checkAndChange(member));
      })

      // Modifie un membre avec son ID
      .put(async (req, res) => {
        let updateMember = await Members.update(
          req.params.id,
          req.body.firstname,
          req.body.lastname,
          req.body.age,
          req.body.mail
        );
        res.json(checkAndChange(updateMember));
      })

      // Suprime un membre avec son ID
      .delete(async (req, res) => {
        let deleteMember = await Members.delete(req.params.id);
        res.json(checkAndChange(deleteMember));
      });

    MembersRouter.route("/")

      // Récupère tous les membres
      .get(async (req, res) => {
        let allMembers = await Members.getAll(req.query.max);
        res.json(checkAndChange(allMembers));
      })

      // Ajoute un membre
      .post(async (req, res) => {
        let addMember = await Members.add(
          req.body.firstname,
          req.body.lastname,
          req.body.age,
          req.body.mail
        );
        res.json(checkAndChange(addMember));
      });

    app.use(config.rootAPI + "members", MembersRouter);

    app.listen(config.port, () =>
      console.log("Started on port " + config.port)
    );
  })
  .catch(err => {
    console.log("Error during database connection");
    console.log(err.message);
  });
