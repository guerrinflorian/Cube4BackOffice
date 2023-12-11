<template>
    <q-page class="q-pa-md">
        <q-dialog v-model="editDialog" v-if="selectedCategory">
            <q-card>
                <q-card-section>
                    <q-input v-model="editedName" label="Nom de la catégorie" />
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn flat label="Annuler" v-close-popup />
                    <q-btn label="Modifier" color="primary" @click="confirmEdit" />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <q-input v-model="newCategoryName" label="Nom de la nouvelle catégorie" class="q-mb-md"
            :rules="[val => !!val || 'Le champ ne peut pas être vide']" />
        <q-btn :disable="!newCategoryName" label="Créer" icon="add" color="primary" @click="createCategory"
            class="q-mb-md" />

        <div class="categories-container">
            <div v-for="category in categories" :key="category.id" class="category-card q-mb-md">
                <q-card>
                    <q-card-section>
                        {{ category.nom }}
                    </q-card-section>
                    <q-card-actions align="right">
                        <q-btn flat icon="edit" @click="openEditDialog(category)" />
                    </q-card-actions>
                </q-card>
            </div>
        </div>
    </q-page>
</template>
  
<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';

export default {
    setup() {
        const categories = ref([]);
        const newCategoryName = ref('');
        const editDialog = ref(false);
        const selectedCategory = ref(null);
        const editedName = ref('');
        const $q = useQuasar();

        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:3000/families');
                categories.value = response.data.filter(category => category.supprime === 0);
            } catch (error) {
                console.error('Erreur lors de la récupération des familles:', error);
            }
        };

        const createCategory = async () => {
            if (!newCategoryName.value.trim()) {
                console.error('Le nom de la famille ne peut pas être vide');
                return;
            }
            try {
                const response = await axios.post('http://localhost:3000/families', { name: newCategoryName.value });
                await fetchCategories();
                $q.notify({
                    color: 'positive',
                    message: `La famille de vin ${newCategoryName.value} à bien été créée`
                });
            } catch (error) {
                console.error('Erreur lors de la création de la famille:', error);
                $q.notify({
                    color: 'negative',
                    message: 'Problème lors de la création',
                });
            }
        };

        const openEditDialog = (category) => {
            selectedCategory.value = category;
            editedName.value = category.nom;
            editDialog.value = true;
        };

        const confirmEdit = async () => {
            if (!editedName.value.trim()) {
                console.error('Le nom de la famille ne peut pas être vide');
                return;
            }
            try {
                await axios.put(`http://localhost:3000/families/${selectedCategory.value.id}`, { name: editedName.value });
                editDialog.value = false;
                await fetchCategories();
                $q.notify({
                    color: 'positive',
                    message: `La famille de vin ${editedName.value} à bien été modifiée`
                });
            } catch (error) {
                console.error('Erreur lors de la modification de la famille:', error);
                $q.notify({
                    color: 'negative',
                    message: 'Problème lors de la modification',
                });
            }
        };

        onMounted(fetchCategories);

        return {
            categories,
            newCategoryName,
            createCategory,
            openEditDialog,
            confirmEdit,
            editDialog,
            selectedCategory,
            editedName,
        };
    },
};
</script>
  
<style scoped>
.categories-container {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
}

.category-card {
    flex: 1 0 calc(33.333% - 16px);
    max-width: calc(33.333% - 16px);
}
</style>
  