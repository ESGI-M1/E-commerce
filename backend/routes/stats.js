const { Router } = require("express");
const checkRole = require("../middlewares/checkRole");
const { Order, User } = require("../models"); 

const router = new Router();

router.get("/", checkRole({ roles: "admin" }), async (req, res, next) => {
    try {
        const params = req.query.params ? req.query.params.split(',') : [];
        const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const responseData = { labels };

        if (params.includes('totalOrders') || params.includes('totalEarn')) {
        const orders = await Order.findAll();
        
        const ordersByMonth = Array(12).fill(0);
        const earningsByMonth = Array(12).fill(0);

        orders.forEach(order => {
            const month = new Date(order.createdAt).getMonth();
            if (params.includes('totalOrders')) {
                ordersByMonth[month]++;
            }
            if (params.includes('totalEarn')) {
                earningsByMonth[month] += parseFloat(order.totalAmount);
            }
        });

        if (params.includes('totalOrders')) {
            responseData.totalOrders = ordersByMonth;
        }
        if (params.includes('totalEarn')) {
            responseData.totalEarn = earningsByMonth;
        }
    }

    if (params.includes('totalUsers')) {
        const users = await User.findAll();
        const usersByMonth = Array(12).fill(0);

        users.forEach(user => {
            const month = new Date(user.createdAt).getMonth();
            usersByMonth[month]++;
        });
        responseData.totalUsers = usersByMonth;
    }

        res.send(responseData);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
