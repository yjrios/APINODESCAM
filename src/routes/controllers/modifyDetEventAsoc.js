const conexion = require('../../database')
const moment = require('moment')

exports.verificar = async (req, res, next) => {
    let array_ViajeAsoc = req.body.Viaje_Asoc.split('-', 2)
    let idViaje = Number(array_ViajeAsoc[1])
    sql = `SELECT d . * FROM detalle_evento d INNER JOIN viajes v INNER JOIN status_viaje s INNER JOIN eventos e
    ON e.id = d.id_Evento
    AND d.id_Viaje = v.id_Viaje
    AND v.id_Status = s.id
    WHERE v.id_Viaje = ${idViaje} AND s.status = 'REALIZADO' AND e.descripcion = 'DESCARGA'`
    try {


        await conexion.query(sql, (err,resul) => {
            if (err) {
                throw err
            } else {
                if (resul.length !== 0) {
                    req.body.detalle = resul[0]
                    next()
                } else {
                    return res.json({message: 'Viaje padre no ha culminado'}).status(404)
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
    let difFechas = 0
    let fechaLlegada = new Date(req.body.detalle.fchhorareal_Llegada).toLocaleString()
    let fechaSalida = new Date(req.body.detalle.fchhorareal_Salida).toLocaleString()
    let array = fechaLlegada.split(' ')
    let divfecha = array[0].split('/')
    if (divfecha[0] <= 9 && divfecha[1] > 9) {
        fechaLlegada = divfecha[2] +'-'+ divfecha[1] +'-0'+ divfecha[0] +' '+ array[1]
    }
    if (divfecha[0] > 9 && divfecha[1] <= 9) {
        fechaLlegada = divfecha[2] +'-0'+ divfecha[1] + '-'+divfecha[0] +' '+ array[1]
    }
    if (divfecha[0] > 9 && divfecha[1] > 9) {
        fechaLlegada = divfecha[2] +'-'+ divfecha[1] +'-'+ divfecha[0] +' '+ array[1]
    }
    if (divfecha[0] <= 9 && divfecha[1] <= 9) {
        fechaLlegada = divfecha[2] +'-0'+ divfecha[1] +'-0'+ divfecha[0] +' '+ array[1]
    }
    let arrayS = fechaSalida.split(' ')
    let divfechaS = arrayS[0].split('/')
    if (divfechaS[0] <= 9 && divfechaS[1] > 9) {
        fechaSalida = divfechaS[2] +'-'+ divfechaS[1] +'-0'+ divfechaS[0] +' '+ arrayS[1]
    }
    if (divfechaS[0] > 9 && divfechaS[1] <= 9) {
        fechaSalida = divfechaS[2] +'-0'+ divfechaS[1] + '-'+divfechaS[0] +' '+ arrayS[1]
    }
    if (divfechaS[0] > 9 && divfechaS[1] > 9) {
        fechaSalida = divfechaS[2] +'-'+ divfechaS[1] +'-'+ divfechaS[0] +' '+ arrayS[1]
    }
    if (divfechaS[0] <= 9 && divfechaS[1] <= 9) {
        fechaSalida = divfechaS[2] +'-0'+ divfechaS[1] +'-0'+ divfechaS[0] +' '+ arrayS[1]
    }
    let sql = `SELECT fchhoraestimada_Llegada FROM detalle_evento WHERE id_Viaje = ${req.params.idViaje} AND id_Evento = 2`
    
    try {
        await conexion.query(sql, (err, result) => {
            if (err) {
                throw err
            } else {
                if (new Date(fechaLlegada).toISOString() > result[0].fchhoraestimada_Llegada.toISOString()) {
                    let fechadesde = moment(new Date(result[0].fchhoraestimada_Llegada))
                    let fechahasta = moment(new Date(fechaLlegada))
                    difFechas = moment.duration(fechahasta.diff(fechadesde))
                    difFechas = difFechas.asMinutes()
                }
                let sql2 = `UPDATE detalle_evento SET fchhorareal_Llegada = '${fechaLlegada}',
                fchhorareal_Salida = '${fechaSalida}', diferencia_Fch = ${difFechas}
                WHERE id_Viaje = ${req.params.idViaje} AND id_Evento = 2`

                conexion.query(sql2, (erro, resul) => {
                    if (erro) {
                        throw erro
                    } else {
                        // return res.json( { message: 'Actualizacion de detalle exitoso', resul } )
                        cambiarstatusviaje()
                    }
                })
            }
        })
    } catch (error) {
        return res.json({
            message: 'ERROR EN EL SERVIDOR',
            error
        })
    }
    function cambiarstatusviaje () {
        let sql = `UPDATE viajes v, status_viaje s SET v.id_Status = s.id
        WHERE v.id_Viaje = ${req.params.idViaje} AND s.status = 'EN PROCESO'`

        conexion.query(sql, (error, resultado) => {
            if (error) {
                throw error
            } else {
                return res.json( { message: 'Actualizacion de detalle exitoso', resultado } )
            }
        })
    }

}