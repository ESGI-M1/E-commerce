import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue'
import Dashboard from '../views/Dashboard.vue';
import About from '../views/About.vue';
import Login from '../views/Login.vue'
import Signup from '../views/Signup.vue'
import Products from '../views/Products.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
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
    name: 'Signup',
    component: Signup
  },
  {
    path: '/products',
    name: 'Products',
    component: Products
  },
]

// const router = createRouter({
//   history: createWebHistory(process.env.BASE_URL),
//   routes
// });

const router = createRouter({
  history: createWebHistory('/'),
  routes
});

export default router
