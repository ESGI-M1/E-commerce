const { Router } = require("express");
const { Product, Image } = require("../models");
const router = new Router();

router.get("/", async (req, res) => {
    const images = await Image.findAll({
        where: req.query,
        include: [Product],
    });
    res.json(images);
});

router.get("/:id", async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: Image
        });
        if (product ? res.json(product) : res.sendStatus(404));
    } catch (e) {
        next(e);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const image = await Image.create(req.body);
        res.status(201).json(image);
    } catch (e) {
        next(e);
    }
});

router.patch("/:id", async (req, res, next) => {
    try {
        const [nbUpdated, images] = await Image.update(req.body, {
            where: {
                id: parseInt(req.params.id),
            },
            returning: true,
        });
        if (nbUpdated === 1 ? res.json(images[0]) : res.sendStatus(404));
    } catch (e) {
        next(e);
    }
});

router.delete("/:id", async (req, res, next) => {
    try {
        const nbDeleted = await Image.destroy({
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
        const nbDeleted = await Image.destroy({
            where: {
                id: parseInt(req.params.id),
            },
        });
        const image = await Image.create(req.body);
        res.status(nbDeleted ? 200 : 201).json(image);
    } catch (e) {
        next(e);
    }
});

module.exports = router;