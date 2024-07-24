const { Router } = require("express");
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { ProductVariant, Image } = require("../models");
const router = new Router();
const checkRole = require("../middlewares/checkRole");

// Configuration de Multer pour gérer le téléchargement de fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads/images');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const filename = `${req.body.productVariantId}-${file.originalname}`;
        cb(null, filename);
    }
});

const upload = multer({ storage });

// Route pour accéder au fichier image
router.get("/variant/:id", async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const image = await Image.findByPk(id);

        if (!image) return res.sendStatus(404);

        const productVariant = await ProductVariant.findByPk(image.productVariantId);

        if (!productVariant) return res.sendStatus(404);

        if (!productVariant.active) return res.sendStatus(403);

        const filePath = path.join(__dirname, '../uploads/images', image.fileName);
        fs.existsSync(filePath) ? res.sendFile(filePath) : res.sendStatus(404);
    } catch (e) {
        next(e);
    }
});

// Route pour uploader une nouvelle image
router.post("/", upload.single('image'), checkRole({ roles: "admin" }), async (req, res, next) => {
    try {
        const { description, productVariantId } = req.body;
        const file = req.file;

        if (!file) return res.status(400).send('No file uploaded.');

        const productVariant = await ProductVariant.findByPk(productVariantId);

        if (!productVariant) return res.status(404).send('Product variant not found.');

        const image = await Image.create({
            description,
            fileName: `${productVariant.id}-${file.originalname}`,
            productVariantId: productVariant.id
        });

        res.status(201).json(image);
    } catch (e) {
        next(e);
    }
});

// Route pour mettre à jour une image
router.patch("/:id", upload.single('image'), checkRole({ roles: "admin" }), async (req, res, next) => {
    try {
        const image = await Image.findByPk(req.params.id);
        if (!image) return res.status(404).send('Image not found.');

        // Supprimer le fichier précédent
        fs.unlinkSync(path.join(__dirname, '../uploads/images', image.fileName));

        const { description, productVariantId } = req.body;
        const file = req.file;

        if (file) {
            const productVariant = await ProductVariant.findByPk(productVariantId);
            if (!productVariant) return res.status(404).send('Product variant not found.');

            const [nbUpdated, images] = await Image.update({
                description,
                fileName: `${productVariant.id}-${file.originalname}`,
                productVariantId: productVariant.id
            }, {
                where: { id: parseInt(req.params.id) },
                returning: true,
            });

            nbUpdated === 1 ? res.json(images[0]) : res.sendStatus(404);
        } else {
            const [nbUpdated, images] = await Image.update({
                description,
                productVariantId
            }, {
                where: { id: parseInt(req.params.id) },
                returning: true,
            });

            nbUpdated === 1 ? res.json(images[0]) : res.sendStatus(404);
        }
    } catch (e) {
        next(e);
    }
});

// Route pour supprimer une image
router.delete("/:id", checkRole({ roles: "admin" }), async (req, res, next) => {
    try {
        const image = await Image.findByPk(req.params.id);
        if (!image) return res.sendStatus(404);

        // Supprimer le fichier associé
        fs.unlinkSync(path.join(__dirname, '../uploads/images', image.fileName));

        const nbDeleted = await Image.destroy({
            where: { id: parseInt(req.params.id) },
        });

        nbDeleted === 1 ? res.sendStatus(204) : res.sendStatus(404);
    } catch (e) {
        next(e);
    }
});

// Route pour mettre à jour une image (avec nouvelle image)
router.put("/:id", upload.single('image'), checkRole({ roles: "admin" }), async (req, res, next) => {
    try {
        const image = await Image.findByPk(req.params.id);
        if (!image) return res.status(404).send('Image not found.');

        // Supprimer le fichier précédent
        fs.unlinkSync(path.join(__dirname, '../uploads/images', image.fileName));

        const { description, productVariantId } = req.body;
        const file = req.file;

        if (!file) return res.status(400).send('No file uploaded.');

        const productVariant = await ProductVariant.findByPk(productVariantId);
        if (!productVariant) return res.status(404).send('Product variant not found.');

        const [nbUpdated, images] = await Image.update({
            description,
            fileName: `${productVariant.id}-${file.originalname}`,
            productVariantId: productVariant.id
        }, {
            where: { id: parseInt(req.params.id) },
            returning: true,
        });

        nbUpdated === 1 ? res.json(images[0]) : res.sendStatus(404);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
