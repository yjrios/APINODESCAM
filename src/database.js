const mysql = require ('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user : 'root',
    password : '',
    database: 'transporte'
}); 


connection.connect(error => {
    if(error) throw error ;
    console.log('Database server running!')
});

module.exports = connection;