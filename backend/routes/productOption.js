const { Router } = require("express");
const { ProductOption } = require("../models");
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
        const { ...productOptionData } = req.body;

        const productOption = await ProductOption.create(
            productOptionData
        );

        res.status(201).json(productOption);
    } catch (e) {
        next(e);
    }
});