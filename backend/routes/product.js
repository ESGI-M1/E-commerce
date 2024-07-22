const { Router } = require("express");
const { Category, Image, Product, ProductVariant, User, AlertUser, Alert, AttributeValue, Attribute } = require("../models");
const ProductMongo = require("../mongo/product");
const mailer = require('../services/mailer');
const checkRole = require("../middlewares/checkRole");

const router = new Router();

router.get("/", async (req, res) => {

    try {
        const products = await Product.findAll({
            where: {
                active: true,
                ...req.query,
            },
            include: [
                Category,
                {
                    model: ProductVariant,
                    as: 'variants',
                    required: false,
                    where: {
                        active: true,
                        default: true,
                    },
                    include: [
                        {
                            model: Image,
                            as: 'images',
                        },
                        {
                            model: AttributeValue,
                            as: 'attributeValues',
                            include: {
                                model: Attribute,
                                as: 'attribute',
                            },
                        },
                    ],
                },
            ],
        });

        res.json(products);
    } catch (error) {
        console.error("Error fetching products: ", error);
        res.status(500).json({ error: "An error occurred while fetching products." });
    }
});

router.get("/admin", checkRole({ roles: "admin" }), async (req, res, next) => {

    try {
        const products = await Product.findAll({
            where: req.query,
            include: {
                model: Category,
                required: false,
            },
        });
        res.json(products);
    } catch (e) {
        next(e);
    }

});

router.get("/:id(\\d+)", async (req, res, next) => {
    try {
        const productId = parseInt(req.params.id);
        
        const product = await Product.findByPk(productId, {
            include: [
                Category,
                {
                    model: ProductVariant,
                    as: 'variants',
                    required: false,
                    include: [
                        {
                            model: Image,
                            as: "images",
                        },
                        {
                            model: AttributeValue,
                            as: "attributeValues",
                            include: {
                                model: Attribute,
                                as: "attribute",
                            },
                        },
                    ],
                },
            ],
        });

        if (product) {
            res.json(product);
        } else {
            res.sendStatus(404);
        }
    } catch (e) {
        next(e);
    }
});

router.get('/search', async (req, res, next) => {
    try {
        const { q, minPrice, maxPrice, category, inStock } = req.query;

        const filter = { active: true };

        if (q) {
            filter.$or = [
                { name: new RegExp(q, 'i') },
                { description: new RegExp(q, 'i') }
            ];
        }

        if (category) {
            filter['Categories.id'] = Number(category);
        }

        const variantFilter = {
            $elemMatch: {
                active: true,
            }
        };

        if (minPrice || maxPrice) {
            variantFilter.$elemMatch.price = {};
            if (minPrice) variantFilter.$elemMatch.price.$gte = Number(minPrice);
            if (maxPrice) variantFilter.$elemMatch.price.$lte = Number(maxPrice);
        }

        if (inStock) {
            variantFilter.$elemMatch.stock = { $gt: 0 };
        }

        filter['variants'] = variantFilter;

        const products = await ProductMongo.find(filter).lean().exec();
        res.json(products);
    } catch (error) {
        console.error('Error:', error);
        next(error);
    }
});


router.post("/", checkRole({ roles: "admin" }), async (req, res, next) => {
    try {
        const { ...productData } = req.body;

        // Product
        const product = await Product.create(productData);

        /*const idAlert = await Alert.findOne({
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
            */

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
                const categoriesIds = Categories.map((category) => category.id);
                await product.setCategories(categoriesIds);
            }
            if (parseInt(product.price) !== productData.price) {
                await product.update(productData);
                const idAlert = await Alert.findOne({
                    where: {
                        name: 'change_product_price'
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
            const categoriesIds = Categories.map((category) => category.id);
            await product.setCategories(categoriesIds);
        }

        res.status(200).json(product);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
