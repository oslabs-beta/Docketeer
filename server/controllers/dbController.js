/**
 * ************************************
 *
 * @module Database Controller
 * @author Catherine Larcheveque, Lorenzo Guevara, Charles Ryu, Griffin Silver, Alex Smith
 * @date 6/20/2021
 * @description Contains middleware that checks if the database has a user table and creates one if it doesn't
 *
 * ************************************
 */

const db = require('../models/cloudModel');

 
const dbController = {};

dbController.createRoles = (req, res, next) => {
  db.query('CREATE TABLE IF NOT EXISTS roles (_id SERIAL NOT NULL, role VARCHAR (255) UNIQUE NOT NULL, PRIMARY KEY (_id)) WITH (OIDS = FALSE);');
  db.query('INSERT INTO Roles (role) VALUES (\'system admin\'); INSERT INTO Roles (role) VALUES (\'admin\'); INSERT INTO Roles (role) VALUES (\'user\')');
  return next();
};

dbController.createTable = (req, res, next) => {
  db.query('CREATE TABLE IF NOT EXISTS roles (_id SERIAL NOT NULL, role VARCHAR (255) UNIQUE NOT NULL, PRIMARY KEY (_id)) WITH (OIDS = FALSE); CREATE TABLE IF NOT EXISTS users (_id SERIAL NOT NULL, username VARCHAR (255) UNIQUE NOT NULL, email VARCHAR (255) NOT NULL, password VARCHAR (255) NOT NULL, phone VARCHAR (255), role VARCHAR (255) DEFAULT "user", role_id INTEGER DEFAULT 3, contact_pref VARCHAR (255), mem_threshold INTEGER DEFAULT 80, cpu_threshold INTEGER DEFAULT 80, container_stops BOOLEAN DEFAULT true, PRIMARY KEY (_id), FOREIGN KEY (role_id) REFERENCES Roles(_id)) WITH (OIDS = FALSE);');
  db.query('INSERT INTO users (username, email, password, phone) VALUES (\'sysadmin\', \'sysadmin@email.com\', \'narwhals\', \'5105553333\')');
  return next();
};

module.exports = dbController;