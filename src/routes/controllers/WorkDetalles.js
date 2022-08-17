const conexion = require('../../database')

exports.verificareventoOrigen = async (req, res, next) => {
    let idviaje = req.body.idviaje
    let id_Evento = req.body.id_Evento
    sql = `SELECT * FROM detalle_evento WHERE id_Viaje = ${idviaje} AND id_Evento = ${id_Evento}`
    try {
        conexion.query(sql, async (error, result) => {
            if (error) {
                throw error
            } else {
                if (result.length !== 0) {
                    return res.status(400)
                }else{
                    next()
                }
            }
        })
    } catch (error) {
        console.log(error)
    } 
}

exports.addfecha = async (req, res) => {
    let payload = {
        id_Viaje: req.body.idviaje,
        id_Evento: req.body.id_Evento,
        fchhorareal_Salida: new Date(req.body.fchhorareal_Salida)
    }
    sql = 'INSERT INTO detalle_evento SET ?'
    try {
        await conexion.query(sql, payload, (err,result) => {
            if (err) {
                throw err
            }else{
                cambiarstatusviaje();
            }
        })
    } catch (error) {
        return req.json({message: 'ERROR EN EL SERVIDOR',error})
    }

    function cambiarstatusviaje () {
        sql = `UPDATE viajes SET id_Status = ? WHERE id_Viaje = ${req.body.idviaje}`
        let id_Status = 2

        conexion.query(sql, id_Status, (err,resultado) => {
            if (err) {
                throw err
            } else {
                return res.json(resultado)
            }
        })
    }
}