const connection = require('../../database')

exports.addCentro = async (req, res) => {
    try {
        const sql = `INSERT INTO sedes SET descripcion = '${req.body.descripcion}', direccion = '${req.body.direccion}'`
        if (req.body) {
            connection.query(sql, (error, result) =>{
            if (error) {
                return res.status(404)
            } else {
                return res.json(result).status(200)
            }
          })
        }
    } catch (error) {
        console.log(error)
    }
}