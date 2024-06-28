import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/DashboardView.vue'
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
import ConfirmAdress from '../views/ConfirmAdress.vue'
import Success from '../views/SuccessView.vue'
import Error from '../views/ErrorView.vue'

//Admin
import Users from '../views/admin/adminUsers.vue'
import Promos from '../views/admin/adminPromos.vue'
import Categories from '../views/admin/adminCategories.vue'
import Ressources from '../views/admin/adminRessources.vue'
import Locker from '../views/admin/adminLocker.vue'
import Orders from '../views/admin/adminOrders.vue'
import Returns from '../views/admin/adminReturns.vue'

import axios from 'axios'

const isAdmin = async () => {
  const authToken = localStorage.getItem('authToken')
  if (!authToken) {
    return false
  }

  try {
    const response = await axios.get(`http://localhost:3000/users/${authToken}`)
    const user = response.data
    if (!user || user.role != 'admin') {
      return false
    }

    return user.role === 'admin'
  } catch (error) {
    return false
  }
}

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
    path: '/favorite',
    name: 'Favoris',
    component: Favoris
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/order',
    name: 'Historique des commandes',
    component: Order
  },
  {
    path: '/order/:id',
    name: 'OrderDetail',
    component: OrderDetail,
    props: true
  },
  {
    path: '/order/:orderId/returnProduct/:productId',
    name: 'ReturnProducts',
    component: ReturnProduct
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
    name: 'ConfirmAdress',
    component: ConfirmAdress
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

router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAdmin)) {
    const isAdminUser = await isAdmin()
    if (!isAdminUser) {
      next('/')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
