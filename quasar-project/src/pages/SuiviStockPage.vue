<template>
    <q-page class="q-pa-sm">
        <q-select class="q-mb-sm" v-model="selectedArticle" :options="articles" option-value="id" option-label="nom"
            label="Choisissez un article" @update:modelValue="loadChartData($event)" />
        <div v-if="chartDataAvailable" id="chart-container" style="height: calc(92vh - 100px);">
            <div id="chart"></div>
        </div>

        <div v-else>
            <p style="color: red;">Pas de données disponibles</p>
        </div>

    </q-page>
</template>
  
<script>
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import ApexCharts from 'apexcharts';
import { nextTick } from 'vue';

export default {
    setup() {
        const articles = ref([]);
        const chart = ref(null);
        const selectedArticle = ref(null);
        const types = ref([]);
        const chartDataAvailable = ref(false);


        const setChartHeight = () => {
            const container = document.getElementById("chart-container");
            if (chart.value && container) {
                chart.value.updateOptions({
                    chart: {
                        height: container.clientHeight - 10
                    }
                });
            }
        };

        const loadChartData = async (articleId) => {
            const realArticleId = articleId.id ? articleId.id : articleId;

            
            const res = await axios.get(`http://localhost:3000/stockData/${realArticleId}`)
                .catch(error => {
                    console.error("Error fetching stockData:", error);
                    return null;
                });

            
            if (!res || !res.data) {
                chartDataAvailable.value = false;
                if (chart.value) {
                    chart.value.destroy();  
                    chart.value = null;  
                }
                return;
            }

            const stockData = res.data;
            types.value = stockData.map(x => x.type_transaction);

           
            const categories = stockData.map(x => {
                let date = new Date(x.date_heure_transaction);
                return `${date.toLocaleDateString()} ${date.getHours()}:${date.getMinutes()}`;
            });

            const seriesData = stockData.map(x => x.quantite_apres_transaction);
            const seriesDataBefore = stockData.map(x => x.quantite_avant_transaction);
            const seriesTransaction = stockData.map(x => x.quantite_transaction);

            
            if (seriesData.length > 0) {
                chartDataAvailable.value = true;

                if (!chart.value) {
                    await nextTick();

                    chart.value = new ApexCharts(document.querySelector("#chart"), {
                        chart: {
                            type: 'line',  
                            height: 'auto'
                        },
                        series: [],
                        xaxis: { categories: [] },
                        dataLabels: {
                            enabled: true  
                        },
                        title: {
                            text: 'Stock',
                            align: 'left'
                        },
                        tooltip: {
                            custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                                return (
                                    '<div style="padding: 10px;">' +
                                    '<span>Stock après transaction: ' + series[seriesIndex][dataPointIndex] + '</span><br />' +
                                    '<span>Stock avant transaction: ' + seriesDataBefore[dataPointIndex] + '</span><br />' + 
                                    '<span>Quantité transaction: ' + seriesTransaction[dataPointIndex] + '</span><br />' +  
                                    '<span>Type: ' + types.value[dataPointIndex] + '</span>' +
                                    '</div>'
                                );
                            }
                        }
                    });

                    
                    chart.value.render();
                    setChartHeight();
                }

                
                chart.value.updateOptions({
                    xaxis: { categories },
                    series: [{ name: 'Stock', data: seriesData }]
                });
            } else {
                chartDataAvailable.value = false;
                if (chart.value) {
                    chart.value.destroy(); 
                    chart.value = null;  
                }
            }
        };


        onMounted(async () => {
            const res = await axios.get('http://localhost:3000/items');
            articles.value = res.data.filter(row => row.supprime === 0);
        });

        onUnmounted(() => {
            window.removeEventListener("resize", setChartHeight);
        });

        return {
            articles,
            loadChartData,
            chart,
            selectedArticle,
            setChartHeight,
            chartDataAvailable
        };
    },
};
</script>