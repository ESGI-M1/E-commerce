const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { Order } = require("../models");

const generateInvoice = async (orderId) => {
  try {
    const response = await Order.findOne({
      where: {
        id: orderId,
      },
      order: [['createdAt', 'DESC']],
    });
    const order = response.data;

    const doc = new PDFDocument();
    const directoryPath = path.join(__dirname, 'invoices');

    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath);
    }

    const filePath = path.join(directoryPath, `invoice_${orderId}.pdf`);

    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(25).text('Facture', 100, 100);

    doc.fontSize(12).text('Votre Entreprise', 100, 150);
    doc.text('Adresse de l\'entreprise', 100, 165);
    doc.text('Code Postal, Ville', 100, 180);
    doc.text('Téléphone : +33 1 23 45 67 89', 100, 195);
    doc.text('Email : contact@votreentreprise.com', 100, 210);

    doc.text(`Facturé à : ${order.customer.name}`, 300, 150);
    doc.text(`${order.customer.address}`, 300, 165);
    doc.text(`${order.customer.zipCode} ${order.customer.city}`, 300, 180);
    doc.text(`${order.customer.country}`, 300, 195);

    doc.text(`Numéro de commande : ${order._id}`, 100, 250);
    doc.text(`Date : ${new Date(order.createdAt).toLocaleDateString()}`, 100, 265);

    let yPosition = 300;
    doc.text('Produits', 100, yPosition);
    order.cart.products.forEach(product => {
      yPosition += 20;
      doc.text(`${product.name} - ${product.quantity} x ${product.price}€`, 100, yPosition);
    });

    yPosition += 30;
    doc.text(`Total : ${order.totalPrice}€`, 100, yPosition);

    doc.end();

    return filePath;
  } catch (error) {
    console.error('Erreur lors de la génération de la facture :', error);
    throw new Error('Erreur lors de la génération de la facture');
  }
};

module.exports = generateInvoice;
