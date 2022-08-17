const connection = require('../../database')

exports.tofindEvents = async (req,res) => {

    sql = 'SELECT * FROM eventos'

    try {
        connection.query(sql, (err,result) => {
            if (err) {
                throw err
            }else{
                return res.json(result)
            }
        })
    } catch (error) {
        return await res.status(500)
    }
}