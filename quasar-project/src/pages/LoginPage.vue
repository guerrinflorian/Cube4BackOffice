<template>
  <q-page class="flex flex-center background-page">
    <q-card class="row pn-margin-5-px">
      <div class="col-auto">
        <img :src="logoNegosud" alt="Logo Negosud" style="width: 275px; height: 275px;">
      </div>
      <div class="col">
        <q-card class="no-shadow" style="width: 400px; max-width: 80vw; height: 275px;">
          <q-card-section class="text-center">
            <div class="text-h6">Connexion</div>
          </q-card-section>
          <q-card-section>
            <q-form @submit.prevent="onSubmit" class="q-gutter-md">
              <q-input filled v-model.trim="username" label="Nom d'utilisateur">
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>
              <q-input filled :type="showPassword ? 'text' : 'password'" v-model="password" label="Mot de passe">
                <template v-slot:prepend>
                  <q-icon name="vpn_key" />
                </template>
                <template v-slot:append>
                  <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" @click="togglePasswordVisibility"
                    color="blue" />
                </template>
              </q-input>
              <div class="text-right">
                <q-btn label="Se connecter" type="submit" color="primary" :disabled="!canSubmit" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </q-card>
  </q-page>
</template>

<script>
import axios from 'axios';
import logoNegosud from '../assets/logo_negosud.png';
import Cookies from 'js-cookie';

export default {
  data() {
    return {
      username: '',
      password: '',
      showPassword: false,
      logoNegosud
    };
  },
  computed: {
    canSubmit() {
      return this.username.length > 0 && this.password.length > 0;
    }
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    async onSubmit() {
      try {
        const response = await axios.post('http://localhost:8080/api/auth/login', {
          username: this.username.toLowerCase(), // nom d'utilisateur en minuscules
          password: this.password,
        });

        if (response.data.connected) {
          const token = response.data.token;
          Cookies.set('user-token', token, { expires: 1/24 }); //stock le token dans les cookies pour 7 jours
          this.$router.push({ name: 'home' }); // redirection page accueil si login ok
        } else {
          this.$q.notify({
            color: 'negative',
            message: 'Identifiant ou mot de passe incorrect',
          });
        }
      } catch (error) {
        console.error('Erreur de connexion:', error);
        this.$q.notify({
          color: 'negative',
          message: 'Erreur de connexion au serveur',
        });
      }
    },
  },
};
</script>

<style>
.background-page {
  position: relative;
  overflow: hidden;
}

.background-page::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-image: url('../assets/background_login.jpg');
  background-size: cover;
  background-position: center center;
  opacity: 0.05;
  z-index: -1;
}

.pn-margin-5-px {
  padding: 5px;
}
</style>

