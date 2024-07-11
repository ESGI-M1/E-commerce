const { Router } = require("express");
const checkRole = require("../middlewares/checkRole");

const router = new Router();

router.get("/orders", checkRole({ roles: "admin" }), async (req, res) => {


    const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July']
    const data= [65, 59, 80, 81, 56, 55, 40]

    res.send({ labels, data });
});

module.exports = router;

