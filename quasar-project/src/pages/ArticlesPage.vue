<template>
    <q-page>
        <q-btn label="Ajouter un article" icon="add" color="primary" class="q-mb-md ma10 q-ma-sm"
            @click="openCreateModal" />
        <q-table :rows="rows" :columns="columns" row-key="id" :filter="filter" :visible-columns="visibleColumns"
            virtual-scroll v-model:pagination="pagination" :rows-per-page-options="[0]">
            <template v-slot:top>
                <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
                <q-space />
                <q-select v-model="visibleColumns" multiple outlined dense options-dense
                    :display-value="$q.lang.table.columns" emit-value map-options :options="columns" option-value="name"
                    options-cover style="min-width: 150px" />
            </template>
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td v-for="col in props.cols" :key="col.name" :props="props">
                        {{ col.value }}
                    </q-td>
                    <q-td>
                        <q-btn flat @click="openEditModal(props.row)" icon="edit" />
                        <q-btn flat @click="openDeleteModal(props.row.id)" icon="delete" color="negative" />
                        <q-btn flat @click="openStockModal(props.row.id)" icon="data_thresholding" />
                        <q-icon v-if="(props.row.house?.id && props.row.house?.isDeleted !== false) ||
                            (props.row.category?.id && props.row.category?.isDeleted !== false) ||
                            (props.row.subcategory?.id && props.row.subcategory?.isDeleted !== false) ||
                            (props.row.supplier?.id && props.row.supplier?.isDeleted !== false)" name="warning"
                            color="red">
                            <q-tooltip>
                                {{ getWarningMessage(props.row) }}
                            </q-tooltip>
                        </q-icon>



                    </q-td>

                </q-tr>
            </template>
        </q-table>

        <q-dialog v-model="editDialog" persistent>
            <q-card>
                <q-card-section>
                    <div class="text-h6">Modifier l'article</div>
                </q-card-section>
                <q-separator />
                <q-card-section class="q-gutter-md">
                    <div class="flex-row">
                        <q-input v-model="editingRow.name" label="Nom" required class="flex-item" />
                        <q-input v-model="editingRow.description" label="Description" required class="flex-item-long" />
                    </div>
                    <div class="flex-row">
                        <q-input v-model="editingRow.sellPrice" label="Prix de vente" type="number" required
                            class="flex-item" />
                        <q-input v-model="editingRow.buyPrice" label="Prix d'achat" type="number" required
                            class="flex-item" />
                        <q-input v-model="editingRow.cartonPrice" label="Prix en carton" type="number" required
                            class="flex-item" />
                    </div>
                    <div class="flex-row">
                        <q-input v-model="editingRow.wineYear" label="Année du vin" type="number" required
                            class="flex-item" />
                        <q-toggle v-model="editingRow.trending" label="Article tendance?" class="flex-item" />
                    </div>
                    <div class="flex-row">
                        <q-input v-model="editingRow.minOrderThreshold" label="Seuil min" type="number" required
                            class="flex-item" />
                        <q-toggle v-model="editingRow.autoOrder" label="Commande auto?" class="flex-item" />
                    </div>
                    <div class="flex-row">
                        <q-select v-model="editingRow.house" :options="filteredMaisons" option-value="id"
                            option-label="name" label="Maison" required class="flex-item" />
                        <q-select v-model="editingRow.category" :options="filteredCategories" option-value="id"
                            option-label="name" label="Famille" required class="flex-item" />
                    </div>
                    <div class="flex-row">
                        <q-select clearable v-model="editingRow.subcategory" :options="filteredSousCategories"
                            option-value="id" option-label="name" label="Sous-Famille" class="flex-item" />
                        <q-select clearable v-model="editingRow.supplier" :options="filteredFournisseurs"
                            option-value="id" option-label="companyName" label="Fournisseur" class="flex-item" />
                    </div>
                </q-card-section>
                <q-separator />
                <q-card-actions align="right">
                    <q-btn flat label="Annuler" v-close-popup />
                    <q-btn label="Sauvegarder" color="primary" @click="saveEdit" :disable="!isValid" />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <q-dialog v-model="deleteDialog" persistent>
            <q-card>
                <q-card-section>
                    <div class="text-h6">Confirmer la suppression</div>
                </q-card-section>
                <q-card-section>
                    Êtes-vous sûr de vouloir supprimer cet article ?
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn flat label="Annuler" v-close-popup />
                    <q-btn label="Supprimer" color="negative" @click="deleteArticle" />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <q-dialog v-model="createDialog" persistent>
            <q-card>
                <q-card-section>
                    <div class="text-h6">Ajouter un nouvel article</div>
                </q-card-section>
                <q-separator />
                <q-card-section class="q-gutter-md">
                    <div class="flex-row">
                        <q-input v-model="editingRow.name" label="Nom" required class="flex-item" />
                        <q-input v-model="editingRow.description" label="Description" required class="flex-item-long" />
                    </div>
                    <div class="flex-row">
                        <q-input v-model="editingRow.sellPrice" label="Prix de vente" type="number" required
                            class="flex-item" />
                        <q-input v-model="editingRow.buyPrice" label="Prix d'achat" type="number" required
                            class="flex-item" />
                        <q-input v-model="editingRow.cartonPrice" label="Prix en carton" type="number" required
                            class="flex-item" />
                    </div>
                    <div class="flex-row">
                        <q-input v-model="editingRow.wineYear" label="Année du vin" type="number" required
                            class="flex-item" />
                        <q-toggle v-model="editingRow.trending" label="Article tendance?" class="flex-item" />
                    </div>
                    <div class="flex-row">
                        <q-input v-model="editingRow.minOrderThreshold" label="Seuil min" type="number" required
                            class="flex-item" />
                        <q-toggle v-model="editingRow.autoOrder" label="Commande auto?" class="flex-item" />
                    </div>
                    <div class="flex-row">
                        <q-select v-model="editingRow.house" :options="filteredMaisons" option-value="id"
                            option-label="name" label="Maison" required class="flex-item" />
                        <q-select v-model="editingRow.category" :options="filteredCategories" option-value="id"
                            option-label="name" label="Famille" required class="flex-item" />
                    </div>
                    <div class="flex-row">
                        <q-select clearable v-model="editingRow.subcategory" :options="filteredSousCategories"
                            option-value="id" option-label="name" label="Sous-Famille" class="flex-item" />
                        <q-select clearable v-model="editingRow.supplier" :options="filteredFournisseurs"
                            option-value="id" option-label="companyName" label="Fournisseur" class="flex-item" />
                    </div>
                </q-card-section>
                <q-separator />
                <q-card-actions align="right">
                    <q-btn flat label="Annuler" v-close-popup />
                    <q-btn label="Ajouter" color="primary" @click="saveCreate" />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <q-dialog v-model="stockTrackingDialog" persistent class="custom-modal">
            <q-card style="max-width: 90vw; max-height: 95vh; overflow: none;">
                <q-card-section class="modal-content">
                    <suivi-stock :article-id="selectedArticleId" />
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn flat label="Fermer" color="primary" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>


    </q-page>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';
