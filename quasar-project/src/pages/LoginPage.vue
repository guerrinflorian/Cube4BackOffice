<template>
  <q-page class="flex flex-center">
    <q-card style="width: 300px; max-width: 80vw;">
      <q-card-section>
        <div class="text-h6">Connexion</div>
      </q-card-section>
      <q-card-section>
        <q-form @submit.prevent="onSubmit" class="q-gutter-md">
          <q-input filled v-model="username" label="Nom d'utilisateur" />
          <q-input filled type="password" v-model="password" label="Mot de passe" />
          <div>
            <q-btn label="Se connecter" type="submit" color="primary" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      username: '',
      password: '',
    };
  },
  methods: {
    async onSubmit() {
      try {
        const response = await axios.post('http://localhost:3000/login', {
          username: this.username,
          password: this.password,
        });

        if (response.data.success) {
          this.$router.push({ name: 'home' }); // Si les identifiants sont corrects, rediriger vers la page d'accueil
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
