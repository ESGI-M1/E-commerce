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

const routes = [
  {
    path: '/',
    name: 'Accueil',
    component: Products
  },
  {
    path: '/users',
    name: 'Users',
    component: Users
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
];

const router = createRouter({
  history: createWebHistory('/'),
  routes
});

export default router;
