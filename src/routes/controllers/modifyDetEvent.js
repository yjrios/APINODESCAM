const conexion = require('../../database')
const moment = require('moment')

exports.verificar = async (req, res, next) => {
    sql = `SELECT * FROM detalle_evento WHERE id = ${req.params.idDet}`
    try {
        await conexion.query(sql, (err,resul) => {
            if (err) {
                throw err
            }else{
                if (resul.length !== 0) {
                    next()
                }else{
                    return res.json({message: 'No existe detalles para este evento'}).status(404)
                }
            }
        })
    } catch (error) {
        return res.json({
            message: 'ERROR EN EL SERVIDOR',
            error
        })
    }
}

exports.edit = async (req, res) => {
    let fchhorareal_Llegada = new Date(req.body.fchhorareal_Llegada)
    let fchhorareal_Salida = new Date(req.body.fchhorareal_Salida)
    let fchhoraestimada_Llegada = new Date(req.body.fchhoraestimada_Llegada)
    let difFechas = 0
    let trueFalse = false
    let sql = `UPDATE detalle_evento SET ? WHERE id = ${req.params.idDet}`
    if (req.body.fchhorareal_Llegada === null) {
        fchhorareal_Llegada = null
    }
    if (req.body.fchhorareal_Salida === null) {
        fchhorareal_Salida = null
    }
    if (req.body.fchhoraestimada_Llegada === null) {
        fchhoraestimada_Llegada = null
    }
    if ( (req.body.id_Evento === 2 || req.body.id_Evento === 3) && req.body.fchhoraestimada_Llegada !== null && req.body.fchhorareal_Llegada !== null) {
        if ( req.body.fchhorareal_Llegada > req.body.fchhoraestimada_Llegada ) {
            let fechadesde = moment(new Date(req.body.fchhoraestimada_Llegada))
            let fechahasta = moment(new Date(req.body.fchhorareal_Llegada))
            difFechas = moment.duration(fechahasta.diff(fechadesde))
            difFechas = difFechas.asMinutes()
        }
    }
    if (req.body.id_Evento === 3 && req.body.fchhorareal_Salida !== null && req.body.fchhorareal_Llegada !== null) {
        trueFalse = true
    }
    let payload = {
        id: req.body.id,
        id_Evento: req.body.id_Evento,
        fchhoraestimada_Llegada: fchhoraestimada_Llegada,
        fchhorareal_Salida: fchhorareal_Salida,
        fchhorareal_Llegada: fchhorareal_Llegada,
        id_Viaje: req.body.id_Viaje,
        diferencia_Fch: difFechas
    }
    try {
        await conexion.query(sql, payload, (err, result) => {
            if (err) {
                throw err
            } else {
                if (trueFalse) {
                    finalizarviaje();
                } else {
                    if (req.body.id_Evento === 2 && req.body.fchhorareal_Salida === null && req.body.fchhorareal_Llegada !== null) {
                        cambiarstatusviaje()
                    } else {
                        return res.json({ message: 'Actualizacion de detalle exitoso'})
                    }
                }
            }
        })
    } catch (error) {
        return res.json({
            message: 'ERROR EN EL SERVIDOR',
            error
        })
    }

    function cambiarstatusviaje () {
        let sql = `UPDATE viajes v, status_viaje s SET v.id_Status = s.id WHERE id_Viaje = ${req.body.id_Viaje} AND s.status = 'EN PROCESO'`
        conexion.query(sql, (err,resultado) => {
            if (err) {
                throw err
            } else {
                return res.json({ message: 'Actualizacion de detalle exitoso'})
            }
        })
    }

    function finalizarviaje () {
        let sqlviaje = `UPDATE viajes v, status_viaje s SET v.id_Status = s.id WHERE id_Viaje = ${req.body.id_Viaje} AND s.status = 'REALIZADO'`
        try {
            conexion.query(sqlviaje, (error, resultado) => {
                if (error) {
                    res.status(404)
                } else {
                    return res.json({ message: 'Actualizacion de detalle exitoso',resultado })
                }
            })
        } catch (error) {
            return res.status(500)
        }
    };
}