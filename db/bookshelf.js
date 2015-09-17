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
bookshelf = require('bookshelf')(knex);
tools = {knex : knex, bookshelf: bookshelf}

module.exports = tools;

