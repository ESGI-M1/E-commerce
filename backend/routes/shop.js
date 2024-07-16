const { Router } = require("express");
const router = new Router();
const { Shop, Category } = require("../models");
const checkRole = require("../middlewares/checkRole");
const { where } = require("sequelize");

router.get("/", async (req, res, next) => {
    try {
        const shop = await Shop.findOne({
            include: {
                model: Category,
                as: 'mainCategories',
                required: false,
                where: {
                    active: true
                },
                include: {
                    model: Category,
                    as: 'subCategories',
                    required: false,
                    where: {
                        active: true
                    }
                }
            }
        });
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
        const { mainCategories, ...shopData } = req.body;
        const shop = await Shop.findByPk(parseInt(req.params.id));

        if(mainCategories && mainCategories.length > 0) {
            await shop.setMainCategories(mainCategories);
        }

        await shop.update(req.body);

        const updatedShop = await Shop.findByPk(parseInt(req.params.id), {
            include: 'mainCategories',
        });
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
