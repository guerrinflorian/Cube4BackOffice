<template>
    <q-page>
        <q-btn label="Ajouter un article" icon="add" color="primary" class="q-mb-md ma10 q-ma-sm" @click="openCreateModal" />
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
                        <q-icon v-if="(props.row.maison_id && props.row.maison_supprime !== 0) ||
                            (props.row.categorie_id && props.row.categorie_supprime !== 0) ||
                            (props.row.souscategorie_id && props.row.souscategorie_supprime !== 0) ||
                            (props.row.fournisseur_id && props.row.fournisseur_supprime !== 0)" name="warning"
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
                        <q-input v-model="editingRow.nom" label="Nom" required class="flex-item" />
                        <q-input v-model="editingRow.description" label="Description" required class="flex-item-long" />
                    </div>
                    <div class="flex-row">
                        <q-input v-model="editingRow.prix_vente" label="Prix de vente" type="number" required
                            class="flex-item" />
                        <q-input v-model="editingRow.prix_achat" label="Prix d'achat" type="number" required
                            class="flex-item" />
                        <q-input v-model="editingRow.prix_carton" label="Prix en carton" type="number" required
                            class="flex-item" />
                    </div>
                    <div class="flex-row">
                        <q-input v-model="editingRow.annee_vin" label="Année du vin" type="number" required
                            class="flex-item" />
                        <q-toggle v-model="editingRow.tendance" label="Article tendance?" class="flex-item" />
                    </div>
                    <div class="flex-row">
                        <q-input v-model="editingRow.seuil_stock_min" label="Seuil min" type="number" required
                            class="flex-item" />
                        <q-toggle v-model="editingRow.commande_auto" label="Commande auto?" class="flex-item" />
                    </div>
                    <div class="flex-row">
                        <q-select v-model="editingRow.maison" :options="filteredMaisons" option-value="id"
                            option-label="nom" label="Maison" required class="flex-item" />
                        <q-select v-model="editingRow.categorie" :options="filteredCategories" option-value="id"
                            option-label="nom" label="Famille" required class="flex-item" />
                    </div>
                    <div class="flex-row">
                        <q-select clearable v-model="editingRow.souscategorie" :options="filteredSousCategories"
                            option-value="id" option-label="nom" label="Sous-Famille" class="flex-item" />
                        <q-select clearable v-model="editingRow.fournisseur" :options="filteredFournisseurs"
                            option-value="id" option-label="nom_entreprise" label="Fournisseur" class="flex-item" />
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
                        <q-input v-model="editingRow.nom" label="Nom" required class="flex-item" />
                        <q-input v-model="editingRow.description" label="Description" required class="flex-item-long" />
                    </div>
                    <div class="flex-row">
                        <q-input v-model="editingRow.prix_vente" label="Prix de vente" type="number" required
                            class="flex-item" />
                        <q-input v-model="editingRow.prix_achat" label="Prix d'achat" type="number" required
                            class="flex-item" />
                        <q-input v-model="editingRow.prix_carton" label="Prix en carton" type="number" required
                            class="flex-item" />
                    </div>
                    <div class="flex-row">
                        <q-input v-model="editingRow.annee_vin" label="Année du vin" type="number" required
                            class="flex-item" />
                        <q-toggle v-model="editingRow.tendance" label="Article tendance?" class="flex-item" />
                    </div>
                    <div class="flex-row">
                        <q-input v-model="editingRow.seuil_stock_min" label="Seuil min" type="number" required
                            class="flex-item" />
                        <q-toggle v-model="editingRow.commande_auto" label="Commande auto?" class="flex-item" />
                    </div>
                    <div class="flex-row">
                        <q-select v-model="editingRow.maison" :options="filteredMaisons" option-value="id"
                            option-label="nom" label="Maison" required class="flex-item" />
                        <q-select v-model="editingRow.categorie" :options="filteredCategories" option-value="id"
                            option-label="nom" label="Famille" required class="flex-item" />
                    </div>
                    <div class="flex-row">
                        <q-select clearable v-model="editingRow.souscategorie" :options="filteredSousCategories"
                            option-value="id" option-label="nom" label="Sous-Famille" class="flex-item" />
                        <q-select clearable v-model="editingRow.fournisseur" :options="filteredFournisseurs"
                            option-value="id" option-label="nom_entreprise" label="Fournisseur" class="flex-item" />
                    </div>
                </q-card-section>
                <q-separator />
                <q-card-actions align="right">
                    <q-btn flat label="Annuler" v-close-popup />
                    <q-btn label="Ajouter" color="primary" @click="saveCreate" :disable="!isValid" />
                </q-card-actions>
            </q-card>
        </q-dialog>



    </q-page>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';

