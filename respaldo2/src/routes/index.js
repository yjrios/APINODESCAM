const { Router } = require ('express');
const router = Router();

const connection = require ('../database')
const moment = require('moment')


// Route endpoints

// all customers 
router.get('/vehiculos',(req,res)=>{
    const sql = `SELECT @numero:=@numero + 1 AS posicion, v.* , m.*, st.status, o.*
    FROM maestro_vehiculo v 
    INNER JOIN marca m 
    INNER JOIN status st 
    INNER JOIN operatividad o
    ON v.id_marca = m.id 
    AND v.id_operatividad = o.id
    AND o.id_status=st.id, (SELECT @numero:= 0) AS s;`;
    connection.query(sql,(error, results)=>{
       if(error) throw error;
       if (results.length>0){
           res.json(results);
       }else {
           res.send ('Not results');
       }
    });
});

router.get('/vehiculo/:id',(req,res)=>{
    const id = req.params.id
    const sql = `SELECT *
     FROM maestro_vehiculo v 
     INNER JOIN marca m 
     INNER JOIN status s 
     INNER JOIN tipos_de_carga t 
     INNER JOIN kilometraje k
     INNER JOIN operatividad o
     ON v.id_marca = m.id 
     AND v.id_tipo_carga=t.id 
     AND v.id_operatividad = o.id
     AND o.id_status = s.id 
     AND k.id_vehiculo=v.id
     WHERE v.placa = '${id}'
     GROUP BY k.kilometraje 
     ORDER BY k.kilometraje desc limit 1 `;
    connection.query(sql,(error, result)=>{
        if(error) {
            const response = {message: 'Error!', data: {error} }
            res.status(500)
            res.json(response)
        } 
        if (result.length>0){
            const response = {message: 'Exito!', data: result[0]}
            res.status(200)
            res.json(response);
        }else {
            res.status(204)
            res.json({message: 'sin resultados!', data:[] });
        }
     });
   
});

router.get('/kilometraje/:id',(req,res)=>{
    const {id} = req.params
    const sql = `SELECT k.kilometraje AS km, DATE_FORMAT(k.fecha,"%d-%m-%Y") as fecha, k.id as id_km, v.* ,v.id as id_v , m.* , s.*,t.*,DATE_FORMAT(o.fecha,"%d-%m-%Y") as fstatus, o.id as id_ultimo_s,s.id as id_status
     FROM maestro_vehiculo v 
     INNER JOIN kilometraje k 
     INNER JOIN marca m 
     INNER JOIN status s 
     INNER JOIN tipos_de_carga t 
     INNER JOIN operatividad o
     ON v.id_marca = m.id 
     AND v.id_tipo_carga = t.id 
     AND v.id_operatividad = o.id 
     AND o.id_status = s.id
     AND k.id_vehiculo = v.id 
     AND v.placa = o.placa
     WHERE v.placa = '${id}' 
     order by k.kilometraje desc, o.id desc limit 1`;
    connection.query(sql,(error, result)=>{
        if(error) {
            const response = {message: 'Error!', data: {error} }
            res.status(500)
            res.json(response)
        } 
        if (result.length>0){
            const response = {message: 'Exito!', data: result[0]}
            res.status(200)
            res.json(response);
        }else {
            res.status(204)
            res.json({message: 'sin resultados!', data:[] });
        }
     });
});

