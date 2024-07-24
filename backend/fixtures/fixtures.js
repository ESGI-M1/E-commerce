const { User, Product, AddressUser, Favorite, Category, Shop, PromoCode, ProductVariant, Attribute, AttributeValue, OrderStatus, Alert, Cookie } = require('../models');

const findOrCreate = async (model, condition, data) => {
    const existingEntry = await model.findOne({ where: condition });
    if (existingEntry) {
        console.log(`Entry already exists: ${JSON.stringify(condition)}`);
        return existingEntry;
    }
    const newEntry = await model.create(data);
    return newEntry;
};

const findOrCreateAttribute = async (name) => {
    const existingAttribute = await Attribute.findOne({ where: { name } });
    if (existingAttribute) {
        console.log(`Attribute already exists: ${name}`);
        return existingAttribute;
    }
    return Attribute.create({ name });
};

const findOrCreateAttributeValue = async (value, attributeId) => {
    const existingAttributeValue = await AttributeValue.findOne({ where: { value, attributeId } });
    if (existingAttributeValue) {
        console.log(`AttributeValue already exists: ${value}`);
        return existingAttributeValue;
    }
    return AttributeValue.create({ value, attributeId });
};

const findOrCreateCookie = async () => {
    const cookie = await Cookie.findOne();
    if (cookie) {
        console.log('Cookie already exists');
        return cookie;
    }
    cookieFixtures();
};

const usersFixtures = async () => {
    const admin = await findOrCreate(User, { email: 'admin@zorglux.com' }, {
        firstname: 'admin',
        lastname: 'admin',
        email: 'admin@zorglux.com',
        password: 'Password123456789!',
        role: 'admin',
    });

    const user = await findOrCreate(User, { email: 'user@zorglux.com' }, {
        firstname: 'user',
        lastname: 'user',
        email: 'user@zorglux.com',
        password: 'Password123456789!',
        phone: '+33612345678'
    });

    await findOrCreate(AddressUser, { street: '123 Rue du moulin', postalCode: '60000', city: 'Beauvais', country: 'France', userId: user.id }, {
        street: '123 Rue du moulin',
        postalCode: '60000',
        city: 'Beauvais',
        country: 'France',
        userId: user.id,
    });

    await findOrCreate(AddressUser, { street: '456 Rue de la gare', postalCode: '75000', city: 'Paris', country: 'France', userId: admin.id }, {
        street: '456 Rue de la gare',
        postalCode: '75000',
        city: 'Paris',
        country: 'France',
        userId: admin.id,
    });
};

const productsFixtures = async () => {
    const category_Action = await findOrCreate(Category, { slug: 'action' }, {
        name: 'Action',
        slug: 'action',
        description: 'Figurines de manga dans la catégorie Action',
        active: true,
    });

    const category_Adventure = await findOrCreate(Category, { slug: 'adventure' }, {
        name: 'Adventure',
        slug: 'adventure',
        description: 'Figurines de manga dans la catégorie Adventure',
        active: true,
    });

    const category_Fantasy = await findOrCreate(Category, { slug: 'fantasy' }, {
        name: 'Fantasy',
        slug: 'fantasy',
        description: 'Figurines de manga dans la catégorie Fantasy',
        active: true,
    });

    const products = [
        { reference: 'goku-figure', name: 'Goku Figure', description: 'Goku de Dragon Ball Z', price: 20.5, active: true, categories: [category_Action] },
        { reference: 'vegeta-figure', name: 'Vegeta Figure', description: 'Vegeta de Dragon Ball Z', price: 25.0, active: true, categories: [category_Action] },
        { reference: 'naruto-figure', name: 'Naruto Figure', description: 'Naruto Uzumaki de Naruto', price: 22.0, active: true, categories: [category_Adventure] },
        { reference: 'sasuke-figure', name: 'Sasuke Figure', description: 'Sasuke Uchiha de Naruto', price: 21.0, active: true, categories: [category_Adventure] },
        { reference: 'luffy-figure', name: 'Luffy Figure', description: 'Monkey D. Luffy de One Piece', price: 18.0, active: true, categories: [category_Adventure] },
        { reference: 'zoro-figure', name: 'Zoro Figure', description: 'Roronoa Zoro de One Piece', price: 18.0, active: true, categories: [category_Adventure] },
        { reference: 'sakura-figure', name: 'Sakura Figure', description: 'Sakura Haruno de Naruto', price: 15.0, active: true, categories: [category_Adventure] },
        { reference: 'nami-figure', name: 'Nami Figure', description: 'Nami de One Piece', price: 16.5, active: true, categories: [category_Adventure] },
        { reference: 'frieza-figure', name: 'Frieza Figure', description: 'Frieza de Dragon Ball Z', price: 23.0, active: true, categories: [category_Action] },
        { reference: 'guts-figure', name: 'Guts Figure', description: 'Guts de Berserk', price: 30.0, active: true, categories: [category_Fantasy] },
        { reference: 'griffith-figure', name: 'Griffith Figure', description: 'Griffith de Berserk', price: 28.0, active: true, categories: [category_Fantasy] }
    ];

    for (const productData of products) {
        const product = await findOrCreate(Product, { reference: productData.reference }, {
            name: productData.name,
            reference: productData.reference,
            description: productData.description,
            price: productData.price,
            active: productData.active,
        });

        await product.addCategories(productData.categories);

        const variants = [
            { reference: `${productData.reference}-variant-1`, price: productData.price * 1.1, active: true, stock: 100, productId: product.id },
            { reference: `${productData.reference}-variant-2`, price: productData.price * 0.9, active: true, stock: 200, productId: product.id }
        ];

        for (const variantData of variants) {
            const productVariant = await findOrCreate(ProductVariant, { reference: variantData.reference }, variantData);

            const attributes = [
                { name: 'Size', values: ['Small', 'Medium', 'Large'] },
                { name: 'Color', values: ['Red', 'Blue', 'Green'] }
            ];

            for (const attributeData of attributes) {
                const attribute = await findOrCreateAttribute(attributeData.name);

                for (const value of attributeData.values) {
                    await findOrCreateAttributeValue(value, attribute.id);
                }

                const attributeValues = await AttributeValue.findAll({ where: { attributeId: attribute.id } });
                await productVariant.addAttributeValues(attributeValues);
            }
        }
    }

    await shopFixtures();

    const productVariant = await findOrCreate(ProductVariant, { reference: 'variant-1' }, {
        reference: 'variant-1',
        price: 12.5,
        active: true,
        stock: 100,
        productId: 1
    });

    const attributeSize = await findOrCreateAttribute('Size');
    const attributeValueL = await findOrCreateAttributeValue('L', attributeSize.id);
    await productVariant.addAttributeValues([attributeValueL]);
};

