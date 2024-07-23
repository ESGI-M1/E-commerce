const { Router } = require("express");
const router = new Router();
const { Attribute, AttributeValue } = require("../models");
const checkRole = require("../middlewares/checkRole");

router.get("/", async (req, res, next) => {
    try {
        const attribute = await Attribute.findAll(
            {
                where: req.query,
                include: [{
                    model: AttributeValue,
                    as: 'values'
                }]
            }
        );
        res.json(attribute);
    } catch (e) {
        next(e);
    }
});

router.post("/", checkRole({ roles: "admin" }), async (req, res, next) => {
    try {
        const attribute = await Attribute.create(req.body, {
            include: [{
                model: AttributeValue,
                as: 'values'
            }]
        });

        res.status(201).json(attribute);
    } catch (e) {
        next(e);
    }
});

router.patch("/:id", checkRole({ roles: "admin" }), async (req, res, next) => {
    try {
        const attribute = await Attribute.findByPk(parseInt(req.params.id));
        if (!attribute) {
            return res.sendStatus(404);
        }

        await attribute.update(req.body, {
            include: [{
                model: AttributeValue,
                as: 'values'
            }]
        });

        if (req.body.values) {
            for (const value of req.body.values) {
                if (value.id) {
                    await AttributeValue.update(value, { where: { id: value.id } });
                } else {
                    await AttributeValue.create({ ...value, attributeId: attribute.id });
                }
            }
        }

        const updatedAttribute = await Attribute.findByPk(attribute.id, {
            include: [{
                model: AttributeValue,
                as: 'values'
            }]
        });

        res.json(updatedAttribute);
    } catch (e) {
        next(e);
    }
});

router.put("/:id", checkRole({ roles: "admin" }), async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const nbDeleted = await Attribute.destroy({
            where: {
                id: id,
            },
        });

        const attribute = await Attribute.create(req.body, {
            include: [{
                model: AttributeValue,
                as: 'values'
            }]
        });

        res.status(nbDeleted === 1 ? 200 : 201).json(attribute);
    } catch (e) {
        next(e);
    }
});

router.delete("/:id", checkRole({ roles: "admin" }), async (req, res, next) => {
    try {
        const nbDeleted = await Attribute.destroy({
            where: {
                id: parseInt(req.params.id),
            },
        });
        if (nbDeleted === 1 ? res.sendStatus(204) : res.sendStatus(404));
    } catch (e) {
        next(e);
    }
});

module.exports = router;
