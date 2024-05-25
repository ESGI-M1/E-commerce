const { Router } = require("express");
const { Product, Category, Image } = require("../models");
const router = new Router();

router.get("/", async (req, res) => {
  const products = await Product.findAll({
    where: req.query,
    include: [Category, Image],
  });
  res.json(products);
});

router.post("/", async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findByPk(parseInt(req.params.id));
    if (Product) {
      res.json(product);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    next(e);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const [nbUpdated, products] = await Product.update(req.body, {
      where: {
        id: parseInt(req.params.id),
      },
      returning: true,
    });
    if (nbUpdated === 1) {
      res.json(products[0]);
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
    const nbDeleted = await Product.destroy({
      where: {
        id: parseInt(req.params.id),
      },
    });
    const product = await Product.create(req.body);
    res.status(nbDeleted ? 200 : 201).json(product);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
