const connection = require('../../database')

exports.getStatus = async (req, res) => {
    const sql = 'SELECT * FROM status_viaje'
    
    try {
        connection.query(sql, (error, result) => {
            if(error){ throw error }

            return res.json(result)
        })
    } catch (error) {
        console.log(error)
    }
}