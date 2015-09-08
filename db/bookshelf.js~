dbConfig = {
  client: 'mysql',
  connection: {
    host     : 'localhost',
    user     : 'root',
    password : 'ernest',
    database : 'healthdata',
    charset  : 'utf8'
  }
}

var knex = require('knex')(dbConfig);

module.exports = require('bookshelf')(knex);

