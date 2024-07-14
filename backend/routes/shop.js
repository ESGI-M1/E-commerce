const { Router } = require("express");
const router = new Router();
const { Shop } = require("../models");
const checkRole = require("../middlewares/checkRole");

router.get("/", async (req, res, next) => {
    try {
        const shop = await Shop.findOne();
        res.json(shop);
    } catch (e) {
        next(e);
    }
});

router.post("/", checkRole({ roles: "admin" }), async (req, res, next) => {
    try {
        const shop = await Shop.create(req.body);
        res.statut(201).json(shop);
    } catch (e) {
        next(e);
    }
});

router.patch("/:id", checkRole({ roles: "admin" }), async (req, res, next) => {
    try {
        const shop = await Shop.findByPk(parseInt(req.params.id));
        const updatedShop = await shop.update(req.body);
        updatedShop ? res.json(updatedShop) : res.sendStatus(404);
    } catch (e) {
        next(e);
    }
});

router.put("/:id", checkRole({ roles: "admin" }), async (req, res, next) => {
    try {
        const nbDeleted = await Shop.destroy({
            where: {
                id: parseInt(req.params.id),
            },
        });
        const shop = await Shop.create(req.body);
        res.status(nbDeleted === 1 ? 200 : 201).json(shop);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
