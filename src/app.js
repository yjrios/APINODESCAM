const express = require ('express');
const cors = require('cors');
const app = express();


const connection = require ('./database') //  "Database server runing"
//const bodyParser = require('body-parser');

// Settings
app.set('port', process.env.PORT || 8000)
//const PORT = process.env.PORT || 3050;

// Middlewares
app.use(express.json());
app.use(cors());

// routes
app.use(require ('./routes/index'))
app.use(require ('./routes/welcome'))


// iniciar servidor backend
app.listen(app.get('port'), () => {
    console.log(`Server running on port app en src ${app.get('port')}`)
});
