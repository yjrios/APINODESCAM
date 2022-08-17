const conexion = require('../../database')

exports.alldetalles = async (req, res) => {
    const id_Viaje = req.params.id
    sql = `SELECT * FROM detalle_evento WHERE id_Viaje = ${id_Viaje}`

    try {
        await conexion.query(sql, async (error,result) => {
            if (error) {
                throw error
            } else {
                return await res.json(result)
            }
        })
    } catch (error) {
        console.log(error)
    }
}