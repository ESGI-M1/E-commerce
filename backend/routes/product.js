const { Router } = require("express");
const { Op, QueryTypes, where } = require("sequelize");
const { connection, Category, Image, Product, ProductOption, ProductVariant, ProductVariantDetail, User, AlertUser, Alert, VariantOption } = require("../models");
const mailer = require('../services/mailer');
const checkRole = require("../middlewares/checkRole");

const router = new Router();

router.get("/", async (req, res) => {
    req.query.active = true;
    req.query.name = 'Original';

    try {
        const products = await Product.findAll({
            include: [
                Category,
                {
                    model: ProductVariant,
                    as: 'ProductVariants',
                    attributes: ['id', 'name'],
                    where: req.query,
                    include: [
                        {
                            model: Image,
                            as: 'images',
                        },
                        {
                            model: VariantOption,
                            as: 'variantOptions',
                            attributes: ['price'],
                            where: { color: 'white', size: 'M'},
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

router.get("/:id", async (req, res, next) => {
    try {
        const productId = parseInt(req.params.id);
        
        const product = await Product.findByPk(productId, {
            include: [
                { model: Category },
                {
                    model: ProductVariant,
                    as: 'ProductVariants', // Assurez-vous d'utiliser l'alias correct ici
                    include: [
                        { model: Image },
                        { model: VariantOption, as: 'variantOptions' } // Assurez-vous d'utiliser l'alias correct ici
                    ]
                }
            ]
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
  
  

router.get("/admin", checkRole({ roles: "admin" }), async (req, res) => {

    const products = await Product.findAll({
        where: req.query,
        include: [Category, Image],
        order: [
            ['name', 'ASC'],
            ['reference', 'ASC'],
            ['price', 'ASC']
        ]
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

        // Product
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

        // Product Variant
        const productVariant = await ProductVariant.create({
            productId: product.id,
            stockQuantity: 0,
            active: true,
        });

        // Product Variant Detail
        const productVariantDetail = await ProductVariantDetail.create({
            productVariantId: productVariant.id,
        });

        res.status(201).json(product);
    } catch (e) {
        next(e);
    }
});

router.post("/:id/options", checkRole({ roles: "admin" }), async (req, res, next) => {
    try {
        const { options } = req.body;
        const productId = parseInt(req.params.id);

        await connection.query(
            `INSERT INTO "ProductOptions" ("ProductId", "VariantOptionId", "createdAt", "updatedAt") VALUES ${options.map(option => `(${productId}, ${option}, NOW(), NOW())`).join(",")}`,
            { type: QueryTypes.INSERT }
        );

        res.sendStatus(201);
    } catch (e) {
        next(e);
    }
});

router.get("/:id/options", async (req, res, next) => {
    try {
        const productId = parseInt(req.params.id);

        const result = await ProductOption.findAll({
            where: { ProductId: productId },
            attributes: ['ProductId', 'VariantOptionId'],
        });

        if (result ? res.json(result) : res.sendStatus(404));
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
            const categories = await Category.findAll({ where: { id: Categories } });
            await product.setCategories(categories);
        }

        res.status(200).json(product);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
