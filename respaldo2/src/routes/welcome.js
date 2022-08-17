const { Router } = require ('express');
const router = Router();

router.get('/',(req,res)=> {
    res.json({'title' : 'welcome to my API!'});
});

module.exports = router;