router.post('/add', (req,res)=>{

    const sql = 'SELECT * FROM maestro_vehiculo WHERE PLACA = ?';
    const placa = req.body.placa
    connection.query (sql, placa, (error, result)=> {
        if(error) throw error;
        if (result.length>0){
            res.status(202)
            res.json({message: 'Placa existe!', data:[] });
        }else{
            insertarO();
        }
    });

        function insertarO (){
            const sql3 = 'INSERT INTO operatividad set ?';
            const customerObj = {
                id_status: req.body.id_status,
                placa: req.body.placa,
                detalles: '', 
                fecha: '',
                dias: '',
                id_sucesor: ''
            }

            connection.query (sql3, customerObj, (error, result)=> {
                if(error) {
                    throw error;
                }
                insertarM(result.insertId);
            });
        }

        function insertarM (id_operatividad){
            const sql = 'INSERT INTO maestro_vehiculo set ?';

            const customerObj = {
                placa: req.body.placa,
                id_marca: req.body.id_marca,
                modelo: req.body.modelo,
                tipo: req.body.tipo,
                motor: req.body.motor,
                transmision: req.body.transmision,
                ejes: req.body.ejes,
                cauchos: req.body.cauchos,
                sistema_electrico: req.body.sistema_electrico,
                bateria: req.body.bateria,
                suspension_del: req.body.suspension_del,
                suspension_tra: req.body.suspension_tra,
                presion_cauchos: req.body.presion_cauchos,
                aceite_motor: req.body.aceite_motor,
                aceite_caja: req.body.aceite_caja,
                aceite_diferencial: req.body.aceite_diferencial,
                dir_foto: req.body.dir_foto,
                id_tipo_carga: req.body.id_tipo_carga,
                color: req.body.color,
                responsable: req.body.responsable,
                tipo_transporte: req.body.tipo_transporte,
                ano: req.body.ano,
                id_operatividad: id_operatividad
            }

            connection.query (sql, customerObj, (error, result)=> {
                if(error) {
                    throw error;
                }
                inicializar(customerObj.placa);
            });
        }

        function inicializar (placa){
            const sql = `SELECT id from maestro_vehiculo WHERE placa ='${placa}' ` ;
            connection.query (sql, (error, result)=> {
                if(error) throw error;
                if ( result[0].id !== null){
                    insertarKm(result[0].id);
                }
            });
        }

        function insertarKm (id){
            const km = 0
            const sql = 'INSERT INTO kilometraje set ?';
            const customerObj = {
                kilometraje: km,
                id_vehiculo: id,
                fecha: fecha()
            }

            connection.query (sql, customerObj, (error, result)=> {
                if(error) {
                    throw error;
                }
                const response = {message: 'Exito!', data: result[0]}
                res.status(200)
                res.json(response);
            });
        }

        function fecha (){
            let date = new Date()
            let day = date.getDate()
            let month = date.getMonth() + 1
            let year = date.getFullYear()

            if(month < 10 && day < 10){
                return(`${year}-0${month}-0${day}`)
            }if(month < 10 && day > 10){
                return(`${year}-0${month}-${day}`)
            }if(month > 10 && day > 10){
                return(`${year}-${month}-${day}`)
            }if(month > 10 && day < 10){
                return(`${year}-${month}-0${day}`)
            }
        }
});

router.put('/update/:id', (req, res)=>{
   const {id} = req.params;
   const {name, city} = req.body;
   const sql = `UPDATE customers SET name = '${name}', city = '${city}' where id='${id}' `;

   connection.query (sql, error=> {
    if(error) throw error;
    res.send('Customer updated!');
    });

});

router.delete('/delete/:id', (req, res)=>{
    const {id}= req.params;
    const sql = `DELETE FROM customers WHERE id= '${id}' `;

    connection.query (sql, error=> {
        if(error) throw error;
        res.send('Customer Deleted!');
    });
    

});

router.get('/tipos_carga',(req,res)=>{
    const sql = 'SELECT * FROM tipos_de_carga';
    connection.query(sql,(error, results)=>{
       if(error) throw error;
       if (results.length>0){
           res.json(results);
       }else {
           res.send ('Not results');
       }
    });

});

router.get('/tipos_mtto',(req,res)=>{
    const sql = 'SELECT * FROM tipo_mtto';
    connection.query(sql,(error, results)=>{
       if(error) throw error;
       if (results.length>0){
           res.json(results);
       }else {
           res.send ('Not results');
       }
    });

});

router.get('/servicios',(req,res)=>{
    const sql = 'SELECT * FROM maestro_servicio order by servicio';
    connection.query(sql,(error, results)=>{
       if(error) throw error;
       if (results.length>0){
           res.json(results);
       }else {
           res.send ('Not results');
       }
    });
});

router.get('/proveedores',(req,res)=>{
    const sql = 'SELECT * FROM maestro_proveedores';
    connection.query(sql,(error, results)=>{
       if(error) throw error;
       if (results.length>0){
           res.json(results);
       }else {
           res.send ('Not results');
       }
    });
});

router.get('/marcas',(req,res)=>{
    const sql = 'SELECT * FROM marca';
    connection.query(sql,(error, results)=>{
       if(error) throw error;
       if (results.length>0){
           res.json(results);
       }else { 
           res.send ('Not results');
       }
    });

});

