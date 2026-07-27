<template>
  <div class="main-contributions p-4 md:p-6">
    <header class="pb-4 text-start">
      <h2>{{ t('cloud.statistics') }}</h2>
      <p class="mt-1 text-sm text-[var(--text-color-light)]">
        {{ t('cloud.statistics-subtitle') }}
      </p>
    </header>

    <div v-if="error" class="mb-4">
      <Message severity="error" :closable="false">{{ error }}</Message>
    </div>

    <div v-if="loading" class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <template #content>
          <Skeleton height="300px" />
        </template>
      </Card>
      <Card>
        <template #content>
          <Skeleton height="300px" />
        </template>
      </Card>
    </div>

    <div v-else>
      <div class="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <template #header>
            <div class="px-4 pt-4">
              <h2 class="text-lg font-semibold">{{ t('cloud.dimensions-overview') }}</h2>
            </div>
          </template>
          <template #content>
            <div v-if="radarOptions.xaxis && radarOptions.xaxis.categories.length > 0">
              <VueApexCharts
                :key="apexMode"
                type="radar"
                height="300"
                :options="radarOptions"
                :series="radarSeries"
              />
            </div>
            <div v-else class="flex h-64 items-center justify-center">
              <p style="color: var(--p-text-muted-color)">{{ t('cloud.no-data') }}</p>
            </div>
          </template>
        </Card>

        <div class="grid grid-cols-1 content-start gap-3 sm:grid-cols-2">
          <Card
            v-for="dim in dimensionSummary"
            :key="dim.id"
            class="cursor-pointer transition-all hover:shadow-md"
            :class="{ 'ring-2': selectedDimensionId === dim.id }"
            :style="selectedDimensionId === dim.id ? 'ring-color: var(--p-primary-color)' : ''"
            @click="selectDimension(dim.id)"
          >
            <template #content>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-[var(--text-color-light)]">
                    {{ dim.name }}
                  </p>
                  <p class="mt-1 text-2xl font-bold text-(--primary-color)">
                    {{ dim.total.toLocaleString() }}
                  </p>
                  <p class="mt-1 text-xs text-(--text-color-light)">
                    {{ t('cloud.total-points') }}
                  </p>
                </div>
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-full"
                  :style="`background-color: ${dim.color}22; color: ${dim.color}`"
                >
                  <font-awesome-icon :icon="['fas', dim.icon]" />
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>

      <Card>
        <template #header>
          <div class="flex flex-col gap-3 px-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 class="text-lg font-semibold">{{ t('cloud.sensor-contribution') }}</h2>
            <Select
              v-model="selectedDimensionId"
              :options="dimensionOptions"
              option-label="name"
              option-value="id"
              :placeholder="t('cloud.select-dimension')"
              class="w-full sm:w-64"
              @change="onDimensionChange"
            />
          </div>
        </template>
        <template #content>
          <div v-if="loadingTreemap" class="flex h-48 items-center justify-center">
            <ProgressSpinner style="width: 40px; height: 40px" />
          </div>
          <div v-else-if="treemapSeries.length > 0 && hasTreemapData">
            <VueApexCharts
              :key="apexMode"
              :type="treemapChartType"
              height="350"
              :options="treemapOptions"
              :series="treemapSeries"
            />
          </div>
          <div v-else class="flex h-48 items-center justify-center">
            <p style="color: var(--p-text-muted-color)">{{ t('cloud.no-data') }}</p>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useChartTheme } from '@/composables/useChartTheme'
import { useTheme } from '@/composables/useTheme'
import VueApexCharts from 'vue3-apexcharts'
import Card from 'primevue/card'
import Select from 'primevue/select'
import Skeleton from 'primevue/skeleton'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import {
  getCurrentPlayer,
  getPlayerDimensionTotals,
  getAllDimensions,
  getEndpointContributionForDimension,
  type Player,
  type DimensionTotal,
  type Dimension,
  type EndpointContributionSeries
} from '@/api/cloudApi'

const { t } = useI18n()
const { apexMode, textColor } = useChartTheme()
const { isDark } = useTheme()

// vue3-apexcharts' type union omits 'treemap', though apexcharts supports it
const treemapChartType = 'treemap' as unknown as 'heatmap'

