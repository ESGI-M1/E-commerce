import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Dashboard from '../views/Dashboard.vue';
import About from '../views/About.vue';
import Login from '../views/Login.vue';
import Signup from '../views/Signup.vue';
import Products from '../views/Products.vue';
import Category from '../views/Category.vue';
import Cart from '../views/Cart.vue';
import ProductDetail from '../views/ProductDetail.vue';
import Identifier from '../views/Identify.vue';

const routes = [
  {
    path: '/',
    name: 'Accueil',
    component: Products
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
    path: '/detail-produit/:id',
    name: 'ProductDetail',
    component: ProductDetail,
    props: true
  },
  {
    path: '/cart',
    name: 'Panier',
    component: Cart
  },
];

const router = createRouter({
  history: createWebHistory('/'),
  routes
});

export default router;
