/**
 * ************************************
 *
 * @module Cloud Database Model
 * @author Catherine Larcheveque, Lorenzo Guevara, Charles Ryu, Griffin Silver, Alex Smith
 * @date 6/14/2021
 * @description Creates pool to connect application with elephantSQL cloud database that contains persisted user information, exports function used to query database
 *
 * ************************************
 */

const { Pool } = require('pg');

// const PG_URI = 'postgres://rfrfjqki:n_e0IG_iOdeazv5etzaJ7_SH9lmTzXDM@kashin.db.elephantsql.com/rfrfjqki';
const PG_URI = 'postgres://esrqonou:GowrUoalglBtHwGI_ctUIf-PisHFBrgJ@kashin.db.elephantsql.com/esrqonou '; // charles testing uri

const cloudPool = new Pool({ 
  connectionString: PG_URI,
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
});

module.exports = {
  query: function (text, params, callback) {
    console.log('executed cloud query', text);
    return cloudPool.query(text, params, callback);
  }
};