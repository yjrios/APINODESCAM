const connection = require('../../database')

exports.buscarviajeplaca = async (req, res) =>{
    try {
      const sql2 = `SELECT DISTINCT s . * FROM sedes s INNER JOIN viajes v
        ON (v.id_SedeOrigen = s.id OR v.id_SedeDestino = s.id)`
      
      const sql = `SELECT DISTINCT v . *, mv.placa, s.status, p.cedula FROM viajes v
      INNER JOIN maestro_vehiculo mv
      INNER JOIN status_viaje s
      INNER JOIN personal p
      ON mv.id = v.id_Vehiculo
      AND s.id = v.id_Status
      AND p.id = v.id_Personal
      WHERE mv.placa = '${req.params.placa}' AND s.status IN('PENDIENTE','EN PROCESO')`

      connection.query(sql, (err, resul) => {
        if (err) {
          throw err
        } else {
          connection.query(sql2, (erro, result) => {
            if (erro) {
              throw erro
            } else {
              return res.json({
                viaje: resul, 
                sedes: result
              }).status(200)
            }
          })
        }
      })
      
    } catch (error) {
        console.log(error)
        res.status(500)
    }
}