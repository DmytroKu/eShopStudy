import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store/index'
import Home from '@/pages/PageHome.vue'
import Authorize from '@/pages/PageAuthorize.vue'
import ProductDetail from '@/pages/PageProductDetail.vue'
import Delivery from '@/pages/PageDelivery.vue'
import Confirmation from '@/pages/PageConfirmation.vue'
import Payment from '@/pages/PagePayment.vue'
import Finish from '@/pages/PageFinal.vue'
import Logout from '@/components/auth/LogoutComponent.vue'
import Profile from '@/pages/PageProfile.vue'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: {
        title: 'eShop - Home'
      }
    },
    {
      path: '/product/:id',
      name: 'ProductDetail',
      component: ProductDetail,
      meta: {
        title: 'eShop - Detail'
      },
      props: true
    },
    {
      path: '/signin',
      name: 'Signin',
      component: Authorize,
      meta: {
        title: 'eShop - Signin',
        requiresVisitor: true
      }
    },
    {
      path: '/register',
      name: 'Register',
      component: Authorize,
      meta: {
        title: 'eShop - Register',
        requiresVisitor: true
      }
    },
    {
      path: '/logout',
      name: 'Logout',
      component: Logout,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile,
      meta: {
        title: 'eShop - Profile',
        requiresAuth: true
      }
    },
    {
      path: '/checkout/delivery',
      name: 'Delivery',
      component: Delivery,
      meta: {
        title: 'eShop - Delivery',
        requiresAuth: true,
        requiresUserDetails: true,
        redirectPageAfterReachingPayment: true
      }
    },
    {
      path: '/checkout/confirmation',
      name: 'Confirmation',
      component: Confirmation,
      meta: {
        title: 'eShop - Confirmation',
        requiresAuth: true,
        redirectPageAfterReachingPayment: true,
        requiresUserDetails: true
      }
    },
    {
      path: '/checkout/payment',
      name: 'Payment',
      component: Payment,
      meta: {
        title: 'eShop - Payment',
        requiresUserDetails: true,
        requiresOrderId: true,
        requiresAuth: true
      }
    },
    {
      path: '/checkout/finish',
      name: 'Finish',
      component: Finish,
      meta: {
        title: 'eShop - Finish',
        requiresAuth: true,
        requiresTokenId: true,
        requiresStripeResponse: true
      }
    }
  ]
})
router.beforeEach((to, from, next) => {
  document.title = to.meta.title
  // Login related guards
  if (to.matched.some(route => route.meta.requiresAuth)) {
    if (store.getters.isLoggedIn) {
      // If order id is generated then we shouldnt go back, since it causes errors
      if (to.matched.some(route => route.meta.redirectPageAfterReachingPayment)) {
        !store.state.payment.orderId ? next() : next({ name: 'Payment' })
      } else if (to.matched.some(route => route.meta.requiresOrderId)) {
        !store.state.payment.orderId ? next({ name: 'Home' }) : next()
      } else {
        next()
      }
      // The payment page must only show if the order id is generated
      if (to.matched.some(route => route.meta.requiresOrderId)) {
        if (!store.state.payment.orderId) {
          next({ name: 'Home' })
        } else {
          next()
        }
      } else {
        next()
      }
      // If the user doesnt fill out the details then reminding him to update the address
      if (to.matched.some(route => route.meta.requiresUserDetails)) {
        if (!store.getters.hasAddress) {
          next({ name: 'Profile' })
        } else {
          next()
        }
      } else {
        next()
      }
      // The final page must only show if the stripe token is present
      if (to.matched.some(route => route.meta.requiresTokenId)) {
        if (!store.state.payment.stripeTokenId) {
          next({ name: 'Home' })
        } else {
          next()
        }
      } else {
        next()
      }
    } else {
      next({ name: 'Signin' })
      document.title = 'eShop - Signin'
    }
  } else if (to.matched.some(route => route.meta.requiresVisitor)) {
    if (!store.getters.isLoggedIn) {
      next()
    } else {
      next({ name: 'Home' })
      document.title = 'eShop - Home'
    }
  } else {
    next()
  }
})
export default router
