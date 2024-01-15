<template>
    <div class="inventory-container">
        <q-select v-model="selectedItems" :options="itemOptions" label="Sélectionnez des articles" multiple use-chips
            class="select-articles"></q-select>

        <div class="items-container">
            <div v-for="item in selectedItems" :key="item.value" class="item-entry">
                <div class="item-name">{{ getItemName(item) }}</div>
                <q-input v-model="itemQuantities[item.value]" type="number" label="Quantité réelle" lazy-rules
                    :rules="[val => val !== null && val !== '' || 'Veuillez entrer une quantité']"
                    class="quantity-input"></q-input>
            </div>
        </div>

        <q-btn :disabled="!allQuantitiesEntered" color="primary" class="validate-button" @click="validateInventory">
            Valider
        </q-btn>
    </div>

    <q-dialog v-model="showResultsModal" full-width>
        <q-card>
            <q-card-section class="bg-primary text-white">
                <div class="text-h6">Résultats de l'inventaire</div>
            </q-card-section>

            <q-card-section>
                <div class="row text-bold">
                    <div class="col-3">Article</div>
                    <div class="col-2 text-center">Stock Informatique</div>
                    <div class="col-2 text-center">Stock Réel</div>
                    <div class="col-2 text-center">Écart</div>
                    <div class="col-3 text-center">Stock Après Inventaire</div>
                </div>
            </q-card-section>

            <q-card-section>
                <div v-for="item in selectedItems" :key="item.value" class="row items-center q-mb-sm">
                    <div class="col-3 flex items-center"
                        :class="{ 'bg-green': itemQuantities[item.value] == itemQuantitiesBefore[item.value], 'bg-red': itemQuantities[item.value] != itemQuantitiesBefore[item.value] }">
                        <q-icon name="science" class="q-mr-sm"></q-icon>
                        {{ getItemName(item) }}
                    </div>
                    <div class="col-2 text-center">{{ itemQuantitiesBefore[item.value] }}</div>
                    <div class="col-2 text-center">{{ itemQuantities[item.value] }}</div>
                    <div class="col-2 text-center">{{ itemQuantities[item.value] - itemQuantitiesBefore[item.value] }}</div>
                    <div class="col-3 text-center">{{ itemQuantities[item.value] }}</div>
                </div>
            </q-card-section>

            <q-card-actions align="right">
                <q-btn flat label="Fermer" color="primary" v-close-popup></q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>  

  
<script>
import { ref, onMounted, computed, watch, reactive } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';

export default {
    setup() {
        const items = ref([]);
        const selectedItems = ref([]);
        const itemQuantities = reactive({});
        const $q = useQuasar();
        const showResultsModal = ref(false);
        const itemQuantitiesBefore = reactive({});

        const fetchItems = async () => {
            try {
                const response = await axios.get('http://localhost:3000/items');
                items.value = response.data.filter(row => row.supprime === 0);
            } catch (error) {
                console.error('Erreur lors de la récupération des articles:', error);
            }
        };

        onMounted(fetchItems);

        const itemOptions = computed(() =>
            items.value.map(item => ({ label: item.nom, value: item.id }))
        );

        const getItemName = (item) => {
            return item.label;
        };


        const allQuantitiesEntered = computed(() => {
            // verif s'il y a des articles sélectionnés
            if (selectedItems.value.length === 0) {
                return false;
            }

            // verif si chaque article sélectionné a une quantité valide
            return selectedItems.value.every(item => {
                const quantity = itemQuantities[item.value];
                return quantity !== null && quantity !== '' && !isNaN(quantity);
            });
        });

        const validateInventory = async () => {
            try {
                selectedItems.value.forEach(item => {
                    const foundItem = items.value.find(i => i.id === item.value);
                    if (foundItem) {
                        itemQuantitiesBefore[item.value] = foundItem.quantite_enregistree;
                        console.log(itemQuantities)
                        console.log(itemQuantitiesBefore)
                    } else {
                        console.error('Article non trouvé pour l\'ID:', item.value);
                    }
                });

                // creer l'inventaire global
                let response = await axios.post('http://localhost:3000/inventaire-global', {
                    selectedArticleIds: selectedItems.value.map(item => item.value)
                });

                const idInventaireGlobal = response.data.id;

                // enregistrer chaque article individuellement lié a l'inv global
                for (const item of selectedItems.value) {
                    await axios.post('http://localhost:3000/inventaire-article', {
                        idInventaireGlobal,
                        idArticle: item.value,
                        quantiteEnregistree: items.value.find(i => i.id === item.value).quantite_enregistree,
                        quantiteReelle: itemQuantities[item.value]
                    });
                }

                showResultsModal.value = true;
            } catch (error) {
                console.error('Erreur lors de la validation de l’inventaire:', error);
                $q.notify({
                    color: 'positive',
                    message: `Problème lors de l'inventaire`
                });
            }
        };

        const refreshData = async () => {
            await fetchItems();
            selectedItems.value = []; // Réinitialiser les articles sélectionnés
            // Réinitialiser les autres états si nécessaire
        };



        watch(selectedItems, (newVal) => {
            newVal.forEach(id => {
                if (itemQuantities[id] === undefined) {
                    itemQuantities[id] = null;
                }
            });
        });

        watch(showResultsModal, (newValue) => {
            if (!newValue) { // Si la modal est fermée
                refreshData();
            }
        });

        return {
            items,
            selectedItems,
            itemQuantities,
            itemOptions,
            getItemName,
            allQuantitiesEntered,
            validateInventory,
            showResultsModal,
            itemQuantitiesBefore,
            refreshData
        };
    },
};
</script>




  
<style scoped>
.inventory-container {
    padding: 20px;
}

.select-articles {
    max-width: 500px;
    margin-bottom: 20px;
}

.items-container {
    margin-top: 10px;
}

.item-entry {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.item-name {
    margin-right: 20px;
    width: 150px;
}

.quantity-input {
    flex-grow: 1;
    max-width: 200px;
}

.validate-button {
    margin-top: 20px;
}

.bg-green {
    background-color: #76ff03 !important;
}

.bg-red {
    background-color: #ff1744 !important;
}
</style>