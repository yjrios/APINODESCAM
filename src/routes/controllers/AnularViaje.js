const connection = require('../../database')
const conexion = require('../../database')

exports.anulacion = (req, res) => {
    let sql = `UPDATE viajes v, status_viaje s SET v.id_Status = s.id WHERE v.id_Viaje = ${req.params.viaje} AND s.status = 'ANULADO'`
    let sql2 = `UPDATE viajes v, status_viaje s SET v.Viaje_Asoc = '${req.body.placa + '-' +req.body.asociado}' WHERE v.Viaje_Asoc = '${req.body.placa + '-' +req.params.viaje}'
    AND s.id = v.id_Status AND s.status = 'PENDIENTE'`
    let sql3 = `SELECT v.id_Viaje FROM viajes v, status_viaje s WHERE v.Viaje_Asoc = '${req.body.placa + '-' +req.params.viaje}' AND s.id = v.id_Status AND s.status = 'PENDIENTE'`
    try {
        conexion.query(sql, (error, result) => {
            if (error) {
                return res.status(500)
            } else {
                if (req.body.asociado !== 0) {
                    connection.query(sql3, (err, resul) => {
                        if (err) {
                            throw err
                        } else {
                            if (resul.length !== 0) {
                                connection.query(sql2, (err, resultado) => {
                                    if (err) {
                                        throw err
                                    } else {
                                        return res.json({message: 'Anulado Exitosamente', statuscode: 200, resultado})
                                    }
                                })
                            } else {
                                return res.json({message: 'Anulado Exitosamente', statuscode: 200})
                            }
                        }
                    })
                } else {
                    connection.query(sql3, (erro, result) => {
                        if (erro) {
                            throw erro
                        } else {
                            if (result.length !== 0) {
                                let sql4 = `UPDATE viajes SET Viaje_Asoc = null WHERE id_Viaje = ${result[0].id_Viaje}`
                                connection.query(sql4, (er, resul) => {
                                    if (er) {
                                        throw er
                                    } else {
                                        return res.json({message: 'Anulado Exitosamente', statuscode: 200, resul})
                                    }
                                })
                            } else {
                                return res.json({message: 'Anulado Exitosamente', statuscode: 200})
                            }
                        }
                    })
                }
            }

        })
    } catch (error) {
        return res.status(500)
    }
}

exports.cancelarviaje = (req, res) => {
    let sql = `UPDATE viajes SET id_Status = ${req.body.id_Status}, detalle = '${req.body.observacion}' WHERE id_Viaje = ${req.params.viaje}`
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