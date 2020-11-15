const mysql = require('mysql2')

const username = process.env.databaseUser
const password = process.env.databasePassword
const host = process.env.databaseHost

const queryDatabase = async (query) => {
  var connection = mysql.createConnection({
    host: host,
    user: username,
    password: password,
    database: 'db'
  })
  var result;
  connection.connect();

  connection.query(query, function (error, results, fields) {
    if (error) {
      console.log(error);
      throw error;
    }
    console.log('Ran query: ' + query);
    for (result in results)
      console.log(results[result]);
  })

  return new Promise((resolve, reject) => {
    connection.end(err => {
      if (err)
        return reject(err);
      const response = {
        statusCode: 200,
        body: JSON.stringify(result),
      };
      resolve(response);
    })
  })
};

module.exports = {
  queryDatabase
}