import SuiviStock from '../components/Articles/SuiviStock.vue';

export default {
    components: {
        SuiviStock
    },
    setup() {

        //  __   __   __ _   _ __  (_)   __ _  | |__   | |   ___   ___ 
        //  \ \ / /  / _` | | '__| | |  / _` | | '_ \  | |  / _ \ / __|
        //   \ V /  | (_| | | |    | | | (_| | | |_) | | | |  __/ \__ \
        //    \_/    \__,_| |_|    |_|  \__,_| |_.__/  |_|  \___| |___/

        const rows = ref([]);
        const $q = useQuasar();
        const visibleColumns = ref(['name', 'sellPrice', 'saveQuantity', 'houseName', 'categorieName', 'subcategorieName', 'supplierEntrepriseName']);
        const pagination = ref({
            rowsPerPage: 1000
        });
        const categories = ref([]);
        const sousCategories = ref([]);
        const maisons = ref([]);
        const fournisseurs = ref([]);

        const stockTrackingDialog = ref(false);
        const selectedArticleId = ref(null);

        const createDialog = ref(false);
        const editDialog = ref(false);
        const deleteDialog = ref(false);
        const articleToDelete = ref(null);

        const filter = ref('');
        const columns = ref([
            { name: 'name', required: true, label: 'Nom', align: 'left', field: row => row.name, sortable: true },
            { name: 'description', label: 'Description', align: 'left', field: row => row.description, sortable: true },
            { name: 'wineYear', label: 'Année du vin', align: 'left', field: row => row.wineYear, sortable: true },
            { name: 'sellPrice', label: 'Prix de vente', align: 'left', field: row => row.sellPrice, sortable: true },
            { name: 'buyPrice', label: "Prix d'achat", align: 'left', field: row => row.buyPrice, sortable: true },
            { name: 'cartonPrice', label: 'Prix en carton', align: 'left', field: row => row.cartonPrice, sortable: true },
            { name: 'saveQuantity', label: 'Stock', align: 'left', field: row => row.saveQuantity, sortable: true },
            { name: 'minOrderThreshold', label: 'Seuil min', align: 'left', field: row => row.minOrderThreshold, sortable: true },
            { name: 'autoOrder', label: 'Commande auto', align: 'left', field: row => row.autoOrder, sortable: true },
            { name: 'houseName', align: 'left', label: 'Maison', field: row => row.house?.isDeleted === false ? row.house?.name : '', sortable: true },
            { name: 'categorieName', align: 'left', label: 'Famille', field: row => row.category?.isDeleted === false ? row.category?.name : '', sortable: true },
            { name: 'subcategorieName', align: 'left', label: 'Sous-Famille', field: row => row.subcategory?.isDeleted === false ? row.subcategory?.name : '', sortable: true },
            { name: 'supplierEntrepriseName', align: 'left', label: 'Fournisseur', field: row => row.supplier?.isDeleted === false ? row.supplier?.companyName : '', sortable: true }
        ]);


        //       / ___|  / _ \  |  \/  | |  _ \  | | | | |_   _| | ____| |  _ \ 
        //      | |     | | | | | |\/| | | |_) | | | | |   | |   |  _|   | | | |
        //      | |___  | |_| | | |  | | |  __/  | |_| |   | |   | |___  | |_| |
        //       \____|  \___/  |_|  |_| |_|      \___/    |_|   |_____| |____/ 

        const filteredCategories = computed(() => {
            return categories.value.filter(category => category?.isDeleted === false);
        });

        const filteredSousCategories = computed(() => {
            return sousCategories.value.filter(sousCategorie => sousCategorie?.isDeleted === false);
        });

        const filteredMaisons = computed(() => {
            return maisons.value.filter(maison => maison?.isDeleted === false);
        });

        const filteredFournisseurs = computed(() => {
            return fournisseurs.value.filter(fournisseur => fournisseur?.isDeleted === false);
        });

        const isValid = computed(() => {
            return editingRow.value.name &&
                editingRow.value.description &&
                editingRow.value.wineYear &&
                editingRow.value.sellPrice &&
                editingRow.value.buyPrice &&
                editingRow.value.cartonPrice &&
                editingRow.value.minOrderThreshold &&
                editingRow.value.house &&  
                editingRow.value.trending !== null &&
                editingRow.value.autoOrder !== null &&
                editingRow.value.category !== null &&
                editingRow.value.supplier !== null &&
                editingRow.value.house !== null;  // Vérifiez la présence de l'objet categorie
        });

        //      __  __    ___    _   _   _   _   _____   _____   ____  
        //     |  \/  |  / _ \  | | | | | \ | | |_   _| | ____| |  _ \ 
        //     | |\/| | | | | | | | | | |  \| |   | |   |  _|   | | | |
        //     | |  | | | |_| | | |_| | | |\  |   | |   | |___  | |_| |
        //     |_|  |_|  \___/   \___/  |_| \_|   |_|   |_____| |____/ 


        onMounted(() => {
            fetchArticles();
            fetchData();
        });

        //      _____    ___    _   _    ____   _____   ___    ___    _   _   ____  
        //     |  ___|  / _ \  | \ | |  / ___| |_   _| |_ _|  / _ \  | \ | | / ___| 
        //     | |_    | | | | |  \| | | |       | |    | |  | | | | |  \| | \___ \ 
        //     |  _|   | |_| | | |\  | | |___    | |    | |  | |_| | | |\  |  ___) |
        //     |_|      \___/  |_| \_|  \____|   |_|   |___|  \___/  |_| \_| |____/ 


        const openStockModal = (articleId) => {
            selectedArticleId.value = articleId;
            stockTrackingDialog.value = true;
        };

        const fetchArticles = async () => {
            try {
                const response = await axios.get('http://localhost:8080/items');
                rows.value = response.data.filter(row => row.isDeleted === false);

            } catch (error) {
                console.error('Erreur lors de la récupération des articles', error);
            }
        };

        const fetchData = async () => {
            try {
                const [categoriesResponse, sousCategoriesResponse, maisonsResponse, fournisseursResponse] = await Promise.all([
                    axios.get('http://localhost:8080/categories'),
                    axios.get('http://localhost:8080/subcategories'),
                    axios.get('http://localhost:8080/houses'),
                    axios.get('http://localhost:8080/suppliers')
                ]);

                categories.value = categoriesResponse.data;
                sousCategories.value = sousCategoriesResponse.data;
                maisons.value = maisonsResponse.data;
                fournisseurs.value = fournisseursResponse.data;

            } catch (error) {
                console.error('Erreur lors de la récupération des données', error);
            }
        };

        const getWarningMessage = (row) => {
            let messages = [];
            if (row.house?.isDeleted !== false) messages.push("Maison liée à l'article supprimée");
            if (row.category?.isDeleted !== false) messages.push("Catégorie liée à l'article supprimée");
            if (row.subcategory?.isDeleted !== false) messages.push("Sous-catégorie liée à l'article supprimée");
            if (row.supplier?.isDeleted !== false) messages.push("Fournisseur lié à l'article supprimé");
            return messages.join(", ");
        };

        const openCreateModal = () => {
            editingRow.value = {
                id: null,
                name: '',
                description: '',
                wineYear: null,
                sellPrice: null,
                buyPrice: null,
                cartonPrice: null,
                saveQuantity: null,
                minOrderThreshold: null,
                trending: false,
                autoOrder: false,
                house: null,
                category: '',
                subcategory: null,
                supplier: '',              
            };
            createDialog.value = true;
        };

        const saveCreate = async () => {
            const finalData = {
                name: editingRow.value.name,
                description: editingRow.value.description,
                wineYear: editingRow.value.wineYear,
                sellPrice: editingRow.value.sellPrice,
                buyPrice: editingRow.value.buyPrice,
                cartonPrice: editingRow.value.cartonPrice,
                trending: editingRow.value.trending,
                saveQuantity: editingRow.value.saveQuantity,
                minOrderThreshold: editingRow.value.minOrderThreshold,
                autoOrder: editingRow.value.autoOrder,
                house: editingRow.value.house,
                category: editingRow.value.category,
                subcategory: editingRow.value.subcategory,
                supplier: editingRow.value.supplier,
            };
            try {
                const response = await axios.post(`http://localhost:8080/items`, finalData);
                if (response.status === 201) {
                    $q.notify({
                        color: 'green-4',
                        textColor: 'white',
                        icon: 'check',
                        message: 'Article ajouté avec succès!'
                    });
                    
                } else {
                    $q.notify({
                        color: 'red-4',
                        textColor: 'white',
                        icon: 'error',
                        message: 'Échec de l\'ajout de l\'article!'
                    });
                }
            } catch (error) {
                console.error('Erreur lors de l\'ajout de l\'article', error);
                $q.notify({
                    color: 'red-4',
                    textColor: 'white',
                    icon: 'error',
                    message: 'Erreur lors de l\'ajout de l\'article'
                });
            }
            createDialog.value = false;
            fetchArticles();
        };


        const editingRow = ref({
            id: null, // ID de l'article
            name: '',
            description: '',
            wineYear: null,
            sellPrice: null,
            buyPrice: null,
            cartonPrice: null,
            saveQuantity: null,
            minOrderThreshold: null,
            tendance: false,
            autoOrder: false,
            maison_id: null, // ID de la maison
            categorie_id: null, // ID de la catégorie
            souscategorie_id: null, // ID de la sous-catégorie
            fournisseur_id: null, // ID du fournisseur
        });

        const openEditModal = (row) => {
            editingRow.value = {
                ...row,
                tendance: !!row.trending,
                commande_auto: !!row.orderAuto,
                maison: row.house?.isDeleted === false ? maisons.value.find(m => m.id === row.house?.id) : null,
                categorie: row.category?.isDeleted === false ? categories.value.find(c => c.id === row.category?.id) : null,
                souscategorie: row.subcategory?.isDeleted === false ? sousCategories.value.find(sc => sc.id === row.subcategory?.id) : null,
                fournisseur: row.supplier?.isDeleted === false ? fournisseurs.value.find(f => f.id === row.supplier?.id) : null
            };
            editDialog.value = true;
        };



        const saveEdit = async () => {
            const finalData = {
                id: editingRow.value.id,
                name: editingRow.value.name,
                description: editingRow.value.description,
                wineYear: editingRow.value.wineYear,
                sellPrice: editingRow.value.sellPrice,
                buyPrice: editingRow.value.buyPrice,
                cartonPrice: editingRow.value.cartonPrice,
                trending: editingRow.value.trending,
                saveQuantity: editingRow.value.saveQuantity,
                minOrderThreshold: editingRow.value.minOrderThreshold,
                autoOrder: editingRow.value.autoOrder,
                house: editingRow.value.house,
                category: editingRow.value.category,
                subcategory: editingRow.value.subcategory,
                supplier: editingRow.value.supplier,
            };
            try {
                const response = await axios.put(`http://localhost:8080/items/${finalData.id}`, finalData);

                if (response.data.success) {

                    $q.notify({
                        color: 'green-4',
                        textColor: 'white',
                        icon: 'check',
                        message: 'Modification réussie!'
                    });

                    fetchArticles();
                } else {
                    $q.notify({
                        color: 'red-4',
                        textColor: 'white',
                        icon: 'error',
                        message: 'Modification échouée!'
                    });
                }
            } catch (error) {
                console.error('Erreur lors de la mise à jour de l\'article', error);
                $q.notify({
                    color: 'red-4',
                    textColor: 'white',
                    icon: 'error',
                    message: 'Erreur lors de la mise à jour de l\'article'
                });
            }

            editDialog.value = false;
        };

        // Fonction pour ouvrir la boîte de dialogue de suppression
        const openDeleteModal = (articleId) => {
            articleToDelete.value = articleId;
            deleteDialog.value = true;
        };

        // Fonction pour supprimer l'article
        const deleteArticle = async () => {
            try {
                const response = await axios.put(`http://localhost:3000/items/${articleToDelete.value}/delete`);

                if (response.data.success) {
                    $q.notify({
                        color: 'green-4',
                        textColor: 'white',
                        icon: 'check',
                        message: 'Article supprimé avec succès!'
                    });

                    fetchArticles();
                } else {
                    $q.notify({
                        color: 'red-4',
                        textColor: 'white',
                        icon: 'error',
                        message: 'Échec de la suppression de l\'article!'
                    });
                }
            } catch (error) {
                console.error('Erreur lors de la suppression de l\'article', error);
                $q.notify({
                    color: 'red-4',
                    textColor: 'white',
                    icon: 'error',
                    message: 'Erreur lors de la suppression de l\'article'
                });
            }

            deleteDialog.value = false;
        };


        return {
            rows,
            columns,
            visibleColumns,
            pagination,
            filter,
            categories,
            sousCategories,
            maisons,
            fournisseurs,
            editDialog,
            editingRow,
            openEditModal,
            saveEdit,
            isValid,
            deleteDialog,
            openDeleteModal,
            deleteArticle,
            filteredFournisseurs,
            filteredCategories,
            filteredMaisons,
            filteredSousCategories,
            getWarningMessage,
            openCreateModal,
            saveCreate,
            createDialog,
            stockTrackingDialog,
            openStockModal,
            selectedArticleId
        };
    },
};
</script>

<style scoped>
.flex-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
}

.flex-item {
    flex: 1;
    margin-right: 10px;
}

.flex-item-long {
    flex: 2;
    margin-right: 10px;
}

.custom-modal .q-card {
    width: 90vw;
    height: 95vh;
    overflow: none;
}

.modal-content {
    max-height: calc(95vh - 50px);
    overflow: none;
}
</style>