const { Router } = require("express");
const { Product, Category } = require("../models");
const checkRole = require("../middlewares/checkRole");
const router = new Router();

router.get("/", async (req, res) => {

    req.query.active = true;

    const categories = await Category.findAll({
        where: req.query,
        include: [Product],
    });
    res.json(categories);
});

router.post("/", async (req, res, next) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json(category);
    } catch (e) {
        next(e);
    }
});

router.get("/:id(\\d+)", async (req, res, next) => {
    try {
        const category = await Category.findByPk(parseInt(req.params.id),{
            where: { active: true },
        });
        if (category ? res.json(category) : res.sendStatus(404));
    } catch (e) {
        next(e);
    }
});

// TODO ADD DEFAULT VALUE CONFIG IN BACK OFFICE
router.get('/:slug([a-zA-Z0-9-_]+)', async (req, res, next) => {
    
    try {
        const category = await Category.findOne({
            where: { 
                slug: req.params.slug,
            },
            include: [
                {
                    model: Product,
                    where: {
                        active: true,
                    },
                    required: false,
                },
                {
                    model: Category,
                    as: 'parentCategory',
                }
            ],
        });
        if (category ? res.json(category) : res.sendStatus(404));
    } catch (e) {
        next(e);
    }
});

router.patch("/:id", checkRole({ roles: "admin" }), async (req, res, next) => {
    try {
        const { Products } = req.body;
        
        const category = await Category.findByPk(parseInt(req.params.id));
        
        if (category) {

            if (Products && Products.length) {
                const products = await Product.findAll({ where: { id: Products } });
                await category.setProducts(products);
            }
            await category.update(req.body);

            res.json(category);
        } else {
            res.sendStatus(404);
        }
    } catch (e) {
        next(e);
    }
});

router.delete("/:id", checkRole({ roles: "admin" }), async (req, res, next) => {
    try {
        const nbDeleted = await Category.destroy({
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
        const nbDeleted = await Category.destroy({
            where: {
                id: parseInt(req.params.id),
            },
        });
        const category = await Category.create(req.body);
        res.status(nbDeleted ? 200 : 201).json(category);
    } catch (e) {
      next(e);
    }
});

module.exports = router;