router.get('/statuspago',(req,res)=>{
    const sql = 'SELECT * FROM status_pago';
    connection.query(sql,(error, results)=>{
       if(error) throw error;
       if (results.length>0){
           res.json(results);
       }else {
           res.send ('Not results');
       }
    });
});

router.get('/statusmtto',(req,res)=>{
    const sql = `SELECT * FROM status_mtto where id='1' or id='3'`;
    connection.query(sql,(error, results)=>{
       if(error) throw error;
       if (results.length>0){
           res.json(results);
       }else {
           res.send ('Not results');
       }
    });
});

router.post('/login', (req,res)=>{
    const sql = 'SELECT * FROM `usuarios` WHERE correo = ? and clave = ? '
    const correo = req.body.email
    const clave = req.body.password
    const customerUser = [ correo, clave]
    console.log(customerUser)
    connection.query (sql, customerUser, (error ,result)=> {
        if(error) {
            const response = {message: 'Error!', data: {error} }
            res.status(500)
            res.json(response)
        } 
        if (result.length>0){
            const response = {message: 'Exito usuario encontrado!', data: result[0]}
            res.status(200)
            res.json(response);
            console.log('devolvio correcto')
        }else {
            res.status(204)
            res.json({message: 'sin resultados!', data:[] });
        }
    });

});
router.post('/actualizarkm', (req,res)=>{

    const sql = 'SELECT max( kilometraje ) as kilometraje from kilometraje  WHERE id_vehiculo = ?' ;
    const id = req.body.id_vehiculo
    const km = req.body.km
    connection.query (sql, id, (error, result)=> {
        if(error) throw error;
        if ( result[0].kilometraje >= km){
            res.status(202)
            res.json({message: 'Kilometraje menor!', data:[] });
        }else{
            actualizar(id, km);
        }
    });

    function actualizar (id, km){

        const sql = 'INSERT INTO kilometraje set ?';
        const customerObj = {
            kilometraje: km,
            id_vehiculo: id,
            fecha: fecha()
        }

        connection.query (sql, customerObj, (error, result)=> {
            if(error) {
                throw error;
            }
            const fechaRegistro = fecha()
            const response = {message: 'Actualizado!', data: fechaRegistro}
            res.status(200)
            res.json(response);
        });

    }

    function fecha (){
        let date = new Date()
        let day = date.getDate()
        let month = date.getMonth() + 1
        let year = date.getFullYear()

        if(month < 10 && day < 10){
            return(`${year}-0${month}-0${day}`)
        }if(month < 10 && day > 10){
            return(`${year}-0${month}-${day}`)
        }if(month > 10 && day > 10){
            return(`${year}-${month}-${day}`)
        }if(month > 10 && day < 10){
            return(`${year}-${month}-0${day}`)
        }
        
    }

});

router.post('/actualizarst', (req,res)=>{

    const sql = 'SELECT max( fecha ) as fecha from operatividad WHERE placa = ?' ;
    const placa = req.body.placa
    connection.query (sql, placa, (error, result)=> {
        if(error) throw error;
        if ( result[0].fecha === null || result[0].fecha <= req.body.fecha ){
            insertars ()
        }else{
            res.status(202)
            res.json({message: 'Fecha menor!', data:[] });
        }
    });

    function insertars (){

        const sql = 'INSERT INTO operatividad set ?';
        const customerObj = {
            id_status: req.body.id_status,
            placa: req.body.placa,
            fecha: req.body.fecha,
            detalles: req.body.detalle
        }

        connection.query (sql, customerObj, (error, result)=> {
            if(error) {
                throw error;
            }
            console.log('GUARDO NUEVO STATUS ' )
            actualizar(result.insertId)
        });

        function actualizar (id_nuevo_status){
            const fecha = moment (req.body.fecha)
            const fechanterior = moment(req.body.fechanterior)
            const dias = fecha.diff(fechanterior, 'days')
            //console.log('calculo' + diasc)
            const id = req.body.id_status
            //console.log('id del historial' + id)
            
            const sql2 = `UPDATE maestro_vehiculo m, operatividad o 
            SET o.dias = '${dias}' , o.id_sucesor = '${id_nuevo_status}',   m.id_operatividad = '${id_nuevo_status}'
            WHERE m.placa = '${req.body.placa}'
            AND o.id = '${req.body.id_ultimo_status}' `;
            console.log('consulta' + sql2)
            connection.query (sql2, (error, result)=> {
                if(error) {
                    throw error;
                }
                const response = {message: 'Actualizado!', data: result}
                res.status(200)
                res.json(response);
                console.log('ACTUALIZO NUEVO STATUS ' )
            });         
        }

    }
});

