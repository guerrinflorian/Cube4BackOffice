<template>
    <q-page class="q-pa-md">
        <q-dialog v-model="editDialog" v-if="selectedHouse">
            <q-card>
                <q-card-section>
                    <q-input v-model="editedName" label="Nom de la maison" />
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn flat label="Annuler" v-close-popup />
                    <q-btn label="Modifier" color="primary" @click="confirmEdit" />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <q-input v-model="newHouseName" label="Nom de la nouvelle maison" class="q-mb-md"
            :rules="[val => !!val || 'Le champ ne peut pas être vide']" />
        <q-btn :disable="!newHouseName" label="Créer" icon="add" color="primary" @click="createHouse"
            class="q-mb-md" />

        <div class="houses-container">
            <div v-for="house in houses" :key="house.id" class="house-card q-mb-md">
                <q-card>
                    <q-card-section>
                        {{ house.name }}
                    </q-card-section>
                    <q-card-actions align="right">
                        <q-btn flat icon="edit" @click="openEditDialog(house)" />
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
        const houses = ref([]);
        const newHouseName = ref('');
        const editDialog = ref(false);
        const selectedHouse = ref(null);
        const editedName = ref('');
        const $q = useQuasar();

        const fetchHouses = async () => {
            try {
                const response = await axios.get('http://localhost:8080/houses');
                houses.value = response.data.filter(house => house.isDeleted === false);
            } catch (error) {
                console.error('Erreur lors de la récupération des maisons:', error);
            }
        };

        const createHouse = async () => {
            if (!newHouseName.value.trim()) {
                console.error('Le nom de la sous famille ne peut pas être vide');
                return;
            }
            try {
                const response = await axios.post('http://localhost:8080/houses', { name: newHouseName.value });
                await fetchHouses();
                $q.notify({
                    color: 'positive',
                    message: `La sous famille de vin ${newHouseName.value} à bien été créée`
                });
            } catch (error) {
                console.error('Erreur lors de la création de la sous famille:', error);
                $q.notify({
                    color: 'negative',
                    message: 'Problème lors de la création',
                });
            }
        };

        const openEditDialog = (house) => {
            selectedHouse.value = house;
            editedName.value = house.name;
            editDialog.value = true;
        };

        const confirmEdit = async () => {
            if (!editedName.value.trim()) {
                console.error('Le nom de la sous famille ne peut pas être vide');
                return;
            }
            try {
                await axios.put(`http://localhost:8080/houses/${selectedHouse.value.id}`, { name: editedName.value });
                editDialog.value = false;
                await fetchHouses();
                $q.notify({
                    color: 'positive',
                    message: `La sous famille de vin ${editedName.value} à bien été modifiée`
                });
            } catch (error) {
                console.error('Erreur lors de la modification de la maison:', error);
                $q.notify({
                    color: 'negative',
                    message: 'Problème lors de la modification',
                });
            }
        };

        onMounted(fetchHouses);

        return {
            houses,
            newHouseName,
            createHouse,
            openEditDialog,
            confirmEdit,
            editDialog,
            selectedHouse,
            editedName,
        };
    },
};
</script>
  
<style scoped>
.houses-container {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
}

.house-card {
    flex: 1 0 calc(33.333% - 16px);
    max-width: calc(33.333% - 16px);
}
</style>
  