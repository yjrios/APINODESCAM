const conexion = require('../../database')

exports.anulacion = (req, res) => {
    sql = `UPDATE viajes SET id_Status = ${req.body.id_Status} WHERE id_Viaje = ${req.params.viaje}`
    try {
        conexion.query(sql, (error, result) => {
            if (error){
                return res.status(500)
            }else{
                return res.json({message: 'Anulado Exitosamente', statuscode: 200}).status(200)
            }

        })
    } catch (error) {
        console.log(error)
        return res.status(500)
    }
}


exports.cancelarviaje = (req, res) => {
    sql = `UPDATE viajes SET id_Status = ${req.body.id_Status}, detalle = '${req.body.observacion}' WHERE id_Viaje = ${req.params.viaje}`
    try {
        conexion.query(sql, (error, result) => {
            if (error) {
                return res.status(500)
            } else {
                return res.json({message: 'Cancelado Exitosamente', statuscode: 200})
            }

        })
    } catch (error) {
        console.log(error)
        return res.status(500)
    }
}