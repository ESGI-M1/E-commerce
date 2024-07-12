const { Router } = require("express");
const checkRole = require("../middlewares/checkRole");
const { Order } = require("../models"); 

const router = new Router();

    router.get("/orders", checkRole({ roles: "admin" }), async (req, res, next) => {
        try {
            const orders = await Order.findAll();
    
            const ordersByMonth = Array(12).fill(0);
            const earningsByMonth = Array(12).fill(0);
    
            orders.forEach(order => {
                const month = new Date(order.createdAt).getMonth();
                ordersByMonth[month]++;
                earningsByMonth[month] += parseFloat(order.totalAmount);
            });
    
            const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            const totalOrders = ordersByMonth;
            const totalEarn = earningsByMonth;
    
            res.send({ labels, totalOrders, totalEarn });
        } catch (e) {
            next(e);
        }
    });
    

module.exports = router;
