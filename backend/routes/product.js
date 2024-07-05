const { Router } = require("express");
const { Op } = require("sequelize");
const { Product, Category, Image, User, AlerteUser, Alerte } = require("../models");
const mailer = require('../services/mailer');

const router = new Router();

router.get("/", async (req, res) => {
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
            },
        });
        res.json(products);
        
    } catch (error) {
        console.error("Error fetching products by search query:", error);
        res.status(500).json({ error: "Failed to fetch products by search query" });
    }

});

router.get("/:id/images", async (req, res) => {
    try {
        const productId = req.params.id;
        const images = await Image.findAll({ where: { productId } });
        res.json(images);
    } catch (error) {
        console.error("Error fetching images for product:", error);
        res.status(500).json({ error: "Failed to fetch images for product" });
    }
});

router.post("/", async (req, res, next) => {
    try {
        const { ...productData } = req.body;
        const product = await Product.create(productData);
        const idAlert = await Alerte.findOne({
            where: {
                name: 'new_product'
            }
        });
        if (idAlert) {
            const userToPrevent = await AlerteUser.findAll({
                where: {
                    alerte_id: idAlert.id
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
        console.log(`Fetching product with ID: ${productId}`);
        
        const product = await Product.findByPk(productId, {
            include: [
                { model: Category, required: false },
                { model: Image, required: false }
            ]
        });

        if (product ? res.json(product) : res.sendStatus(404));
    } catch (e) {
        console.error('Error fetching product by ID:', e);
        next(e);
    }
});



router.patch("/:id", async (req, res, next) => {
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
                const idAlert = await Alerte.findOne({
                    where: {
                        name: 'change_product_price'
                    }
                });
                if (idAlert) {
                    const userToPrevent = await AlerteUser.findAll({
                        where: {
                            alerte_id: idAlert.id
                        }
                    });
                    if (userToPrevent) {
                        for (let i=0; i < userToPrevent.length; i++) {
                            const user = await User.findByPk(userToPrevent[i].user_id);
                            mailer.sendPriceChangeNotification(user, product);
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

router.delete("/:id", async (req, res, next) => {
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

router.put("/:id", async (req, res, next) => {
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
