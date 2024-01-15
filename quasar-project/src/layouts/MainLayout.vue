<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated v-if="showToolbar">
      <q-toolbar style="background-color: rgb(24, 24, 26);">
        <q-img
          src="../assets/logo_negosud.png"
          style="height: 45px; max-width: 45px"
        />

        <q-toolbar-title>
          Application
        </q-toolbar-title>

        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered v-if="showToolbar" side="right">
      <q-list>
        <q-item-label header>
          Menu
        </q-item-label>

        <EssentialLink v-for="link in essentialLinks" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import EssentialLink from 'components/EssentialLink.vue'

const linksList = [
  {
    title: 'Accueil',
    caption: "Accueil de l'application",
    icon: 'home',
    to: '/home'
  },
  {
    title: 'Tableau de bord',
    caption: 'Statistiques et données',
    icon: 'monitor_heart',
    to: '/dashboard'
  },
  {
    title: 'Articles',
    caption: 'Articles de vins',
    icon: 'emoji_symbols',
    to: '/items'
  },
    {
    title: 'Inventaires',
    caption: 'Faire un inventaire',
    icon: 'inventory',
    to: '/inventories'
  },
  {
    title: 'Familles',
    caption: 'Familles de vins',
    icon: 'diversity_3',
    to: '/families'
  }, 
  {
    title: 'Sous Familles',
    caption: 'Sous Familles de vins',
    icon: 'diversity_3',
    to: '/sousfamilies'
  },
  {
    title: 'Fournisseurs',
    caption: 'Liste des fournisseurs',
    icon: 'person_pin_circle',
    to: '/suppliers'
  },
  {
    title: 'Commandes',
    caption: 'Commander des articles aux fournisseurs',
    icon: 'shopping_cart',
    to: '/orders'
  },
]

export default defineComponent({
  name: 'MainLayout',

  components: {
    EssentialLink
  },

  setup() {
    const route = useRoute()
    const leftDrawerOpen = ref(false)
    const showToolbar = computed(() => route.name !== 'login') 

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
      showToolbar
    }
  }
})
</script>