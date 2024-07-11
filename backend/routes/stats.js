const { Router } = require("express");
const { Order } = require("../models");

const router = new Router();

router.get("/orders", async (req, res) => {

    res.send(await Order.findAll());
});

module.exports = router;

