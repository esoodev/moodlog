const mysql = require('mysql2')

// const username = process.env.databaseUser
// const password = process.env.databasePassword
// const host = process.env.databaseHost
const username = 'leeso'
const password = 'pizzapie'
const host = 'moodlog-database.cvtk6pdo6ado.us-east-1.rds.amazonaws.com'

const queryDatabase = async (query) => {
  var connection = mysql.createConnection({
    host: host,
    user: username,
    password: password,
    database: 'db'
  })
  connection.connect();

  let sendQuery = (q) => {
    return new Promise((resolve, reject) => {
      connection.query(q, function (error, results, fields) {
        if (error) {
          console.log(error);
          reject(error);
        }
        // console.log('Ran query: ' + q);
        // for (result in results)
        // console.log(results[result]);
        resolve(results);
      })
    });
  };

  let endConnection = (conn) => {
    return new Promise((resolve, reject) => {
      conn.end(err => {
        if (err)
          return reject(err);
        resolve({
          statusCode: 200
        });
      })
    })
  };

  try {
    const result = await sendQuery(query);
    endConnection(connection);
    return result;
  } catch (err) {
    endConnection(connection);
    throw err
  }

};

const getLatestLogDate = async (userId) => {
  const query = `SELECT date_created FROM db.Measure WHERE user_id = '${userId}'\
    UNION ALL SELECT date_created FROM db.Note WHERE user_id = '${userId}'\
    ORDER BY date_created DESC\
    LIMIT 1;`
  try {
    const res = await queryDatabase(query);
    return Date(res[0].date_created);   // TODO: Date keeps changing for some reason?
  } catch (e) {
    return e;
  }
};

module.exports = { queryDatabase, getLatestLogDate }
