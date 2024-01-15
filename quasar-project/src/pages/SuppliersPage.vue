<template>
  <q-page class="q-pa-md">
    <q-dialog v-model="addDialog">
      <q-card>
        <q-card-section>
          <q-input v-model="newSupplier.nom" label="Nom" :rules="[val => !!val || 'Le champ ne peut pas être vide']" />
          <q-input v-model="newSupplier.nom_entreprise" label="Nom Entreprise"
            :rules="[val => !!val || 'Le champ ne peut pas être vide']" />
          <q-input v-model="newSupplier.courriel" label="Email"
            :rules="[val => !!val || 'Le champ ne peut pas être vide']" />
          <q-input v-model="newSupplier.numero_telephone" label="Téléphone"
            :rules="[val => !!val || 'Le champ ne peut pas être vide']" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Annuler" v-close-popup />
          <q-btn
            :disable="!newSupplier.nom || !newSupplier.courriel || !newSupplier.numero_telephone || !newSupplier.nom_entreprise"
            label="Ajouter" color="primary" @click="createSupplier" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="editDialog" v-if="selectedSupplier">
      <q-card>
        <q-card-section>
          <q-input v-model="editedSupplier.nom" label="Nom" :rules="[val => !!val || 'Le champ ne peut pas être vide']" />
          <q-input v-model="editedSupplier.nom_entreprise" label="Nom Entreprise"
            :rules="[val => !!val || 'Le champ ne peut pas être vide']" />
          <q-input v-model="editedSupplier.courriel" label="Email"
            :rules="[val => !!val || 'Le champ ne peut pas être vide']" />
          <q-input v-model="editedSupplier.numero_telephone" label="Téléphone"
            :rules="[val => !!val || 'Le champ ne peut pas être vide']" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Annuler" v-close-popup />
          <q-btn
            :disable="!editedSupplier.nom || !editedSupplier.courriel || !editedSupplier.numero_telephone || !editedSupplier.nom_entreprise"
            label="Modifier" color="primary" @click="confirmEdit" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-btn label="Ajouter un fournisseur" icon="add" color="primary" @click="addDialog = true" class="q-mb-md" />
    <q-table :rows="suppliers" :columns="columns" row-key="id">
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-expansion-item expand-separator icon="more_horiz">
              <template v-slot:header>
                <div class="text-h6">{{ props.row.nom }}</div>
              </template>
              <div>Nom Entreprise: {{ props.row.nom_entreprise }}</div>
              <div>Email: {{ props.row.courriel }}</div>
              <div>Téléphone: {{ props.row.numero_telephone }}</div>

              <q-btn flat icon="edit" @click="openEditDialog(props.row)" label="Modifier" class="q-mt-md" />
              <q-btn flat icon="delete" @click="deleteSupplier(props.row)" label="Supprimer" class="q-mt-md" />
            </q-expansion-item>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import axios from 'axios';

export default {
  setup() {
    const $q = useQuasar();
    const suppliers = ref([]);
    const columns = ref([{ name: 'nom', label: 'Nom', align: 'left', field: 'nom' }]);
    const addDialog = ref(false);
    const editDialog = ref(false);
    const selectedSupplier = ref(null);
    const newSupplier = ref({ nom: '', nom_entreprise: '', courriel: '', numero_telephone: '' });
    const editedSupplier = ref({ nom: '', nom_entreprise: '', courriel: '', numero_telephone: '' });

    const fetchSuppliers = async () => {
      try {
        const response = await axios.get('http://localhost:3000/suppliers');
        suppliers.value = response.data.filter(supplier => supplier.supprime === 0);
        console.log(suppliers.value)
      } catch (error) {
        console.error('Erreur lors de la récupération des fournisseurs:', error);
      }
    };

    const createSupplier = async () => {
      try {
        await axios.post('http://localhost:3000/suppliers', newSupplier.value);
        newSupplier.value = { nom: '', nom_entreprise: '', courriel: '', numero_telephone: '' };
        addDialog.value = false;
        $q.notify({ color: 'positive', message: 'Fournisseur ajouté avec succès' });
        fetchSuppliers();  // rafraichir les données
      } catch (error) {
        console.error('Erreur lors de la création du fournisseur:', error);
        $q.notify({ color: 'negative', message: 'Erreur lors de la création du fournisseur' });
      }
    };

    const openEditDialog = (supplier) => {
      selectedSupplier.value = supplier;
      editedSupplier.value = { ...supplier };
      editDialog.value = true;
    };

    const confirmEdit = async () => {
      try {
        await axios.put(`http://localhost:3000/suppliers/${selectedSupplier.value.id}`, editedSupplier.value);
        editDialog.value = false;
        $q.notify({ color: 'positive', message: 'Fournisseur modifié avec succès' });
        fetchSuppliers();  // rafraichir les données
      } catch (error) {
        console.error('Erreur lors de la modification du fournisseur:', error);
        $q.notify({ color: 'negative', message: 'Erreur lors de la modification du fournisseur' });
      }
    };


    const deleteSupplier = async (supplier) => {
      try {
        await axios.delete(`http://localhost:3000/suppliers/${supplier.id}`);
        $q.notify({ color: 'positive', message: 'Fournisseur marqué comme supprimé' });
        fetchSuppliers();  // rafraichir les données
      } catch (error) {
        console.error('Erreur lors de la suppression du fournisseur:', error);
        $q.notify({ color: 'negative', message: 'Erreur lors de la suppression du fournisseur' });
      }
    };


    onMounted(fetchSuppliers);

    return {
      suppliers,
      columns,
      addDialog,
      editDialog,
      selectedSupplier,
      newSupplier,
      editedSupplier,
      createSupplier,
      openEditDialog,
      confirmEdit,
      deleteSupplier,
    };
  },
};
</script>

<style scoped>
</style>
