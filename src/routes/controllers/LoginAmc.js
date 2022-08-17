const connection = require('../../database')

 
exports.login = async (req, res) => {
    const placa = req.body.usuario
    sql = `SELECT * FROM maestro_vehiculo WHERE placa = '${placa}'`
    try {
        await connection.query(sql, (err,result) => {
            if (err) {
                return res.status(400)
            }else{
                return res.json(result).status(200)
            }
        })
    } catch (error) {
        console.log(error)
        return res.status(500)
    }
}