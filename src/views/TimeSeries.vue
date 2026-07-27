<template>
  <div class="main-contributions p-4 md:p-6">
    <header class="pb-4 text-start">
      <h2>{{ t('cloud.time-series') }}</h2>
      <p class="mt-1 text-sm text-[var(--text-color-light)]">
        {{ t('cloud.time-series-subtitle') }}
      </p>
    </header>
    <div v-if="error" class="mb-4">
      <Message severity="error" :closable="false">{{ error }}</Message>
    </div>

    <Card class="mb-6">
      <template #content>
        <div class="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
          <div class="flex w-full flex-col gap-1 sm:w-auto">
            <label class="text-sm font-medium text-(--text-color-light)">
              {{ t('cloud.date-from') }}
            </label>
            <DatePicker
              v-model="fromDate"
              date-format="yy-mm-dd"
              :max-date="toDate ?? new Date()"
              show-button-bar
              class="w-full sm:w-48"
              @date-select="onDateChange"
            />
          </div>
          <div class="flex w-full flex-col gap-1 sm:w-auto">
            <label class="text-sm font-medium text-(--text-color-light)">
              {{ t('cloud.date-to') }}
            </label>
            <DatePicker
              v-model="toDate"
              date-format="yy-mm-dd"
              :min-date="fromDate ?? undefined"
              :max-date="new Date()"
              show-button-bar
              class="w-full sm:w-48"
              @date-select="onDateChange"
            />
          </div>
          <Button
            :label="t('cloud.refresh')"
            icon="pi pi-refresh"
            :loading="loadingChart"
            @click="loadTimeEvolution"
          />
        </div>
      </template>
    </Card>

    <Card class="mb-6">
      <template #header>
        <div class="px-4 pt-4">
          <h2 class="text-lg font-semibold">{{ t('cloud.dimensions-evolution') }}</h2>
        </div>
      </template>
      <template #content>
        <div v-if="loadingChart" class="flex h-64 items-center justify-center">
          <ProgressSpinner style="width: 40px; height: 40px" />
        </div>
        <div v-else-if="hasChartData">
          <VueApexCharts
            :key="apexMode"
            type="line"
            height="350"
            :options="lineOptions"
            :series="lineSeries"
          />
        </div>
        <div v-else class="flex h-64 items-center justify-center">
          <p style="color: var(--p-text-muted-color)">{{ t('cloud.no-data') }}</p>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useChartTheme } from '@/composables/useChartTheme'
import VueApexCharts from 'vue3-apexcharts'
import Card from 'primevue/card'
import DatePicker from 'primevue/datepicker'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import {
  getCurrentPlayer,
  getDimensionsTimeEvolution,
  type Player,
  type TimeEvolutionResponse
} from '@/api/cloudApi'

const { t } = useI18n()
const { apexMode, textColor } = useChartTheme()

const loadingChart = ref(false)
const error = ref<string | null>(null)

const player = ref<Player | null>(null)
const timeData = ref<TimeEvolutionResponse | null>(null)

// Default date range: last 90 days
const toDate = ref<Date>(new Date())
const _from = new Date()
_from.setDate(_from.getDate() - 90)
const fromDate = ref<Date>(_from)

const hasChartData = computed(
  () =>
    timeData.value &&
    timeData.value.series &&
    timeData.value.series.length > 0 &&
    timeData.value.categories &&
    timeData.value.categories.length > 0
)

const lineSeries = computed(() => timeData.value?.series ?? [])

const DIMENSION_COLORS = ['#FA5E15', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6']

const lineOptions = computed(() => ({
  chart: {
    type: 'line' as const,
    toolbar: { show: true },
    background: 'transparent',
    zoom: { enabled: true },
    foreColor: textColor.value
  },
  colors: DIMENSION_COLORS,
  xaxis: {
    categories: timeData.value?.categories ?? [],
    type: 'category' as const,
    labels: {
      rotate: -45,
      style: { fontSize: '11px' }
    }
  },
  yaxis: {
    title: { text: t('cloud.points') }
  },
  stroke: { curve: 'smooth' as const, width: 2 },
  markers: { size: 3 },
  legend: { position: 'top' as const },
  tooltip: {
    theme: 'dark',
    x: { show: true },
    y: {
      formatter: (val: number) => val?.toLocaleString() + ' pts'
    }
  },
  grid: {
    borderColor: 'var(--border-color-subtle)'
  }
}))

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0] ?? ''
}

async function loadTimeEvolution() {
  if (!player.value || !fromDate.value || !toDate.value) return
  loadingChart.value = true
  error.value = null
  try {
    timeData.value = await getDimensionsTimeEvolution(
      player.value.id_players,
      formatDate(fromDate.value),
      formatDate(toDate.value)
    )
  } catch (e: unknown) {
    console.error('[TimeSeries] Load failed', e)
    error.value = t('cloud.error-loading')
    timeData.value = null
  } finally {
    loadingChart.value = false
  }
}

async function onDateChange() {
  if (fromDate.value && toDate.value) {
    await loadTimeEvolution()
  }
}

onMounted(async () => {
  try {
    player.value = await getCurrentPlayer()
    await loadTimeEvolution()
  } catch (e: unknown) {
    console.error('[TimeSeries] Player load failed', e)
    error.value = t('cloud.error-loading')
  }
})
</script>
