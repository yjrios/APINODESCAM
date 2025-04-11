const connection = require('../../database')

exports.buscarviaje = async (req, res) => {
  try { 
    const id = req.params.id_Viaje
    const sql2 = `SELECT v.id_Viaje, v.id_Vehiculo, v.id_Personal, v.cantidad, v.id_SedeOrigen, v.id_SedeDestino, v.id_Status, v.carga, v.detalle, v.Viaje_Asoc,
    s.status, p.cedula, p.nombre, m.placa, m.tipo
    FROM viajes v
    INNER JOIN status_viaje s
    INNER JOIN personal p
    INNER JOIN maestro_vehiculo m
    ON v.id_Status = s.id
    AND p.id = v.id_Personal
    AND m.id = v.id_Vehiculo
    WHERE v.id_Viaje = ${id}`
 
    const sql = `SELECT s . * FROM viajes v INNER JOIN sedes s
    ON (v.id_SedeOrigen = s.id OR v.id_SedeDestino = s.id)
    WHERE v.id_Viaje = ${id}`

    const sql3 = `SELECT dv.fchhoraestimada_Llegada, dv.id_Evento, dv.id_Viaje FROM viajes v INNER JOIN detalle_evento dv
    ON dv.id_Viaje = v.id_Viaje AND (dv.id_Evento = 2 OR dv.id_Evento = 3)
    WHERE v.id_Viaje = ${id}`

    connection.query(sql2, (error, result) => {
      if (error) {
        throw error
      } else if (result.length === 0) {
        return res.json({ message: 'NO HAY DATA' }).status(404)
      } else {
        connection.query(sql3, (erro, resultado) => {
          if (erro) {
            throw erro
          } else {
            connection.query(sql, (err, resul) => {
              if (err) {
                throw err
              }
              return res.json({
              viaje: result,
              sedes: resul,
              detalle: resultado
              })
            })
          }
        })
      }
    })
  } catch (error) {
      res.status(500)
  }
}
 
exports.verificarviaje = async (req, res, next) => {
  if (req.body.Viaje_Asoc !== '' && req.body.Viaje_Asoc !== null) {
    let array = req.body.Viaje_Asoc.split('-', 2)
    let idAsoc = Number(array[1])
    let sql = `SELECT * FROM viajes WHERE id_Viaje = ${idAsoc}`
    let sqlverify = `SELECT COUNT(*) as valor FROM viajes v, status_viaje s WHERE v.Viaje_Asoc = '${req.body.Viaje_Asoc}' AND s.id = v.id_Status
    AND v.id_Viaje <> req.params.viaje AND (s.status = 'PENDIENTE' OR s.status = 'EN PROCESO')`
    connection.query(sql, (error,resultado) => {
      if (error) {
        throw error
      } else {
        if (resultado.length !== 0) {
          if (resultado[0].id_Vehiculo === req.body.id_Vehiculo) {
            connection.query(sqlverify, (er, respuesta) => {
              if (er) {
                throw er
              } else {
                if (respuesta[0].valor !== 0) {
                  return res.json({ message: 'YA EXISTE VIAJE ASOCIADO' })
                } else {
                  next()
                }
              }
            })
          } else {
            return res.json({ message: 'PLACAS DIFERENTES' })
          }
        } else {
          return res.json({ message: 'NO EXISTE VIAJE' })
        }
      }
    })
  } else {
    next()
  }
}

exports.modify = async (req, res) => {
  const viaje = req.params.viaje
  const data = {
    id_Vehiculo: req.body.id_Vehiculo,
    id_Personal: req.body.id_Personal,
    id_SedeOrigen: req.body.id_SedeOrigen,
    id_SedeDestino: req.body.id_SedeDestino,
    carga: req.body.carga,
    detalle: req.body.detalle,
    cantidad: req.body.cantidad,
    Viaje_Asoc: req.body.Viaje_Asoc
  }
  let sql = `UPDATE viajes SET ? WHERE id_Viaje = ${viaje}`
  try {
    connection.query(sql, data, (err, result) => {
      if (err) {
        throw err
      } else {
        if (req.body.fchhoraestimada_Carga !== '' || req.body.fchhoraestimada_Carga !== null) {
          try {
            let fechaCarga = new Date(req.body.fchhoraestimada_Carga).toLocaleString()
            let array = fechaCarga.split(' ')
            let divfecha = array[0].split('/')
            if (divfecha[0] <= 9 && divfecha[1] > 9) {
              fechaCarga = divfecha[2] +'-'+ divfecha[1] +'-0'+ divfecha[0] +' '+ array[1]
            }
            if (divfecha[0] > 9 && divfecha[1] <= 9) {
              fechaCarga = divfecha[2] +'-0'+ divfecha[1] + '-'+divfecha[0] +' '+ array[1]
            }
            if (divfecha[0] > 9 && divfecha[1] > 9) {
              fechaCarga = divfecha[2] +'-'+ divfecha[1] +'-'+ divfecha[0] +' '+ array[1]
            }
            if (divfecha[0] <= 9 && divfecha[1] <= 9) {
              fechaCarga = divfecha[2] +'-0'+ divfecha[1] +'-0'+ divfecha[0] +' '+ array[1]
            }
            let sql2 = `UPDATE detalle_evento SET fchhoraestimada_Llegada = '${fechaCarga}' WHERE id_Viaje = ${viaje} AND id_Evento = 2`
            connection.query(sql2, (erro,resul) => {
              if (erro) {
                throw erro
              }
            })
          } catch (error) {
            return res.status(500)
          }
        }
        if (req.body.fchhoraestimada_Descarga !== '' || req.body.fchhoraestimada_Descarga !== null) {
          try {
            let fechaDescarga = new Date(req.body.fchhoraestimada_Descarga).toLocaleString()
            let array = fechaDescarga.split(' ')
            let divfecha = array[0].split('/')
            if (divfecha[0] <= 9 && divfecha[1] > 9) {
              fechaDescarga = divfecha[2] +'-'+ divfecha[1] +'-0'+ divfecha[0] +' '+ array[1]
            }
            if (divfecha[0] > 9 && divfecha[1] <= 9) {
              fechaDescarga = divfecha[2] +'-0'+ divfecha[1] + '-'+ divfecha[0] +' '+ array[1]
            }
            if (divfecha[0] > 9 && divfecha[1] > 9) {
              fechaDescarga = divfecha[2] +'-'+ divfecha[1] +'-'+ divfecha[0] +' '+ array[1]
            }
            if (divfecha[0] <= 9 && divfecha[1] <= 9) {
              fechaDescarga = divfecha[2] +'-0'+ divfecha[1] +'-0'+ divfecha[0] +' '+ array[1]
            }
            let sql3 = `UPDATE detalle_evento SET fchhoraestimada_Llegada = '${fechaDescarga}' WHERE id_Viaje = ${viaje} AND id_Evento = 3`
            connection.query(sql3, (error,resultado) => {
              if (error) {
                throw error
              } else {
                return res.json({message: 'Modificacion Exitosa'}).status(200)
              }
            })
          } catch (error) {
            return res.status(500)
          }
        }
      }
    })
  } catch (error) {
    return res.json(error).status(500)
  }
}