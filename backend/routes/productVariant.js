const { Router } = require("express");
const { Op } = require("sequelize");
const { ProductVariant, Image, Attribute, AttributeValue } = require("../models");
const checkRole = require("../middlewares/checkRole");

const router = new Router();

router.get("/:id", checkRole({ roles: "admin" }), async (req, res, next) => {
    try {
        const productId = parseInt(req.params.id);

        const productVariants = await ProductVariant.findByPk(productId, {
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
        });

        if (productVariants ? res.json(productVariants) : res.sendStatus(404));
    } catch (e) {
        next(e);
    }
});

router.post("/", checkRole({ roles: "admin" }), async (req, res, next) => {
    try {
        const { attributeValues, ...productVariantData } = req.body;
        
        const productVariant = await ProductVariant.create(productVariantData);

        if (attributeValues && attributeValues.length) {
            const attributeValuesIds = attributeValues.map((attributeValue) => attributeValue.id);
            await productVariant.setAttributeValues(attributeValuesIds);
        }

        await productVariant.reload({
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
        });

        res.status(201).json(productVariant);
    } catch (e) {
        next(e);
    }
});

router.post("/set-default/:id", checkRole({ roles: "admin" }), async (req, res, next) => {
    try {
        const productVariantId = parseInt(req.params.id);

        const productVariant = await ProductVariant.findByPk(productVariantId);

        if (!productVariant) {
            return res.sendStatus(404);
        }

        await ProductVariant.update(
            { default: false },
            { where: { productId: productVariant.productId, default: true } }
        );

        await productVariant.update({ default: true });

        res.sendStatus(200);
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
        const { attributeValues, ...productVariantData } = req.body;
        await ProductVariant.destroy({
            where: {
                id: parseInt(req.params.id),
            },
        });

        const productVariant = await ProductVariant.create(productVariantData);

        if (attributeValues && attributeValues.length) {
            const attributeValuesIds = attributeValues.map((attributeValue) => attributeValue.id);
            await productVariant.setAttributeValues(attributeValuesIds);
        }

        await productVariant.reload({
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
        });

        res.status(200).json(productVariant);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
