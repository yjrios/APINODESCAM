const connection = require('../../database')

exports.dropdownviajes = async (req, res) =>{
    try { 
        const sql = 'SELECT ID, PLACA, TIPO FROM maestro_vehiculo'
        const sql2 = 'SELECT * FROM sedes'
        const sql3 = 'SELECT * FROM personal'
        connection.query(sql, (error, resul) => {
          if (error) {
            throw error
          }
          connection.query(sql2, (error, result)=> {
            if (error) {
              throw error
            }
            connection.query(sql3, (error, resultado)=> {
              if (error) {
                throw error
              }
              res.status(200).json({
              vehiculos: resul,
              sedes: result,
              personal: resultado
            })
          })
        })
      })
    } catch (error) {
        console.log(error)
        res.status(500)
    }
}