router.post('/addService', (req,res)=>{
   
    guardarMtto();
 
    function guardarMtto (){
        const sql = 'INSERT INTO mantenimiento set ?';

        const customerObj = {
            id_vehiculo: req.body.id_vehiculo,
            status: req.body.status,
            doc_sap: req.body.doc_sap,
            id_tipo: req.body.id_tipo,
            id_kilometro: req.body.id_kilometraje,
            fecha: req.body.fecha,
            fecha_sol: req.body.fecha_sol,
            id_proveedor: req.body.id_proveedor,
            id_status_pago: req.body.id_status_pago
        }

        connection.query (sql, customerObj, (error, result)=> {
            if(error) {
                throw error;
            }
            const response = {message: 'Exito!', data: result[0], doc: result.insertId}
            guardarDetalle(result.insertId);
            res.status(200)
            res.json(response)
        });
    }

    function guardarDetalle (id){
        const sql = 'INSERT INTO detalle_mttos set ?';
        const customerObj = {
            id_mtto: id,
            id_servicio: req.body.id_servicio,
            observacion: req.body.observacion,
            precio: req.body.precio
        }

        connection.query (sql, customerObj, (error, result)=> {
            if(error) {
                throw error;
            }
            const response = {message: 'Exito2!', data: result[0]}
        });
    }

});

router.get('/getServices/',(req,res)=>{
    const desde = req.query.desde
    const hasta = req.query.hasta
    const sql = `SELECT m . * , d . * , p . * , s . * , t . * , k.kilometraje , v.*, tc.carga, sm.status_mtto,sp.status_pago,
    DATE_FORMAT(m.fecha,"%d-%m-%Y") as fecha,DATE_FORMAT(m.fecha_sol,"%d-%m-%Y") as fecha_soli
     FROM mantenimiento m 
     INNER JOIN detalle_mttos d 
     INNER JOIN maestro_servicio s
     INNER JOIN maestro_proveedores p
     INNER JOIN tipo_mtto t
     INNER JOIN kilometraje k
     INNER JOIN maestro_vehiculo v
     INNER JOIN tipos_de_carga tc
     INNER JOIN status_mtto sm
     INNER JOIN status_pago sp
     ON m.id=d.id_mtto
     AND d.id_servicio=s.id
     AND m.id_proveedor=p.id
     AND m.id_tipo=t.id
     AND m.id_kilometro=k.id
     AND m.id_vehiculo = v.id
     AND v.id_tipo_carga = tc.id
     and m.status = sm.id
     AND m.id_status_pago = sp.id
     WHERE m.fecha_sol BETWEEN '${desde}' AND '${hasta}'
     ORDER BY m.fecha_sol`;
    connection.query(sql,(error, result)=>{
        if(error) {
            const response = {message: 'Error!', data: {error} }
            res.status(500)
            res.json(response)
        } 
        if (result.length>0){
            const response = {message: 'Exito!', data: result}
            res.status(200)
            res.json(response);
        }else {
            res.status(204)
            res.json({message: 'sin resultados!', data:[] });
        }
     });
});

router.get('/getHistorico/',(req,res)=>{
    const desde = req.query.desde
    const hasta = req.query.hasta
    const placa = req.query.placa
     const sql = `SELECT o.*, s.*, m.*, DATE_FORMAT(o.fecha,"%d-%m-%Y") as fecha
     FROM operatividad o 
     INNER JOIN status s
     INNER JOIN maestro_vehiculo m
     ON o.id_status = s.id
     AND o.placa = m.placa
     WHERE o.placa = '${placa}'
     AND o.fecha BETWEEN '${desde}' AND '${hasta}'
     GROUP BY o.fecha , s.status`
    connection.query(sql,(error, result)=>{
        if(error) {
            const response = {message: 'Error!', data: {error} }
            res.status(500)
            res.json(response)
        } 
        if (result.length>0){
            const response = {message: 'Exito!', data: result}
            res.status(200)
            res.json(response);
        }else {
            res.status(204)
            res.json({message: 'sin resultados!', data:[] });
        }
     });
});

