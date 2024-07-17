const { Router } = require("express");
const { Op } = require("sequelize");
const { Product, Category, Image, User, AlertUserProduct, AlertUser, Alert } = require("../models");
const mailer = require('../services/mailer');
const checkRole = require("../middlewares/checkRole");

const router = new Router();

router.get("/", async (req, res) => {

    req.query.active = true;

    const products = await Product.findAll({
        where: req.query,
        include: [Category, Image],
    });

    res.json(products);
});

router.get("/admin", checkRole({ roles: "admin" }), async (req, res) => {

    const products = await Product.findAll({
        where: req.query,
        include: [Category, Image],
    });

    res.json(products);
});

router.get("/search", async (req, res) => {
    try{
        const { q } = req.query;
        const products = await Product.findAll({
            where: {
                name: {
                    [Op.iLike]: `%${q}%`,
                },
                active: true,
            },
        });
        res.json(products);
        
    } catch (e) {
        next(e);
    }

});

router.post("/", checkRole({ roles: "admin" }), async (req, res, next) => {
    try {
        const { ...productData } = req.body;
        const product = await Product.create(productData);
        const idAlert = await Alert.findOne({
            where: {
                name: 'new_product'
            }
        });
        if (idAlert) {
            const userToPrevent = await AlertUser.findAll({
                where: {
                    alert_id: idAlert.id
                }
            });
            if (userToPrevent) {
                for (let i=0; i < userToPrevent.length; i++) {
                    const user = await User.findByPk(userToPrevent[i].user_id);
                    mailer.sendNewProductNotification(user, product);
                }
            }

        }

        res.status(201).json(product);
    } catch (e) {
        next(e);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const productId = parseInt(req.params.id);
        
        const product = await Product.findByPk(productId, {
            include: [
                { model: Category },
                { model: Image }
            ]
        });

        if (product ? res.json(product) : res.sendStatus(404));
    } catch (e) {
        next(e);
    }
});

router.post("/", checkRole({ roles: "admin" }), async (req, res, next) => {
    try {
        const { ...productData } = req.body;
        const product = await Product.create(productData);

        res.status(201).json(product);
    } catch (e) {
        next(e);
    }
});

router.patch("/:id", checkRole({ roles: "admin" }), async (req, res, next) => {
    try {
        const { Categories, ...productData } = req.body;
        const product = await Product.findByPk(parseInt(req.params.id));
        if (product) {

            if (Categories && Categories.length) {
                const categories = await Category.findAll({ where: { id: Categories } });
                await product.setCategories(categories);
            }
            if (parseInt(product.price) !== productData.price) {
                await product.update(productData);
                const idAlertChangePrice = await Alert.findOne({
                    where: {
                        name: 'change_product_price'
                    }
                });

                if (idAlertChangePrice) {
                    const userAlerts = await AlertUser.findAll({
                        where: {
                            alert_id: idAlertChangePrice.id
                        }
                    });
                    const userAlertProducts = await AlertUserProduct.findAll({
                        where: {
                            productId: product.id
                        }
                    });
                    for (let i= 0; i < userAlertProducts.length; i++) {
                        for (let j = 0; j < userAlerts.length; j++) {
                            if (userAlertProducts[i].alertUserId === userAlerts[j].id) {
                                const user = await User.findByPk(userAlerts[j].user_id);
                                mailer.sendPriceChangeNotification(user, product);
                            }
                        }
                    }
                }
            } else {
                await product.update(productData);
            }

            res.json(product);
        } else {
            res.sendStatus(404);
        }
    } catch (e) {
        next(e);
    }
});

router.delete("/:id", checkRole({ roles: "admin" }), async (req, res, next) => {
    try {
        const nbDeleted = await Product.destroy({
            where: {
                id: parseInt(req.params.id),
            },
        });
        if (nbDeleted === 1 ? res.sendStatus(204) : res.sendStatus(404));
    } catch (e) {
        next(e);
    }
});

router.put("/:id", checkRole({ roles: "admin" }), async (req, res, next) => {
    try {
        const { Categories, ...productData } = req.body;
        await Product.destroy({
            where: {
                id: parseInt(req.params.id),
            },
        });
        const product = await Product.create(productData);

        if (Categories && Categories.length) {
            const categories = await Category.findAll({ where: { id: Categories } });
            await product.setCategories(categories);
        }

        res.status(200).json(product);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
