const { Router } = require("express");
const { Product, Category, Image } = require("../models");
const mailer = require('../services/mailer');

const router = new Router();

router.get("/", async (req, res) => {
    const products = await Product.findAll({
        where: req.query,
        include: [Category, Image],
    });
    try {
        mailer.envoiTest();
    } catch (e) {
        console.log("Erreur lors de l'envoi du mail : " + e);
    }


    res.json(products);
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
        const { Categories, ...productData } = req.body;
        const product = await Product.create(productData);

        if (Categories && Categories.length) {
            const categories = await Category.findAll({ where: { id: Categories } });
            await product.setCategories(categories);
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

        if (product) {
            console.log('Product found:', product);
            res.json(product);
        } else {
            console.log('Product not found');
            res.sendStatus(404);
        }
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
            await product.update(productData);

            if (Categories && Categories.length) {
                const categories = await Category.findAll({ where: { id: Categories } });
                await product.setCategories(categories);
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
        if (nbDeleted === 1) {
            res.sendStatus(204);
        } else {
            res.sendStatus(404);
        }
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
