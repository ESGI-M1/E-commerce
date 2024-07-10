import { createRouter, createWebHistory } from 'vue-router'
import Cookies from 'js-cookie'

import About from '../views/AboutView.vue'

import Login from '../views/LoginView.vue'
import Signup from '../views/SignupView.vue'
import ForgotPassword from '../views/ForgotPasswordView.vue'
import Identifier from '../views/IdentifyView.vue'
import ResetPassword from '../views/ResetPasswordView.vue'

import Category from '../views/CategoryView.vue'
import Search from '../views/SearchView.vue'
import Cart from '../views/CartView.vue'
import ProductDetail from '../views/ProductDetailView.vue'
import Payment from '../views/PaymentView.vue'
import Favoris from '../views/FavoriteView.vue'
import Profile from '../views/ProfileView.vue'
import ProductList from '../views/ProductListView.vue'
import Order from '../views/OrderView.vue'
import OrderDetail from '../views/OrderDetailView.vue'
import ReturnProduct from '../views/ReturnProductView.vue'
import ConfirmAddress from '../views/ConfirmAddress.vue'
import Success from '../views/SuccessView.vue'
import Error from '../views/ErrorView.vue'
import Livraison from '../views/OrderLivraisonView.vue'

//Admin
import Dashboard from '../views/admin/adminDashboard.vue'
import Users from '../views/admin/adminUsers.vue'
import Promos from '../views/admin/adminPromos.vue'
import Categories from '../views/admin/adminCategories.vue'
import Ressources from '../views/admin/adminRessources.vue'
import Locker from '../views/admin/adminLocker.vue'
import Orders from '../views/admin/adminOrders.vue'
import Returns from '../views/admin/adminReturns.vue'

const routes = [
  {
    path: '/',
    name: 'Accueil',
    component: ProductList
  },
  {
    path: '/users',
    name: 'Users',
    component: Users,
    meta: { requiresAdmin: true }
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
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword
  },
  {
    path: '/reset-password/:token',
    name: 'ResetPassword',
    component: ResetPassword
  },
  {
    path: '/identifier',
    name: 'Identifier',
    component: Identifier
  },
  {
    path: '/category/:slug',
    name: 'Category',
    component: Category
  },
  {
    path: '/search',
    name: 'Search',
    component: Search
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
    path: '/success/:orderId/:cartId',
    name: 'Success',
    component: Success
  },  
  {
    path: '/error/:orderId',
    name: 'Error',
    component: Error
  },
  {
    path: '/favorites',
    name: 'Favoris',
    component: Favoris,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/order',
    name: 'Historique des commandes',
    component: Order,
    meta: { requiresAuth: true }
  },
  {
    path: '/order/livraison/:id',
    name: 'LivraisonOrder',
    component: Livraison
  },
  {
    path: '/order/:id',
    name: 'OrderDetail',
    component: OrderDetail,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/order/:orderId/returnProduct/:productId',
    name: 'ReturnProducts',
    component: ReturnProduct,
    meta: { requiresAuth: true }
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
  {
    path: '/categories',
    name: 'Catégories',
    component: Categories,
    meta: { requiresAdmin: true }
  },
  {
    path: '/promos',
    name: 'Code promos',
    component: Promos,
    meta: { requiresAdmin: true }
  },
  {
    path: '/users/confirm-address/:token',
    name: 'ConfirmAddress',
    component: ConfirmAddress,
    meta: { requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'Commandes',
    component: Orders,
    meta: { requiresAdmin: true }
  },
  {
    path: '/returns',
    name: 'Retours',
    component: Returns,
    meta: { requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory('/'),
  routes
})

const isLogged = () => {
  const userCookie = Cookies.get('USER');
  if (!userCookie) return null;

  const userObject = JSON.parse(userCookie.substring(2));
  return userObject;
}

const isAuthenticated = () => {
  return isLogged() !== null;
}

const isAdmin = () => {
  const user = isLogged();
  if (!user || !user.role) return false;

  return user.role === 'admin';
}

router.beforeEach(async (to, from) => {
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    if (!isAdmin()) return '/login';
  }

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated()) return '/login';
  }

  return true;
});
  

export default router
