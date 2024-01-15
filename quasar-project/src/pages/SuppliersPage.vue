<template>
  <q-page class="q-pa-md">
    <q-dialog v-model="addDialog">
      <q-card>
        <q-card-section>
          <q-input v-model="newSupplier.name" label="Nom" :rules="[val => !!val || 'Le champ ne peut pas être vide']" />
          <q-input v-model="newSupplier.companyName" label="Nom Entreprise"
            :rules="[val => !!val || 'Le champ ne peut pas être vide']" />
          <q-input v-model="newSupplier.email" label="Email"
            :rules="[val => !!val || 'Le champ ne peut pas être vide']" />
          <q-input v-model="newSupplier.phone" label="Téléphone"
            :rules="[val => !!val || 'Le champ ne peut pas être vide']" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Annuler" v-close-popup />
          <q-btn
            :disable="!newSupplier.name || !newSupplier.email || !newSupplier.phone || !newSupplier.companyName"
            label="Ajouter" color="primary" @click="createSupplier" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="editDialog" v-if="selectedSupplier">
      <q-card>
        <q-card-section>
          <q-input v-model="editedSupplier.name" label="Nom" :rules="[val => !!val || 'Le champ ne peut pas être vide']" />
          <q-input v-model="editedSupplier.companyName" label="Nom Entreprise"
            :rules="[val => !!val || 'Le champ ne peut pas être vide']" />
          <q-input v-model="editedSupplier.email" label="Email"
            :rules="[val => !!val || 'Le champ ne peut pas être vide']" />
          <q-input v-model="editedSupplier.phone" label="Téléphone"
            :rules="[val => !!val || 'Le champ ne peut pas être vide']" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Annuler" v-close-popup />
          <q-btn
            :disable="!editedSupplier.name || !editedSupplier.email || !editedSupplier.phone || !editedSupplier.companyName"
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
                <div class="text-h6">{{ props.row.name }}</div>
              </template>
              <div>Nom Entreprise: {{ props.row.companyName }}</div>
              <div>Email: {{ props.row.email }}</div>
              <div>Téléphone: {{ props.row.phone }}</div>

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
    const columns = ref([{ name: 'name', label: 'Nom', align: 'left', field: 'name' }]);
    const addDialog = ref(false);
    const editDialog = ref(false);
    const selectedSupplier = ref(null);
    const newSupplier = ref({ name: '', companyName: '', email: '', phone: '' });
    const editedSupplier = ref({ name: '', companyName: '', email: '', phone: '' });

    const fetchSuppliers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/suppliers');
        console.log(response.data)
        suppliers.value = response.data.filter(supplier => supplier.isDeleted === false);
        console.log(suppliers.value)
      } catch (error) {
        console.error('Erreur lors de la récupération des fournisseurs:', error);
      }
    };

    const createSupplier = async () => {
      try {
        await axios.post('http://localhost:8080/suppliers', newSupplier.value);
        newSupplier.value = { name: '', companyName: '', email: '', phone: '' };
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
        await axios.put(`http://localhost:8080/suppliers/${selectedSupplier.value.id}`, editedSupplier.value);
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
        await axios.delete(`http://localhost:8080/suppliers/${supplier.id}`);
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