router.get('/getMtto/:nro',(req,res)=>{
    const {nro} = req.params
    const sql = `SELECT m . * , d . * , p . * , s . * , t . * , k.kilometraje , v.*, sp.status_pago, sp.id as id_p, sm.status_mtto, p.id as id_pro, m.fecha, m.fecha_sol,
     DATE_FORMAT(m.fecha,"%d-%m-%Y") as fecha_f,DATE_FORMAT(m.fecha_sol,"%d-%m-%Y") as fecha_sol_f
     FROM mantenimiento m 
     INNER JOIN detalle_mttos d 
     INNER JOIN maestro_servicio s
     INNER JOIN maestro_proveedores p
     INNER JOIN tipo_mtto t
     INNER JOIN kilometraje k
     INNER JOIN maestro_vehiculo v
     INNER JOIN status_pago sp
     INNER JOIN status_mtto sm
     ON m.id=d.id_mtto
     AND d.id_servicio=s.id
     AND m.id_proveedor=p.id
     AND m.id_tipo=t.id
     AND m.id_kilometro=k.id
     AND m.id_vehiculo = v.id
     AND m.id_status_pago = sp.id
     AND m.status = sm.id
     WHERE m.id = '${nro}'`;
    connection.query(sql,(error, result)=>{
        if(error) {
            const response = {message: 'Error!', data: {error} }
            res.status(500)
            res.json(response)
        } 
        if (result.length>0){
            const response = {message: 'Exito!', data: result[0]}
            res.status(200)
            res.json(response);
        }else {
            res.status(204)
            res.json({message: 'sin resultados!', data:[] });
        }
     });
});

router.put('/actualizarmtto', (req,res)=>{

    const fecha = req.body.fecha
    // console.log("fecha recibida : " + fecha)
    var statusm = req.body.id_status_mtto
    // console.log("estatus recibido : " + statusm)
    if (fecha !== ""){ // status 1 no realizado y 2 realizado
        statusm = 2
       // console.log("entro por fecha llena ")
    }
    if(fecha === "" && statusm === 3 ){
        statusm = 3
        console.log("entro fecha vacio y status en tratamiento  ")
    }
    if (fecha === "" && statusm === 2 ){
        statusm = 1
        // console.log("entro fecha vacio y status realizado  ")
    }
    const actualizar = req.body.actualizak
    

    if (actualizar === '1' ){// 1 si actualizara km
        console.log("paso : ")
        const sql = `UPDATE mantenimiento set ? where id = '${req.body.id_mtto}' `;
        const customerObj = {
            fecha: req.body.fecha,
            id_status_pago: req.body.id_status_pago,
            status: statusm,
            id_kilometro: req.body.id_km,
            id_proveedor: req.body.id_proveedor
        }
        const sql2 = `UPDATE detalle_mttos set ? where id_mtto = '${req.body.id_mtto}' AND id_servicio = '${req.body.id_servicio}'  `;
        const customerObj2 = {
            precio: req.body.precio,
            observacion: req.body.observacion
        }

        connection.query (sql2, customerObj2, (error, result)=> {
            if(error) {
                throw error;
            }
            connection.query (sql, customerObj, (error, result)=> {
                if(error) {
                    throw error;
                }
                const response = {message: 'Actualizado!', data: result}
                res.status(200)
                res.json(response);
            });
        });

    }else { // no actualizara km
        const sql = `UPDATE mantenimiento set ?  where id = '${req.body.id_mtto}'`;
        const customerObj = {
            fecha: req.body.fecha,
            id_status_pago: req.body.id_status_pago,
            status: statusm,
            id_proveedor: req.body.id_proveedor
        }
        const sql2 = `UPDATE detalle_mttos set ? where id_mtto = '${req.body.id_mtto}' AND id_servicio = '${req.body.id_servicio}'`;
        const customerObj2 = {
            precio: req.body.precio,
            observacion: req.body.observacion
        }

        connection.query (sql2, customerObj2, (error, result)=> {
            if(error) {
                throw error;
            }
            connection.query (sql, customerObj, (error, result)=> {
                if(error) {
                    throw error;
                }
                const response = {message: 'Actualizado!', data: result}
                res.status(200)
                res.json(response);
            });
        })
    }
});


module.exports = router;