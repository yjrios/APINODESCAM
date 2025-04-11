const connection = require('../../database')

exports.obtener = async (req, res) => {
    try {
        const sql = `SELECT v.id_Viaje, v.id_Vehiculo, v.id_Personal, v.cantidad, v.id_SedeOrigen, v.id_SedeDestino, v.id_Status, s.status, v.carga, v.detalle, p.cedula, p.nombre, m.placa, m.tipo
        FROM viajes v
        INNER JOIN status_viaje s
        INNER JOIN personal p
        INNER JOIN maestro_vehiculo m
        ON v.id_Status = s.id
        AND p.id = v.id_Personal
        AND m.id = v.id_Vehiculo
        AND s.status != 'ANULADO'`

        const sql2 = `SELECT DISTINCT s . * FROM sedes s INNER JOIN viajes v
        ON (v.id_SedeOrigen = s.id OR v.id_SedeDestino = s.id)`
        
        const sql3 = `SELECT DISTINCT dv . * FROM detalle_evento dv INNER JOIN viajes v
        ON dv.id_Viaje = v.id_Viaje AND (dv.id_Evento = 2 OR dv.id_Evento = 3)`
        connection.query(sql, (error, result) => {
          if (error) {
            throw error
          } else {
            if (result.length !== 0) {
              connection.query(sql3, (erro, detalle) => {
                if (erro) {
                  throw erro
                } else {
                  connection.query(sql2, (err, resul) => {
                    if (err) {
                      throw err
                    }
                    return res.json({
                    viaje: result, 
                    sedes: resul,
                    detalle: detalle
                    })
                  })
                }
              })
            }
          }
        })
    } catch (error) {
        console.log(error)
        res.status(500)
    }
}