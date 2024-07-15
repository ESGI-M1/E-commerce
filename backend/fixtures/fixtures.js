const { User, Product, AddressUser, AddressOrder, Favorite, Category, Order, Cart } = require('../models');

const usersFixtures = async () => {

    const admin = await User.create({
        firstname: 'admin',
        lastname: 'admin',
        email: 'admin@zorglux.com',
        password: 'Password123456789!',
        role: 'admin',
    });

    const user = await User.create({
        firstname: 'user',
        lastname: 'user',
        email: 'user@zorglux.com',
        password: 'Password123456789!',
        phone: '+33612345678'
    });

    await AddressUser.create({
        street: '123 Rue du moulin',
        postalCode: '60000',
        city: 'Beauvais',
        country: 'France',
        userId: user.id,
    });

    await AddressUser.create({
        street: '456 Rue de la gare',
        postalCode: '75000',
        city: 'Paris',
        country: 'France',
        userId: admin.id,
    });

    const addressOrder = await AddressOrder.create({
        street: '123 Rue du moulin',
        postalCode: '60000',
        city: 'Beauvais',
        country: 'France',
        userId: user.id,
    });

    await productsFixtures();

    await Favorite.create({
        userId: user.id,
        productId: 1,
    });

    await Favorite.create({
        userId: user.id,
        productId: 2,
    });

    const cart = await Cart.create({
        userId: user.id,
        productId: 1,
        quantity: 2,
    });

    await Order.create(
        {
            userId: user.id,
            carts: [cart.id],
            totalAmount: 40.5,
            status: 'pending',
            deliveryDate: new Date(),
            deliveryMethod: addressOrder.id,
        }
    )

};
usersFixtures();

const productsFixtures = async () => {
    // Create categories once
    const category_1 = await Category.create({
        name: 'Category 1',
        slug: 'category-1',
        description: 'Description of category 1',
        active: true,
    });

    const category_2 = await Category.create({
        name: 'Category 2',
        slug: 'category-2',
        description: 'Description of category 2',
        active: false,
    });

    // Create products
    const product_1 = await Product.create({
        name: 'Product 1',
        reference: 'product-1',
        description: 'Description of product 1',
        price: 10,
        active: true,
    });

    const product_2 = await Product.create({
        name: 'Product 2',
        reference: 'product-2',
        description: 'Description of product 2',
        price: 20.5,
        active: true,
    });

    const product_3 = await Product.create({
        name: 'Product 3',
        reference: 'product-3',
        description: 'Description of product 3',
        price: 17.23,
        active: true,
    });

    await Product.create({
        name: 'Product 4',
        reference: 'product-4',
        description: 'Description of product 4',
        price: 5,
        active: false,
    });

    // Associate products with categories
    await product_1.addCategory(category_1);
    await product_2.addCategories([category_1, category_2]);
    await product_3.addCategory(category_2);
};
