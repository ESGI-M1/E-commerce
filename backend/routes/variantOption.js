const { Router } = require("express");
const { Product, VariantOption, VariantValue } = require("../models");

const router = new Router();

router.get("/", async (req, res) => {
    const variantOptions = await VariantOption.findAll({
        where: req.query,
    });

    res.json(variantOptions);
});

router.get("/:id", async (req, res, next) => {
    try {
        const productId = parseInt(req.params.id);

        const variantOptions = await VariantOption.findAll({
            include: [
                {
                    model: Product,
                    where: { id: productId },
                },
                {
                    model: VariantValue,
                    as: 'variantValues',
                },
            ]
        });

        if (variantOptions ? res.json(variantOptions) : res.sendStatus(404));
    } catch (e) {
        next(e);
    }
});

module.exports = router;
