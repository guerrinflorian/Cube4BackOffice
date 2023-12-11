<template>
    <q-page class="full-height">
        <div class="q-pa-md row items-center justify-center layout-gt-xs layout-row flex">
            <div class="col-4 q-ma-md flex-shrink-0">
                <q-card class="my-card">
                    <q-card-section>
                        <div class="text-h6">Passer une commande</div>
                    </q-card-section>
                    <q-card-section>
                        <q-select v-model="selectedObject" :options="items" label="Article" option-value="value"
                            option-label="nom" @update:modelValue="onItemSelected($event)" />
                    </q-card-section>
                    <q-card-section v-if="selectedObject">
                        <div class="q-mb-md">Fournisseur: {{ selectedObject.fournisseur_nom_entreprise }}</div>
                        <q-input v-model="quantity" label="Quantité" type="number" />
                    </q-card-section>
                    <q-card-section v-if="!validSupplier && selectedObject">
                        <div class="text-negative">
                            Veuillez assigner un fournisseur valide à cet article.
                            <q-tooltip anchor="top middle" self="bottom middle">
                                Le fournisseur assigné à cet article est supprimé, il n'existe plus.
                            </q-tooltip>
                        </div>
                    </q-card-section>
                    <q-card-actions align="right" v-if="selectedItem">
                        <q-btn :disable="!quantity || !validSupplier" label="Commander" color="primary" @click="placeOrder">
                            <q-icon name="shopping_cart" />
                        </q-btn>
                    </q-card-actions>
                </q-card>
            </div>
            <div class="col q-ma-md flex-grow-1 flex-shrink-1">
                <q-table :filter="filter" :rows="allOrders" row-key="id" :columns="columns" multiple outlined dense
                    :rows-per-page-options="[10]" class="full-height">
                    <template v-slot:top>
                        <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
                            <template v-slot:append>
                                <q-icon name="search" />
                            </template>
                        </q-input>
                    </template>
                    <template v-slot:body="props">
                        <q-tr :props="props">
                            <q-td key="id" :props="props">{{ props.row.id }}</q-td>
                            <q-td key="nom_article" :props="props">{{ props.row.nom_article }}</q-td>
                            <q-td key="nom_fournisseur" :props="props">{{ props.row.nom_fournisseur }}</q-td>
                            <q-td key="quantite" :props="props">{{ props.row.quantite }}</q-td>
                            <q-td key="prix_achat" :props="props">{{ props.row.prix_achat }}</q-td>
                        </q-tr>
                    </template>
                </q-table>
            </div>
        </div>
    </q-page>
</template>

  
<script>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';

export default {
    setup() {
        const $q = useQuasar();
        const items = ref([]);
        const selectedItem = ref(null); 
        const selectedObject = ref(null); 
        const quantity = ref('');
        const validSupplier = ref(true);
        const selectedItemId = computed(() => selectedObject.value ? selectedObject.value.id : null);
        const filter = ref('');

        const fetchItems = async () => {
            try {
                const response = await axios.get('http://localhost:3000/items');
                items.value = response.data.filter(item => item.supprime === 0);
            } catch (error) {
                console.error('Erreur lors de la récupération des articles:', error);
            }
        };

        const onItemSelected = (newVal) => {
            if (!newVal) return; 

            selectedItem.value = newVal.id; 
            selectedObject.value = newVal; 

            if (!selectedObject.value) return; 

            validSupplier.value = selectedObject.value && selectedObject.value.id_fournisseur && selectedObject.value.fournisseur_supprime === 0;
        };

        const placeOrder = async () => {
            if (!selectedObject.value || !quantity.value || !validSupplier.value) return;
            try {
                const orderData = {
                    id_fournisseur: selectedObject.value.fournisseur_id,
                    id_article: selectedObject.value.id,
                    quantite: quantity.value,
                    prix_achat: selectedObject.value.prix_achat * quantity.value 
                };
                await axios.post('http://localhost:3000/placeOrderSuppliers', orderData);
                fetchAllOrders();
                fetchItems();
                $q.notify({
                    color: 'green-4',
                    textColor: 'white',
                    icon: 'check',
                    message: 'Commande passée avec succés!'
                });
            } catch (error) {
                $q.notify({
                    color: 'red-4',
                    textColor: 'white',
                    icon: 'error',
                    message: 'Échec de la de commande!'
                });
                console.error('Erreur lors de la passation de la commande:', error);
            }
        };

        onMounted(() => {
            fetchItems();
            fetchAllOrders();

        });


        const allOrders = ref([]);


        const fetchAllOrders = async () => {
            try {
                // recuperer les commandes fournisseurs
                const ordersResponse = await axios.get('http://localhost:3000/allOrdersSuppliers');
                const orders = ordersResponse.data && ordersResponse.data.orders ? ordersResponse.data.orders : [];

                // recuperer les articles
                const articlesResponse = await axios.get('http://localhost:3000/items');
                const articles = articlesResponse.data || [];

                // recuperer les fournisseurs
                const suppliersResponse = await axios.get('http://localhost:3000/suppliers');
                const suppliers = suppliersResponse.data || [];

                allOrders.value = orders.map(order => ({
                    ...order,
                    nom_article: articles.find(a => a.id === order.id_article)?.nom || "Inconnu",
                    nom_fournisseur: suppliers.find(s => s.id === order.id_fournisseur)?.nom_entreprise || "Inconnu",
                    prix_achat: parseFloat(order.prix_achat)
                }));



            } catch (error) {
                console.error('Error fetching all data:', error);
            }
        };

        const columns = [
            { name: 'id', label: 'ID Commande', align: 'left', field: row => row.id, sortable: true },
            { name: 'nom_article', label: "Nom de l'article", align: 'left', field: row => row.nom_article, sortable: true },
            { name: 'nom_fournisseur', label: "Nom du fournisseur", align: 'left', field: row => row.nom_fournisseur, sortable: true },
            { name: 'quantite', label: 'Quantité', align: 'left', field: row => row.quantite, sortable: true },
            { name: 'prix_achat', label: "Prix d'achat", align: 'left', field: row => row.prix_achat, sortable: true },
        ];


        return {
            items,
            selectedItem,
            selectedObject, 
            quantity,
            validSupplier,
            onItemSelected,
            selectedItemId,
            placeOrder,
            allOrders,
            columns,
            filter
        };
    },
};
</script>


  
<style scoped>
.full-height {
    height: 100vh;
}

.my-card {
    max-width: 400px;
    margin: auto;
}

.full-width {
    width: 100%;
}

.full-width-image {
    height: 230px;
    width: 300px;
}
</style>

  