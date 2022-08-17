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
    sql = `UPDATE detalle_evento SET ? WHERE id = ${req.params.idDet}`
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
    if (req.body.id_Evento === 1 && req.body.fchhorareal_Salida !== null && req.body.fchhorareal_Llegada !== null) {
        trueFalse = true
    }
    let payload = {
        id: req.body.id,
        id_Evento: req.body.id_Evento,
        fchhoraestimada_Llegada: fchhoraestimada_Llegada,
        fchhorareal_Salida: fchhorareal_Salida,
        fchhorareal_Llegada: fchhorareal_Llegada,
        diferencia_Fch: req.body.diferencia_Fch,
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
                    return res.json( { message: 'Actualizacion de detalle exioso',result } )
                }
            }
        })
    } catch (error) {
        return res.json({
            message: 'ERROR EN EL SERVIDOR',
            error
        })
    }

    function finalizarviaje () {
        sqlviaje = `UPDATE viajes SET id_Status = ? WHERE id_Viaje = ${req.body.id_Viaje}`
        let id_Status = 3
        try {
            conexion.query(sqlviaje, id_Status, (error, resultado) => {
                if (error){
                    res.status(404)
                } else {
                    return res.json( { message: 'Actualizacion de detalle exioso',resultado } )
                }
            })
        } catch (error) {
            return res.status(500)
        }
    };
}