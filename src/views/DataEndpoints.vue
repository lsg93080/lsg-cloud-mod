<template>
  <div class="main-contributions p-4 md:p-6">
    <header class="pb-4 text-start">
      <h2>{{ t('cloud.data-endpoints') }}</h2>
      <p class="mt-1 text-sm text-[var(--text-color-light)]">
        {{ t('cloud.data-endpoints-subtitle') }}
      </p>
    </header>
    <div v-if="error" class="mb-4">
      <Message severity="error" :closable="false">{{ error }}</Message>
    </div>

    <div v-if="loading" class="flex flex-col gap-6">
      <Card>
        <template #content>
          <Skeleton height="40px" class="mb-2" />
          <Skeleton height="200px" />
        </template>
      </Card>
      <Card>
        <template #content>
          <Skeleton height="40px" class="mb-2" />
          <Skeleton height="200px" />
        </template>
      </Card>
    </div>

    <div v-else class="flex flex-col gap-6">
      <Card>
        <template #header>
          <div class="flex items-center gap-3 px-4 pt-4">
            <span
              class="inline-block h-3 w-3 rounded-full"
              style="background-color: var(--p-primary-color)"
            />
            <h2 class="text-lg font-semibold">{{ t('cloud.acquired-subattributes') }}</h2>
            <Badge :value="acquiredList.length" severity="contrast" />
          </div>
        </template>
        <template #content>
          <DataTable
            :value="acquiredList"
            :paginator="acquiredList.length > pageSize"
            :rows="pageSize"
            :rows-per-page-options="[10, 20, 50]"
            striped-rows
            responsive-layout="scroll"
            class="text-sm"
            sort-field="created_time"
            :sort-order="-1"
          >
            <Column
              field="created_time"
              :header="t('cloud.date')"
              sortable
              style="min-width: 140px"
            >
              <template #body="{ data }">
                {{ formatDate(data.created_time) }}
              </template>
            </Column>
            <Column field="name_dimension" :header="t('cloud.dimension')" sortable />
            <Column field="name_subattributes" :header="t('cloud.subattribute')" sortable />
            <Column field="name_online_sensor" :header="t('cloud.sensor')" sortable />
            <Column field="name_sensor_endpoint" :header="t('cloud.endpoint')" sortable />
            <Column field="data" :header="t('cloud.points')" sortable style="min-width: 100px">
              <template #body="{ data }">
                <span class="font-semibold" style="color: var(--p-primary-color)">
                  +{{ Number(data.data).toLocaleString() }}
                </span>
              </template>
            </Column>
          </DataTable>
          <div v-if="acquiredList.length === 0" class="py-8 text-center">
            <p style="color: var(--p-text-muted-color)">{{ t('cloud.no-data') }}</p>
          </div>
        </template>
      </Card>

      <Card>
        <template #header>
          <div class="flex items-center gap-3 px-4 pt-4">
            <span class="inline-block h-3 w-3 rounded-full" style="background-color: #e74c3c" />
            <h2 class="text-lg font-semibold">{{ t('cloud.expended-attributes') }}</h2>
            <Badge :value="expendedList.length" severity="contrast" />
          </div>
        </template>
        <template #content>
          <DataTable
            :value="expendedList"
            :paginator="expendedList.length > pageSize"
            :rows="pageSize"
            :rows-per-page-options="[10, 20, 50]"
            striped-rows
            responsive-layout="scroll"
            class="text-sm"
            sort-field="created_time"
            :sort-order="-1"
          >
            <Column
              field="created_time"
              :header="t('cloud.date')"
              sortable
              style="min-width: 140px"
            >
              <template #body="{ data }">
                {{ formatDate(data.created_time) }}
              </template>
            </Column>
            <Column field="name_dimension" :header="t('cloud.dimension')" sortable />
            <Column field="name_videogame" :header="t('cloud.game')" sortable />
            <Column field="name_modifiable_mechanic" :header="t('cloud.mechanic')" sortable />
            <Column field="data" :header="t('cloud.points')" sortable style="min-width: 100px">
              <template #body="{ data }">
                <span class="font-semibold" style="color: #e74c3c">
                  -{{ Number(data.data).toLocaleString() }}
                </span>
              </template>
            </Column>
          </DataTable>
          <div v-if="expendedList.length === 0" class="py-8 text-center">
            <p style="color: var(--p-text-muted-color)">{{ t('cloud.no-data') }}</p>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Skeleton from 'primevue/skeleton'
import Message from 'primevue/message'
import Badge from 'primevue/badge'
import {
  getCurrentPlayer,
  getAcquiredSubattributesList,
  getExpendedAttributesList,
  type Player,
  type AcquiredSubattribute,
  type ExpendedAttribute
} from '@/api/cloudApi'

const { t } = useI18n()

const loading = ref(true)
const error = ref<string | null>(null)
const pageSize = ref(20)

const player = ref<Player | null>(null)
const acquiredList = ref<AcquiredSubattribute[]>([])
const expendedList = ref<ExpendedAttribute[]>([])

function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    player.value = await getCurrentPlayer()
    const [acquired, expended] = await Promise.all([
      getAcquiredSubattributesList(player.value.id_players),
      getExpendedAttributesList(player.value.id_players)
    ])
    acquiredList.value = acquired
    expendedList.value = expended
  } catch (e: unknown) {
    console.error('[DataEndpoints] Load failed', e)
    error.value = t('cloud.error-loading')
  } finally {
    loading.value = false
  }
})
</script>
