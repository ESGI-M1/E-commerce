import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import About from '../views/About.vue';
import Login from '../views/Login.vue';
import Signup from '../views/Signup.vue';
import Products from '../views/Products.vue';
import Category from '../views/Category.vue';
import Cart from '../views/Cart.vue';
import ProductDetail from '../views/ProductDetail.vue';
import Identifier from '../views/Identify.vue';
import Users from '../views/Users.vue';
import Payment from '../views/Payment.vue';
import Favoris from '../views/Favorite.vue';
import Ressources from '../views/Ressources.vue';
import Locker from '../views/Locker.vue';

import axios from 'axios';

const isAdmin = async () => {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    return false;
  }

  try {
    const response = await axios.get(`http://localhost:3000/users/${authToken}`);
    const user = response.data;
    if (!user || user.role != 'admin') {
      return false;
    }

    return user.role === 'admin';
  } catch (error) {
    return false;
  }
};


const routes = [
  {
    path: '/',
    name: 'Accueil',
    component: Products
  },
  {
    path: '/users',
    name: 'Users',
    component: Users,
    meta: { requiresAdmin: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/signup',
    name: 'Sign up',
    component: Signup
  },
  {
    path: '/identifier',
    name: 'S\'identifier',
    component: Identifier
  },
  {
    path: '/products',
    name: 'Products',
    component: Products
  },
  {
    path: '/category/:slug',
    name: 'Category',
    component: Category
  },
  {
    path: '/products/:id',
    name: 'ProductDetail',
    component: ProductDetail,
    props: true
  },
  {
    path: '/cart',
    name: 'Panier',
    component: Cart
  },
  {
    path: '/payment',
    name: 'Paiement',
    component: Payment
  },
  {
    path: '/favorite',
    name: 'Favoris',
    component: Favoris
  },
  {
    path: '/ressources',
    name: 'Ressources',
    component: Ressources,
    meta: { requiresAdmin: true }
  },
  {
    path: '/locker',
    name: 'Produits',
    component: Locker,
    meta: { requiresAdmin: true }
  },
];

const router = createRouter({
  history: createWebHistory('/'),
  routes
});

router.beforeEach(async (to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    const isAdminUser = await isAdmin();
    if (!isAdminUser) {
      next('/');
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
