const express = require ('express');
const mysql = require ('mysql');

const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3050;

const app = express();

const cors = require('cors');

app.use(bodyParser.json());

app.use(cors());

//mysql 
const connection = mysql.createConnection({
    host: 'localhost',
    user : 'root',
    password : '',
    database: 'transporte'
});

// Route endpoints
app.get('/',(req,res)=> {
    res.send('welcome to my API!');
});

// all customers 
app.get('/vehiculos',(req,res)=>{
    const sql = 'SELECT @numero:=@numero + 1 AS posicion, v.* , m.* FROM maestro_vehiculo v INNER JOIN marca m ON v.id_marca = m.id, (SELECT @numero:= 0) AS s;';
    connection.query(sql,(error, results)=>{
       if(error) throw error;
       if (results.length>0){
           res.json(results);
       }else {
           res.send ('Not results');
       }
    });
});

app.get('/vehiculos/:id',(req,res)=>{
    const {id} = req.params
    const sql = `SELECT * FROM maestro_vehiculo v INNER JOIN marca m INNER JOIN status s INNER JOIN tipos_de_carga t ON v.id_marca = m.id AND v.id_tipo_carga=t.id AND v.id_status = s.id WHERE placa = '${id}'`;
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

app.get('/kilometraje/:id',(req,res)=>{
    const {id} = req.params
    const sql = `SELECT k.kilometraje AS km, k.fecha, v.* ,v.id as id_v , m.* , s.*,t.* FROM maestro_vehiculo v INNER JOIN kilometraje k INNER JOIN marca m INNER JOIN status s INNER JOIN tipos_de_carga t ON v.id_marca = m.id AND v.id_tipo_carga=t.id AND v.id_status = s.id and k.id_vehiculo=v.id WHERE PLACA = '${id}' GROUP BY k.kilometraje order by k.kilometraje desc limit 1`;
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

app.post('/add', (req,res)=>{

    const sql = 'SELECT * FROM maestro_vehiculo WHERE PLACA = ?';
    const placa = req.body.placa
    connection.query (sql, placa, (error, result)=> {
        if(error) throw error;
        if (result.length>0){
            res.status(202)
            res.json({message: 'Placa existe!', data:[] });
        }else{
            guardar();
        }
    });


    function guardar (){

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
            id_status: req.body.id_status
        }

        connection.query (sql, customerObj, (error, result)=> {
            if(error) {
                throw error;
            }
            const response = {message: 'Exito!', data: result[0]}
            res.status(200)
            res.json(response);
            inicializar(customerObj.placa);
        });

    }

    function inicializar (placa){
        console.log('el objeto con la placa : '+ placa)
        const sql = `SELECT id from maestro_vehiculo WHERE placa ='${placa}' ` ;
        connection.query (sql, (error, result)=> {
            if(error) throw error;
            if ( result[0].id !== null){
                insertarKm(result[0].id);
            }
        });


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
                const response = {message: 'Actualizado!', data: result[0]}
            });
        }

    }

    function fecha (){
        let date = new Date()
        let day = date.getDate()
        let month = date.getMonth() + 1
        let year = date.getFullYear()

        if(month < 10){
        return(`${day}-0${month}-${year}`)
        }else{
        return(`${day}-${month}-${year}`)
        }
    }
});

app.put('/update/:id', (req, res)=>{
   const {id} = req.params;
   const {name, city} = req.body;
   const sql = `UPDATE customers SET name = '${name}', city = '${city}' where id='${id}' `;

   connection.query (sql, error=> {
    if(error) throw error;
    res.send('Customer updated!');
    });

});

app.delete('/delete/:id', (req, res)=>{
    const {id}= req.params;
    const sql = `DELETE FROM customers WHERE id= '${id}' `;

    connection.query (sql, error=> {
        if(error) throw error;
        res.send('Customer Deleted!');
    });
    

});

app.get('/tipos_carga',(req,res)=>{
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

app.get('/marcas',(req,res)=>{
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

app.post('/login', (req,res)=>{
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
app.post('/actualizarkm', (req,res)=>{

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

        if(month < 10){
        return(`${day}-0${month}-${year}`)
        }else{
        return(`${day}-${month}-${year}`)
        }
    }

});

// check connect 
connection.connect(error => {
    if(error) throw error ;
    console.log('Database server running!')
});

// INICIANDO EL SERVIDOR
app.listen(PORT, () => console.log(`Server running on port app afuera ${PORT}`));
