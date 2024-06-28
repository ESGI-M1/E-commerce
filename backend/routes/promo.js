const { Router } = require("express");
const router = new Router();
const { PromoCode, Cart } = require('../models');

//get
router.get('/', async (req, res) => {
  try {
    const promos = await PromoCode.findAll({
      order: [['code', 'ASC']]
    });
    res.status(200).json(promos);
  } catch (error) {
    res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des codes promos.' });
  }
});

//add
router.post('/', async (req, res) => {
  const { code, startDate, endDate, discountPercentage } = req.body;

  try {
    const newPromo = await PromoCode.create({ code, startDate, endDate, discountPercentage });
    res.status(201).json(newPromo);
  } catch (error) {
    res.status(500).json({ error: 'Une erreur est survenue lors de la création du code promo.' });
  }
});

//edit
router.put('/:id', async (req, res) => {
  const promoId = req.params.id;
  const { code, startDate, endDate, discountPercentage } = req.body;

  try {
    const promo = await PromoCode.findByPk(promoId);

    if (!promo) {
      return res.status(404).json({ error: 'Ce code promo est introuvable.' });
    }

    await promo.update({ code, startDate, endDate, discountPercentage });
    res.status(200).json(promo);
  } catch (error) {
    res.status(500).json({ error: 'Une erreur est survenue lors de la mise à jour du code promo.' });
  }
});

// Route pour vérifier le code promo
router.post('/:code', async (req, res) => {
  const promoCode = req.params.code;

  try {
    const promo = await PromoCode.findOne({ where: { code: promoCode } });

    if (!promo) {
      return res.status(404).json({ error: 'Ce code promo est invalide ou n\'existe pas.' });
    }

    const currentDate = new Date();
    const startDate = new Date(promo.startDate);
    const endDate = new Date(promo.endDate);

    if (currentDate >= startDate && currentDate <= endDate) {
      const discountPercentage = promo.discountPercentage;
      res.status(200).json({ success: true, discountPercentage });
    } else {
      res.status(400).json({ error: 'Ce code promo est invalide ou a expiré.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Une erreur est survenue lors de la vérification du code promo.' });
  }
});

router.post('/:code/apply', async (req, res) => {
    const promoCode = req.params.code;
    const userId = req.query.userId;
  
    try {
      // Vérifie si le code promo existe et s'il est valide
      const promo = await PromoCode.findOne({ where: { code: promoCode } });
      if (!promo) {
        return res.status(404).json({ error: 'Ce code promo est invalide.' });
      }
  
      const currentDate = new Date();
      const startDate = new Date(promo.startDate);
      const endDate = new Date(promo.endDate);

      const extractDate = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
      };
      
      const currentDateOnly = extractDate(currentDate);
      const startDateOnly = extractDate(startDate);
      const endDateOnly = extractDate(endDate);
  
      if (currentDateOnly >= startDateOnly && currentDateOnly <= endDateOnly) {
        await Cart.update({ promoCodeId: promo.id }, { where: { userId } });
        res.status(200).json({ success: true, discountPercentage: promo.discountPercentage, code: promoCode });
      } else {
        res.status(400).json({ error: 'Ce code promo a expiré.' });
      }
    } catch (error) {
      console.error('Erreur lors de l\'application du code promo :', error);
      res.status(500).json({ error: 'Une erreur est survenue lors de l\'application du code promo.' });
    }
  });

  router.get('/:id/detail', async (req, res, next) => {
  try {
    const promoId = parseInt(req.params.id);

    // Recherche du code promo par son ID avec Sequelize
    const promo = await PromoCode.findByPk(promoId);

    if (promo) {
      res.json(promo);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
