const connection = require('../../database')

exports.validarviaje = async (req, res, next) => {
    if (req.body.Viaje_Asoc !== '' && req.body.Viaje_Asoc !== null) {
        let sql = `SELECT * FROM viajes v, status_viaje s WHERE v.Viaje_Asoc = '${req.body.Viaje_Asoc}' AND s.id = v.id_Status
        AND (s.status = 'PENDIENTE' OR s.status = 'EN PROCESO')`
        let array = req.body.Viaje_Asoc.split('-', 2)
        let idAsoc = Number(array[1])
        let sql2 = `SELECT * FROM viajes WHERE id_Viaje = ${idAsoc}`
        connection.query(sql, (error,resultado) => {
            if (error) {
                throw error
            } else {
                if (resultado.length !== 0) {
                    return res.json({ message: "YA EXISTE" })
                } else {
                    connection.query(sql2, (erro, resul) => {
                        if (erro) {
                            throw erro
                        } else {
                            if (resul.length !== 0) {
                                if (resul[0].id_Vehiculo === req.body.id_Vehiculo) {
                                    next()
                                } else {
                                    return res.json({ message: 'PLACAS DIFERENTES' })
                                }
                            } else {
                                return res.json({ message: 'NO EXISTE VIAJE ASOCIADO' })
                            }
                        }
                    })
                }
            }
        })
    } else {
        next()
    }
}

exports.aggViaje = async (req, res, next) => {
    try {
        const sql = 'INSERT INTO viajes SET ?'
        const body = {
            id_Vehiculo: req.body.id_Vehiculo,
            id_Personal: req.body.id_Personal,
            id_SedeOrigen: req.body.id_SedeOrigen,
            id_SedeDestino: req.body.id_SedeDestino,
            id_Status: req.body.id_Status,
            carga: req.body.carga,
            detalle: req.body.detalle,
            cantidad: req.body.cantidad,
            Viaje_Asoc: req.body.Viaje_Asoc
        }

        if(body){
            connection.query(sql, body, (error, result) => {
            if (error) {
                return res.json(result).status(400)
            } else {
                next()
            }
          })
        }
    } catch (error) {
        return res.status(500)
    }
}

exports.aggDetalleEvento = async (req, res) => {
    sqlviaje = 'SELECT MAX(id_Viaje) AS id FROM viajes'
    sqldetalle = 'INSERT INTO detalle_evento SET ?'

    await connection.query(sqlviaje, async (error, resul) => {
        if (error) {
            throw error
        } else {
            let fecha_Carga = new Date(req.body.fchhoraestimada_Carga).toLocaleString()
            let array = fecha_Carga.split(' ')
            let divfecha = array[0].split('/')
            let fechaCarga = ''
            if (divfecha[0] <= 9 && divfecha[1] > 9) {
              fechaCarga = divfecha[2] +'-'+ divfecha[1] +'-0'+ divfecha[0] +' '+ array[1]
            }
            if (divfecha[0] > 9 && divfecha[1] <= 9) {
              fechaCarga = divfecha[2] +'-0'+ divfecha[1] + '-'+ divfecha[0] +' '+ array[1]
            }
            if (divfecha[0] > 9 && divfecha[1] > 9) {
              fechaCarga = divfecha[2] +'-'+ divfecha[1] +'-'+ divfecha[0] +' '+ array[1]
            }
            if (divfecha[0] <= 9 && divfecha[1] <= 9) {
                fechaCarga = divfecha[2] +'-0'+ divfecha[1] +'-0'+ divfecha[0] +' '+ array[1]
            }
            let body1 = {
                id_Viaje: resul[0].id,
                fchhoraestimada_Llegada: fechaCarga,
                id_Evento: 2
            }
            
            await connection.query(sqldetalle, body1, async (erro, result) => {
                if (erro) {
                    throw erro
                } else {
                    let fecha_Descarga = new Date(req.body.fchhoraestimada_Descarga).toLocaleString()
                    let array = fecha_Descarga.split(' ')
                    let divfecha = array[0].split('/')
                    let fechaDescarga = ''
                    if (divfecha[0] <= 9 && divfecha[1] > 9) {
                        fechaDescarga = divfecha[2] +'-'+ divfecha[1] +'-0'+ divfecha[0] +' '+ array[1]
                    }
                    if (divfecha[0] > 9 && divfecha[1] <= 9) {
                        fechaDescarga = divfecha[2] +'-0'+ divfecha[1] + '-'+divfecha[0] +' '+ array[1]
                    }
                    if (divfecha[0] > 9 && divfecha[1] > 9) {
                        fechaDescarga = divfecha[2] +'-'+ divfecha[1] +'-'+ divfecha[0] +' '+ array[1]
                    }
                    if (divfecha[0] <= 9 && divfecha[1] <= 9) {
                        fechaDescarga = divfecha[2] +'-0'+ divfecha[1] +'-0'+ divfecha[0] +' '+ array[1]
                    }

                    let body2 = {
                        id_Viaje: resul[0].id,
                        fchhoraestimada_Llegada: fechaDescarga,
                        id_Evento: 3
                    }
                    await connection.query(sqldetalle, body2, async (err, resultado) => {
                        if (err) {
                            throw err
                        } else {
                            return await res.json(resultado)
                        }
                    })
                }
            })
        }
    })
}