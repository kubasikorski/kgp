<script setup>
import { computed, ref } from 'vue'
import SideBarPeakDetails from './SideBarPeakDetails.vue'
import PeakList from './PeakList.vue'
import LoginDrawer from './LoginDrawer.vue'
import RegisterDrawer from './RegisterDrawer.vue'
import ForgotPasswordDrawer from './ForgotPasswordDrawer.vue'
import { useAuthStore } from '@/stores/auth'
import { useSyncStatus } from '@/composables/useUserDataSync'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const props = defineProps({
  peaks: { type: Array, required: true },
  allPeaks: { type: Array, required: true },
  selected: { type: Object, default: null },
  filter: { type: String, default: 'all' },
})
defineEmits(['select', 'close', 'update:filter'])

const auth = useAuthStore()
const { saving } = useSyncStatus()
const authView = ref(null) // null | 'login' | 'register' | 'forgot'

const setAuthView = (view) => {
  authView.value = view
}
const onAuthOpenChange = (isOpen) => {
  if (!isOpen) authView.value = null
}

const conqueredCount = computed(() => props.allPeaks.filter((p) => p.conquered).length)
const totalCount = computed(() => props.allPeaks.length)
</script>

<template>
  <aside
    class="flex flex-col gap-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200"
  >
    <header class="flex items-start justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold text-slate-900">Projekt28</h1>
        <p class="mt-1 text-sm text-slate-500">
          Zdobyte: <span class="font-medium text-emerald-600">{{ conqueredCount }}</span> /
          {{ totalCount }}
        </p>
      </div>
      <div class="flex items-center gap-1">
        <span
          v-if="saving"
          class="p-1.5 text-emerald-600"
          title="Zapisywanie…"
          aria-live="polite"
          aria-label="Zapisywanie"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-4 w-4 animate-pulse"
          >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
        </span>
        <button
          v-if="!auth.isLoggedIn"
          type="button"
          class="rounded-md p-1.5 text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-100 hover:text-slate-900"
          title="Zaloguj się"
          @click="setAuthView('login')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-4 w-4"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
        <DropdownMenu v-else>
          <DropdownMenuTrigger as-child>
            <button
              type="button"
              class="rounded-md p-1.5 text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-100 hover:text-slate-900"
              title="Moje konto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-4 w-4"
              >
                <path d="M18 20a6 6 0 0 0-12 0" />
                <circle cx="12" cy="10" r="4" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-auto">
            <DropdownMenuLabel class="whitespace-nowrap">
              {{ auth.user?.email ?? 'Moje konto' }}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem @select="auth.signOut()">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-4 w-4"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Wyloguj
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>

    <LoginDrawer
      :open="authView === 'login'"
      @update:open="onAuthOpenChange"
      @switch="setAuthView('register')"
      @forgot="setAuthView('forgot')"
    />
    <RegisterDrawer
      :open="authView === 'register'"
      @update:open="onAuthOpenChange"
      @switch="setAuthView('login')"
    />
    <ForgotPasswordDrawer
      :open="authView === 'forgot'"
      @update:open="onAuthOpenChange"
      @switch="setAuthView('login')"
    />

    <SideBarPeakDetails v-if="selected" :peak="selected" @close="$emit('close')" />


    <PeakList
      class="hidden md:block"
      :peaks="peaks"
      :all-peaks="allPeaks"
      :selected="selected"
      :filter="filter"
      @update:filter="$emit('update:filter', $event)"
      @select="$emit('select', $event)"
    />
  </aside>
</template>
