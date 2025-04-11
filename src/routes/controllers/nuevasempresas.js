const connection = require('../../database')

exports.tofindEnterprise = async (req,res) => {

    let sql = 'SELECT * FROM empresas'

    try {
        connection.query(sql, (err,result) => {
            if (err) {
                throw err
            } else {
                return res.json(result)
            }
        })
    } catch (error) {
        return await res.status(500)
    }
}