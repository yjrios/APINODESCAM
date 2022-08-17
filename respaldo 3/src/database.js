const mysql = require ('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user : 'root',
    password : 'Agroinsumos.2018',
    database: 'transporte'
});


connection.connect(error => {
    if(error) throw error ;
    console.log('Database server running!')
});

module.exports = connection;