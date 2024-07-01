const { Router } = require("express");
const { CartProduct } = require("../models");
const router = new Router();

router.get('/', async (req, res) => {
  try {
    const orders = await CartProduct.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (e) {
    next(e)
  }
});

router.patch("/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const quantity = parseInt(req.body.quantity);
  
    try {
      
      const [nbUpdated, cartProducts] = await CartProduct.update({ quantity: quantity }, {
        where: {
          id: id,
        },
        returning: true,
      });
  
      nbUpdated === 1 ? res.json(cartProducts[0]) : res.sendStatus(404);
    } catch (e) {
      next(e)
    }
  });
  
  router.delete("/:id", async (req, res) => {
    const id = parseInt(req.params.id);
  
    try {
      const deleted = await CartProduct.destroy({ where: { id: id } });
      deleted ? res.sendStatus(204) : res.sendStatus(404);
    } catch (e) {
      next(e);
    }
  });
  

  module.exports = router;
