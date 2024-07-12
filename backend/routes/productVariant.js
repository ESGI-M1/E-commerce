const { Router } = require("express");
const { Op } = require("sequelize");
const { ProductVariant, ProductVariantDetail, VariantOption, VariantValue } = require("../models");
const checkRole = require("../middlewares/checkRole");

const router = new Router();

router.get("/", async (req, res) => {
    const productVariants = await ProductVariant.findAll({
        where: req.query,
    });

    res.json(productVariants);
});

router.get("/search", async (req, res) => {
    try{
        const { q } = req.query;
        const productVariants = await ProductVariant.findAll({
            where: {
                name: {
                    [Op.iLike]: `%${q}%`,
                },
            },
        });

        res.json(productVariants);
    } catch (e) {
        next(e);
    }

});

router.post("/", checkRole({ roles: "admin" }), async (req, res, next) => {
    try {
        const { ...productVariantData } = req.body;
        const productVariant = await ProductVariant.create(productVariantData);
        res.status(201).json(productVariant);
    } catch (e) {
        next(e);
    }
});

router.patch("/:id/reset", checkRole({ roles: "admin" }), async (req, res, next) => {
    try {
        const productVariant = await ProductVariant.findByPk(parseInt(req.params.id));
        if (productVariant) {
            await productVariant.update({
                name: null,
                reference: null,
                price: null,
            });
            res.json(productVariant);
        } else {
            res.sendStatus(404);
        }
    } catch (e) {
        next(e);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const productId = parseInt(req.params.id);

        const productVariants = await ProductVariant.findAll({
            where: {
                productId: productId,
            },
            include: {
                model: ProductVariantDetail,
                as: "productVariantDetails",
                include: [
                    {
                        model: VariantOption,
                        as: "variantOption",
                    },
                    {
                        model: VariantValue,
                        as: "variantValue",
                    },
                ],
            },
        });

        if (productVariants ? res.json(productVariants) : res.sendStatus(404));
    } catch (e) {
        next(e);
    }
});

router.patch("/:id", checkRole({ roles: "admin" }), async (req, res, next) => {
    try {
        const { ...productVariantData } = req.body;
        const productVariant = await ProductVariant.findByPk(parseInt(req.params.id));

        if (productVariant) {
            await productVariant.update(productVariantData);
            res.json(productVariant);
        } else {
            res.sendStatus(404);
        }
    } catch (e) {
        next(e);
    }
});

router.delete("/:id", checkRole({ roles: "admin" }), async (req, res, next) => {
    try {
        const nbDeleted = await ProductVariant.destroy({
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
        const { ...productVariantData } = req.body;
        await ProductVariant.destroy({
            where: {
                id: parseInt(req.params.id),
            },
        });

        const productVariant = await ProductVariant.create(productVariantData);
        res.status(200).json(productVariant);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