export default {
    setup() {

        //  __   __   __ _   _ __  (_)   __ _  | |__   | |   ___   ___ 
        //  \ \ / /  / _` | | '__| | |  / _` | | '_ \  | |  / _ \ / __|
        //   \ V /  | (_| | | |    | | | (_| | | |_) | | | |  __/ \__ \
        //    \_/    \__,_| |_|    |_|  \__,_| |_.__/  |_|  \___| |___/

        const rows = ref([]);
        const $q = useQuasar();
        const visibleColumns = ref(['nom', 'prix_vente', 'quantite_enregistree', 'maison_nom', 'categorie_nom', 'souscategorie_nom', 'fournisseur_nom_entreprise']);
        const pagination = ref({
            rowsPerPage: 1000
        });
        const categories = ref([]);
        const sousCategories = ref([]);
        const maisons = ref([]);
        const fournisseurs = ref([]);

        const createDialog = ref(false);
        const editDialog = ref(false);
        const deleteDialog = ref(false);
        const articleToDelete = ref(null);

        const filter = ref('');
        const columns = ref([
            { name: 'nom', required: true, label: 'Nom', align: 'left', field: row => row.nom, sortable: true },
            { name: 'description', label: 'Description', align: 'left', field: row => row.description, sortable: true },
            { name: 'annee_vin', label: 'Année du vin', align: 'left', field: row => row.annee_vin, sortable: true },
            { name: 'prix_vente', label: 'Prix de vente', align: 'left', field: row => row.prix_vente, sortable: true },
            { name: 'prix_achat', label: "Prix d'achat", align: 'left', field: row => row.prix_achat, sortable: true },
            { name: 'prix_carton', label: 'Prix en carton', align: 'left', field: row => row.prix_carton, sortable: true },
            { name: 'quantite_enregistree', label: 'Stock', align: 'left', field: row => row.quantite_enregistree, sortable: true },
            { name: 'seuil_stock_min', label: 'Seuil min', align: 'left', field: row => row.seuil_stock_min, sortable: true },
            { name: 'commande_auto', label: 'Commande auto', align: 'left', field: row => row.commande_auto, sortable: true },
            { name: 'maison_nom', align: 'left', label: 'Maison', field: row => row.maison_supprime === 0 ? row.maison_nom : '', sortable: true },
            { name: 'categorie_nom', align: 'left', label: 'Famille', field: row => row.categorie_supprime === 0 ? row.categorie_nom : '', sortable: true },
            { name: 'souscategorie_nom', align: 'left', label: 'Sous-Famille', field: row => row.souscategorie_supprime === 0 ? row.souscategorie_nom : '', sortable: true },
            { name: 'fournisseur_nom_entreprise', align: 'left', label: 'Fournisseur', field: row => row.fournisseur_supprime === 0 ? row.fournisseur_nom_entreprise : '', sortable: true }
        ]);


        //       / ___|  / _ \  |  \/  | |  _ \  | | | | |_   _| | ____| |  _ \ 
        //      | |     | | | | | |\/| | | |_) | | | | |   | |   |  _|   | | | |
        //      | |___  | |_| | | |  | | |  __/  | |_| |   | |   | |___  | |_| |
        //       \____|  \___/  |_|  |_| |_|      \___/    |_|   |_____| |____/ 

        const filteredCategories = computed(() => {
            return categories.value.filter(category => category.supprime === 0);
        });

        const filteredSousCategories = computed(() => {
            return sousCategories.value.filter(sousCategorie => sousCategorie.supprime === 0);
        });

        const filteredMaisons = computed(() => {
            return maisons.value.filter(maison => maison.supprime === 0);
        });

        const filteredFournisseurs = computed(() => {
            return fournisseurs.value.filter(fournisseur => fournisseur.supprime === 0);
        });

        const isValid = computed(() => {
            console.log(editingRow.value)
            return editingRow.value.nom &&
                editingRow.value.description &&
                editingRow.value.annee_vin &&
                editingRow.value.prix_vente &&
                editingRow.value.prix_achat &&
                editingRow.value.prix_carton &&
                editingRow.value.seuil_stock_min &&
                editingRow.value.maison &&  // Vérifiez la présence de l'objet maison
                editingRow.value.tendance !== null &&
                editingRow.value.commande_auto !== null &&
                editingRow.value.categorie;  // Vérifiez la présence de l'objet categorie
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




        const fetchArticles = async () => {
            try {
                const response = await axios.get('http://localhost:3000/items');
                rows.value = response.data.filter(row => row.supprime === 0);
            } catch (error) {
                console.error('Erreur lors de la récupération des articles', error);
            }
        };

        const fetchData = async () => {
            try {
                const [categoriesResponse, sousCategoriesResponse, maisonsResponse, fournisseursResponse] = await Promise.all([
                    axios.get('http://localhost:3000/families'),
                    axios.get('http://localhost:3000/sousfamilies'),
                    axios.get('http://localhost:3000/maisons'),
                    axios.get('http://localhost:3000/suppliers')
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
            if (row.maison_supprime !== 0) messages.push("Maison liée à l'article supprimée");
            if (row.categorie_supprime !== 0) messages.push("Catégorie liée à l'article supprimée");
            if (row.souscategorie_supprime !== 0) messages.push("Sous-catégorie liée à l'article supprimée");
            if (row.fournisseur_supprime !== 0) messages.push("Fournisseur lié à l'article supprimé");
            return messages.join(", ");
        };

        const openCreateModal = () => {
            editingRow.value = {
                id: null,
                nom: '',
                description: '',
                annee_vin: null,
                prix_vente: null,
                prix_achat: null,
                prix_carton: null,
                quantite_enregistree: null,
                seuil_stock_min: null,
                tendance: false,
                commande_auto: false,
                maison_id: null,
                maison_nom: '',
                categorie_id: null,
                categorie_nom: '',
                souscategorie_id: null,
                souscategorie_nom: '',
                fournisseur_id: null,
                fournisseur_nom_entreprise: '',
            };
            createDialog.value = true;
        };

        const saveCreate = async () => {
            const finalData = {
                nom: editingRow.value.nom,
                description: editingRow.value.description,
                annee_vin: editingRow.value.annee_vin,
                prix_vente: editingRow.value.prix_vente,
                prix_achat: editingRow.value.prix_achat,
                prix_carton: editingRow.value.prix_carton,
                tendance: editingRow.value.tendance,
                quantite_enregistree: editingRow.value.quantite_enregistree,
                seuil_stock_min: editingRow.value.seuil_stock_min,
                commande_auto: editingRow.value.commande_auto,
                maison_id: editingRow.value.maison.id,
                categorie_id: editingRow.value.categorie.id,
                souscategorie_id: editingRow.value.souscategorie ? editingRow.value.souscategorie.id : null,
                fournisseur_id: editingRow.value.fournisseur ? editingRow.value.fournisseur.id : null
            };
            try {
                const response = await axios.post(`http://localhost:3000/items`, finalData);

                if (response.data.success) {
                    $q.notify({
                        color: 'green-4',
                        textColor: 'white',
                        icon: 'check',
                        message: 'Article ajouté avec succès!'
                    });
                    fetchArticles();
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
        };


        const editingRow = ref({
            id: null, // ID de l'article
            nom: '',
            description: '',
            annee_vin: null,
            prix_vente: null,
            prix_achat: null,
            prix_carton: null,
            quantite_enregistree: null,
            seuil_stock_min: null,
            tendance: false,
            commande_auto: false,
            maison_id: null, // ID de la maison
            maison_nom: '', // Nom de la maison
            categorie_id: null, // ID de la catégorie
            categorie_nom: '', // Nom de la catégorie
            souscategorie_id: null, // ID de la sous-catégorie
            souscategorie_nom: '', // Nom de la sous-catégorie
            fournisseur_id: null, // ID du fournisseur
            fournisseur_nom_entreprise: '', // Nom de l'entreprise du fournisseur
        });

        const openEditModal = (row) => {
            editingRow.value = {
                ...row,
                tendance: !!row.tendance,
                commande_auto: !!row.commande_auto,
                maison: row.maison_supprime === 0 ? maisons.value.find(m => m.id === row.maison_id) : null,
                categorie: row.categorie_supprime === 0 ? categories.value.find(c => c.id === row.categorie_id) : null,
                souscategorie: row.souscategorie_supprime === 0 ? sousCategories.value.find(sc => sc.id === row.souscategorie_id) : null,
                fournisseur: row.fournisseur_supprime === 0 ? fournisseurs.value.find(f => f.id === row.fournisseur_id) : null
            };
            editDialog.value = true;
        };



        const saveEdit = async () => {
            const finalData = {
                id: editingRow.value.id,
                nom: editingRow.value.nom,
                description: editingRow.value.description,
                annee_vin: editingRow.value.annee_vin,
                prix_vente: editingRow.value.prix_vente,
                prix_achat: editingRow.value.prix_achat,
                prix_carton: editingRow.value.prix_carton,
                tendance: editingRow.value.tendance,
                quantite_enregistree: editingRow.value.quantite_enregistree,
                seuil_stock_min: editingRow.value.seuil_stock_min,
                commande_auto: editingRow.value.commande_auto,
                maison_id: editingRow.value.maison.id,
                categorie_id: editingRow.value.categorie.id,
                souscategorie_id: editingRow.value.souscategorie ? editingRow.value.souscategorie.id : null,
                fournisseur_id: editingRow.value.fournisseur ? editingRow.value.fournisseur.id : null
            };
            try {
                const response = await axios.put(`http://localhost:3000/items/${finalData.id}`, finalData);

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
            createDialog
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
}</style>