const loading = ref(true)
const loadingTreemap = ref(false)
const error = ref<string | null>(null)

const player = ref<Player | null>(null)
const dimensionTotals = ref<DimensionTotal[]>([])
const dimensions = ref<Dimension[]>([])
const treemapSeries = ref<EndpointContributionSeries[]>([])
const selectedDimensionId = ref<number | null>(null)

// Dimension icons/colors for cards
const DIM_META: Record<string, { icon: string; color: string }> = {
  Cognitiva: { icon: 'brain', color: '#FA5E15' },
  Afectiva: { icon: 'heart', color: '#e74c3c' },
  Lingüística: { icon: 'language', color: '#3498db' },
  Social: { icon: 'users', color: '#2ecc71' },
  Física: { icon: 'person-running', color: '#9b59b6' }
}

const dimensionSummary = computed(() =>
  dimensionTotals.value.map((dt) => {
    const meta = DIM_META[dt.attributes.name] ?? { icon: 'chart-bar', color: '#FA5E15' }
    return {
      id: dt.attributes_id_attributes,
      name: dt.attributes.name,
      total: dt.total_count,
      ...meta
    }
  })
)

const dimensionOptions = computed(() =>
  dimensions.value.map((d) => ({ id: d.id_attributes, name: d.name }))
)

const radarSeries = computed(() => [
  {
    name: t('cloud.profile'),
    data: dimensionTotals.value.map((dt) => dt.total_count)
  }
])

const radarOptions = computed(() => ({
  chart: {
    type: 'radar' as const,
    toolbar: { show: false },
    background: 'transparent',
    foreColor: textColor.value,
    theme: { mode: apexMode.value }
  },
  colors: ['#FA5E15'],
  xaxis: {
    categories: dimensionTotals.value.map((dt) => dt.attributes.name),
    labels: {
      style: {
        colors: dimensionTotals.value.map(() => textColor.value),
        fontSize: '13px'
      }
    }
  },
  yaxis: { show: false },
  markers: { size: 4 },
  fill: { opacity: 0.25 },
  stroke: { width: 2 },
  plotOptions: {
    radar: {
      polygons: {
        strokeColors: isDark.value ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
        connectorColors: isDark.value ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'
      }
    }
  },
  tooltip: {
    theme: 'dark',
    y: {
      formatter: (val: number) => val.toLocaleString() + ' pts'
    }
  }
}))

const treemapOptions = computed(() => ({
  chart: {
    type: 'treemap' as const,
    toolbar: { show: false },
    background: 'transparent',
    foreColor: textColor.value
  },
  title: { text: '' },
  legend: { show: true },
  tooltip: {
    theme: 'dark',
    y: {
      formatter: (val: number) => val.toLocaleString() + ' pts'
    }
  },
  colors: ['#FA5E15', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f39c12']
}))

const hasTreemapData = computed(() => treemapSeries.value.some((s) => s.data && s.data.length > 0))

async function loadTreemap(attrId: number) {
  if (!player.value) return
  loadingTreemap.value = true
  try {
    treemapSeries.value = await getEndpointContributionForDimension(player.value.id_players, attrId)
  } catch (e) {
    console.warn('[Statistics] Failed to load treemap data', e)
    treemapSeries.value = []
  } finally {
    loadingTreemap.value = false
  }
}

async function selectDimension(id: number) {
  selectedDimensionId.value = id
  await loadTreemap(id)
}

async function onDimensionChange() {
  if (selectedDimensionId.value) {
    await loadTreemap(selectedDimensionId.value)
  }
}

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    player.value = await getCurrentPlayer()
    const [totals, dims] = await Promise.all([
      getPlayerDimensionTotals(player.value.id_players),
      getAllDimensions()
    ])
    dimensionTotals.value = totals
    dimensions.value = dims

    // Select first dimension by default
    const firstTotal = totals[0]
    if (firstTotal) {
      selectedDimensionId.value = firstTotal.attributes_id_attributes
      await loadTreemap(firstTotal.attributes_id_attributes)
    }
  } catch (e: unknown) {
    console.error('[Statistics] Load failed', e)
    error.value = t('cloud.error-loading')
  } finally {
    loading.value = false
  }
})
</script>
