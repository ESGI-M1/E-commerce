const { Router } = require("express");
const { CartProduct, Cart } = require("../models");
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
  const id = req.params.id;
  const cartProduct = await CartProduct.findByPk(id);
  const deleted = await cartProduct.destroy();

  if (deleted) {
    const remainingCartProducts = await CartProduct.findAll({ where: { cartId: cartProduct.cartId } });
    if (remainingCartProducts.length === 0) {
      const cart = await Cart.findByPk(cartProduct.cartId);
      if (cart)  await cart.destroy();
  
      return res.sendStatus(204);
    }

  }

  res.sendStatus(404);
});
  

  module.exports = router;
