
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '/', name: 'login', component: () => import('pages/LoginPage.vue') }, //  LoginPage.vue page par défaut
      { path: '/home', name: 'home', component: () => import('pages/HomePage.vue') },
      { path: '/dashboard', name: 'dashboard', component: () => import('pages/DashboardPage.vue') },
      { path: '/items', name: 'items', component: () => import('pages/ArticlesPage.vue') },
      { path: '/families', name: 'families', component: () => import('pages/FamiliesPage.vue') },
      { path: '/sousfamilies', name: 'sousfamilies', component: () => import('pages/SubFamiliesPage.vue') },
      { path: '/suppliers', name: 'suppliers', component: () => import('pages/SuppliersPage.vue') },
      { path: '/orders', name: 'orders', component: () => import('pages/OrdersPage.vue') },
      { path: '/suivistock', name: 'suivistock', component: () => import('pages/SuiviStockPage.vue') },
      { path: '/inventories', name: 'inventories', component: () => import('pages/InventoryPage.vue') },
    ]
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