const shopFixtures = async () => {
    const shop = await findOrCreate(Shop, { name: 'Zorglux' }, {
        name: 'Zorglux',
        description: 'Description of Zorglux',
        favicon: 'favicon.ico',
        logo: 'logo.png',
        street: '123 Rue du moulin',
        postalCode: '60000',
        city: 'Beauvais',
        country: 'France',
        phone: '+33612345678',
        email: 'zorglux@zorglux.com',
        legalNotice: 'Legal notice of Zorglux',
        cgv: 'CGV of Zorglux',
        cgu: 'CGU of Zorglux',
        rgpd: 'RGPD of Zorglux',
        siret: '123456789',
        tva: '123456789',
        active: true,
    });

    const categories = await Category.findAll();
    await shop.addMainCategories(categories);
};

const promoCodeFixtures = async () => {
    await findOrCreate(PromoCode, { code: 'PROMO10' }, {
        code: 'PROMO10',
        discountPercentage: 10,
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        active: true,
    });
};

const orderStatusFixtures = async () => {
    await findOrCreate(OrderStatus, { name: 'pending' }, {
        name: 'pending',
    });
    await findOrCreate(OrderStatus, { name: 'completed' }, {
        name: 'completed',
    });
    await findOrCreate(OrderStatus, { name: 'cancelled' }, {
        name: 'cancelled',
    });
};

(async () => {
    try {
        await productsFixtures();
        await promoCodeFixtures();
        await orderStatusFixtures();
        await alertsFixtures();
        await findOrCreateCookie();
        await usersFixtures();
        console.log('Fixtures data has been added successfully.');
    } catch (error) {
        console.error('Error adding fixtures data:', error);
    }
})();

const cookieFixtures = async () => {
    const types = ["essentiels"];
    const descriptions = [
      "Ces cookies sont nécessaire au bon fonctionnement de notre site web, en effet ous utilisons vos différentes informations personnelles (nom, prenom, adresse, email) afin de pouvoir exercer différents traitements, tels que l'envoi d'email, la gestion de panier, la gestion de vos favoris etc..."
    ];

    for (let i=0; i < types.length; i++) {
        let existCookieType = await Cookie.findOne({
            where: {
                type: types[i]
            }
        });
        if (!existCookieType) {
            await Cookie.create({
                type: types[i],
                description: descriptions[i]
            });
        }
    }
}


const alertsFixtures = async () => {
    const alertsName = ["news_letter", "new_product", "restock_product", "change_product_price"]
    const alertsDescriptions = ["Vous inscrit à la newsletter et vous envoi les dernière news", "Vous informe de la sortie d'un nouveau produit", "Vous informe du restock du produit", "Vous informe du changement de prix du produit"];

    for (let i= 0; i < alertsName.length; i++) {
        let existAlert = await Alert.findOne({
            where: {
                name: alertsName[i]
            }
        });
        if (!existAlert) {
            await Alert.create({
                name: alertsName[i],
                description: alertsDescriptions[i]
            });
        }
    }
}



