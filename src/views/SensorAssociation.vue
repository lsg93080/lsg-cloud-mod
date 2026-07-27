<template>
  <div class="main-contributions p-4 md:p-6">
    <header class="pb-4 text-start">
      <h2>{{ t('cloud.sensor-association') }}</h2>
      <p class="mt-1 text-sm text-[var(--text-color-light)]">
        {{ t('cloud.sensor-association-subtitle') }}
      </p>
    </header>

    <div v-if="error" class="mb-4">
      <Message severity="error" :closable="false">{{ error }}</Message>
    </div>

    <div v-if="loading" class="grid grid-cols-1 gap-6">
      <Card v-for="i in 3" :key="i">
        <template #content>
          <Skeleton height="60px" class="mb-2" />
          <Skeleton height="40px" />
        </template>
      </Card>
    </div>

    <div v-else>
      <Card class="mb-6">
        <template #header>
          <div class="px-4 pt-4">
            <h2 class="text-lg font-semibold">{{ t('cloud.sensor-dimension-contribution') }}</h2>
          </div>
        </template>
        <template #content>
          <div v-if="hasBarData">
            <VueApexCharts :key="apexMode" type="bar" height="380" :options="barOptions" :series="barSeries" />
          </div>
          <div v-else class="flex h-48 items-center justify-center">
            <p style="color: var(--p-text-muted-color)">{{ t('cloud.no-data') }}</p>
          </div>
        </template>
      </Card>

      <Card>
        <template #header>
          <div class="px-4 pt-4">
            <h2 class="text-lg font-semibold">{{ t('cloud.contribution-detail') }}</h2>
          </div>
        </template>
        <template #content>
          <DataTable
            :value="tableRows"
            :paginator="tableRows.length > 20"
            :rows="20"
            striped-rows
            responsive-layout="scroll"
            class="text-sm"
          >
            <Column field="sensor" :header="t('cloud.sensor')" sortable />
            <Column field="dimension" :header="t('cloud.dimension')" sortable />
            <Column field="total" :header="t('cloud.total-points')" sortable>
              <template #body="{ data }">
                <span class="font-semibold" style="color: var(--p-primary-color)">
                  {{ data.total.toLocaleString() }}
                </span>
              </template>
            </Column>
          </DataTable>
          <div v-if="tableRows.length === 0" class="py-8 text-center">
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
import VueApexCharts from 'vue3-apexcharts'
import Card from 'primevue/card'
import Skeleton from 'primevue/skeleton'
import Message from 'primevue/message'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import {
  getCurrentPlayer,
  getAllDimensions,
  getSensorContributionForDimension,
  type Player,
  type Dimension,
  type SensorContribution
} from '@/api/cloudApi'

const { t } = useI18n()
const { apexMode, textColor } = useChartTheme()

const loading = ref(true)
const error = ref<string | null>(null)

const player = ref<Player | null>(null)
const dimensions = ref<Dimension[]>([])

// Map from dimensionId to SensorContribution[]
const sensorData = ref<Map<number, SensorContribution[]>>(new Map())

const DIMENSION_COLORS = ['#FA5E15', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6']

interface TableRow {
  sensor: string
  dimension: string
  total: number
}

const tableRows = computed((): TableRow[] => {
  const rows: TableRow[] = []
  dimensions.value.forEach((dim) => {
    const contributions = sensorData.value.get(dim.id_attributes) ?? []
    contributions.forEach((c) => {
      rows.push({
        sensor: c.name_online_sensor,
        dimension: dim.name,
        total: c.total
      })
    })
  })
  return rows.sort((a, b) => b.total - a.total)
})

// All unique sensor names
const sensorNames = computed((): string[] => {
  const names = new Set<string>()
  sensorData.value.forEach((contributions) => {
    contributions.forEach((c) => names.add(c.name_online_sensor))
  })
  return Array.from(names)
})

// Series: one per dimension, data indexed by sensor
const barSeries = computed(() => {
  return dimensions.value.map((dim) => {
    const contributions = sensorData.value.get(dim.id_attributes) ?? []
    const byName = new Map(contributions.map((c) => [c.name_online_sensor, c.total]))
    return {
      name: dim.name,
      data: sensorNames.value.map((sn) => byName.get(sn) ?? 0)
    }
  })
})

const barOptions = computed(() => ({
  chart: {
    type: 'bar' as const,
    stacked: false,
    toolbar: { show: false },
    background: 'transparent',
    foreColor: textColor.value
  },
  colors: DIMENSION_COLORS,
  xaxis: {
    categories: sensorNames.value,
    title: { text: t('cloud.sensor') }
  },
  yaxis: {
    title: { text: t('cloud.total-points') }
  },
  dataLabels: {
    style: {
      colors: [textColor.value]
    }
  },
  legend: { position: 'top' as const },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      borderRadius: 4
    }
  },
  tooltip: {
    theme: 'dark',
    y: {
      formatter: (val: number) => val.toLocaleString() + ' pts'
    }
  },
  grid: {
    borderColor: 'var(--border-color-subtle)'
  }
}))

const hasBarData = computed(() => barSeries.value.some((s) => s.data.some((v) => v > 0)))

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    player.value = await getCurrentPlayer()
    dimensions.value = await getAllDimensions()

    // Fetch sensor contributions for all dimensions in parallel
    const results = await Promise.allSettled(
      dimensions.value.map((dim) =>
        getSensorContributionForDimension(player.value!.id_players, dim.id_attributes)
      )
    )

    results.forEach((result, idx) => {
      const dim = dimensions.value[idx]
      if (!dim) return
      if (result.status === 'fulfilled') {
        sensorData.value.set(dim.id_attributes, result.value)
      } else {
        console.warn(`[SensorAssociation] Failed for dim ${dim.name}`, result.reason)
        sensorData.value.set(dim.id_attributes, [])
      }
    })
  } catch (e: unknown) {
    console.error('[SensorAssociation] Load failed', e)
    error.value = t('cloud.error-loading')
  } finally {
    loading.value = false
  }
})
</script>
