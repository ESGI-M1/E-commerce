const { Router } = require("express");
const { Product, ProductOption, ProductVariant } = require("../models");
const checkRole = require("../middlewares/checkRole");

const router = new Router();

router.get("/", async (req, res, next) => {
    try {
        const query = req.query;

        const result = await ProductOption.findAll({
            where: query,
            attributes: ['ProductId', 'VariantOptionId'],
        });

        if (result ? res.json(result) : res.sendStatus(404));
    } catch (e) {
        next(e);
    }
});

router.post("/", checkRole({ roles: "admin" }), async (req, res, next) => {
    try {
        const { productId, productOptions } = req.body;

        const product = await Product.findByPk(productId);

        if (!product) return res.status(404).send("Product not found");

        if (productOptions && productOptions.length) {
            const variantOptions = await product.setVariantOptions(productOptions);

            const productVariants = await ProductVariant.findAll({
                where: { ProductId: productId },
                include: ProductOption,
            });

            res.status(201).json(variantOptions);
        }
    } catch (e) {
        next(e);
    }
});

module.exports = router;
