<template>
    <q-page class="q-pa-sm" style="overflow: none;">
        <div v-if="chartDataAvailable" id="chart-container" style="height: 90vh; width: 96%;">
            <div id="chart"></div>
        </div>
        <div v-else>
            <p style="color: red;">Pas de données disponibles</p>
        </div>
    </q-page>
</template>
  
<script>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import axios from 'axios';
import ApexCharts from 'apexcharts';
import { nextTick } from 'vue';

export default {
    props: {
        articleId: {
            type: [String, Number],
            required: true
        }
    },
    setup(props) {
        const chart = ref(null);
        const types = ref([]);
        const chartDataAvailable = ref(false);

        const setChartHeight = () => {
            const container = document.getElementById("chart-container");
            if (chart.value && container) {
                const newHeight = container.clientHeight;
                const newWidth = container.clientWidth;
                chart.value.updateOptions({
                    chart: {
                        height: newHeight,
                        width: newWidth
                    }
                });
            }
        };

        const loadChartData = async () => {
            const res = await axios.get(`http://localhost:8080/stocktracking/item/${props.articleId}`)
                .catch(error => {
                    console.error("Erreur dans l'axios:", error);
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
            types.value = stockData.map(x => x.transactionType.description);

            const categories = stockData.map(x => {
                let date = new Date(x.transactionDate);
                return `${date.toLocaleDateString()} ${date.getHours()}:${date.getMinutes()}`;
            });

            const seriesData = stockData.map(x => x.quantityAfterTransaction);
            const seriesDataBefore = stockData.map(x => x.quantityBeforeTransaction);
            const seriesTransaction = stockData.map(x => x.transactionQuantity);

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

        onMounted(() => {
            loadChartData();
            window.addEventListener("resize", setChartHeight);
        });

        onUnmounted(() => {
            if (chart.value) {
                chart.value.destroy();
            }
            window.removeEventListener("resize", setChartHeight);
        });

        watch(() => props.articleId, () => {
            loadChartData();
        });

        return {
            chart,
            chartDataAvailable
        };
    },
};
</script>
  