<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import SharedDataTable from "./SharedDataTable.vue";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Select from "primevue/select";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { FilterMatchMode } from "@primevue/core/api";
import api from "../services/api";

const router = useRouter();
const users = ref([]);
const isLoading = ref(true);
const rowsPerPage = ref(25);
const confirm = useConfirm();
const toast = useToast();

onMounted(async () => {
  await loadUsers();
});

const loadUsers = async () => {
  isLoading.value = true;
  try {
    users.value = await api.getUsers();
  } catch (error) {
    console.error(error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudieron cargar los usuarios",
      life: 3000,
    });
  } finally {
    isLoading.value = false;
  }
};

const handleEdit = (user) => {
  router.push(`/users/${user._id}/edit`);
};

const handleDelete = async (user) => {
  try {
    await api.deleteUser(user._id);
    users.value = users.value.filter((u) => u._id !== user._id);
  } catch (error) {
    console.error(error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo eliminar el usuario",
      life: 3000,
    });
  }
};

const columns = [
  { field: "firstName", header: "Nombre", sortable: true },
  { field: "lastName", header: "Apellido", sortable: true },
  { field: "email", header: "Email", sortable: true },
  { field: "address.country", header: "País", sortable: true },
  { field: "role", header: "Rol", sortable: true, slotName: "role" },
];

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  "address.country": { value: null, matchMode: FilterMatchMode.EQUALS },
  role: { value: null, matchMode: FilterMatchMode.EQUALS },
});

const roles = [
  { label: "Admin", value: "Admin" },
  { label: "Visitor", value: "Visitor" },
];

// Extract unique countries for the filter
const countries = computed(() => {
  const uniqueCountries = [
    ...new Set(users.value.map((u) => u.address?.country).filter(Boolean)),
  ];
  return uniqueCountries
    .map((c) => ({ label: c, value: c }))
    .sort((a, b) => a.label.localeCompare(b.label));
});

const refreshData = () => {
  loadUsers();
};
</script>

<template>
  <div
    class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col"
  >
    <div
      class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4"
    >
      <h2 class="text-2xl font-semibold text-gray-800">Gestión de Usuarios</h2>
      <div class="flex gap-3 w-full md:w-auto">
        <Button
          icon="pi pi-refresh"
          @click="refreshData"
          outlined
          severity="secondary"
          aria-label="Actualizar"
          :loading="isLoading"
        />
        <Button
          label="Nuevo Usuario"
          icon="pi pi-plus"
          @click="router.push('/users/new')"
          class="bg-primary-600 border-primary-600 hover:bg-primary-700 flex-1 md:flex-none"
        />
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col md:flex-row gap-4 mb-6">
      <IconField class="w-full md:w-64">
        <InputIcon class="pi pi-search" />
        <InputText
          v-model="filters['global'].value"
          placeholder="Buscar por nombre o email"
          fluid
        />
      </IconField>

      <Select
        v-model="filters['address.country'].value"
        :options="countries"
        optionLabel="label"
        optionValue="value"
        placeholder="País"
        showClear
        class="w-full md:w-48"
      />

      <Select
        v-model="filters['role'].value"
        :options="roles"
        optionLabel="label"
        optionValue="value"
        placeholder="Rol"
        showClear
        class="w-full md:w-48"
      />
    </div>

    <SharedDataTable
      :data="users"
      :columns="columns"
      v-model:filters="filters"
      v-model:rows="rowsPerPage"
      :loading="isLoading"
      :globalFilterFields="['firstName', 'lastName', 'email']"
      @edit="handleEdit"
      @delete="handleDelete"
    >
      <template #role="{ data }">
        <span
          class="px-3 py-1 rounded-full text-xs font-medium"
          :class="
            data.role === 'Admin'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-blue-100 text-blue-700'
          "
        >
          {{ data.role }}
        </span>
      </template>
    </SharedDataTable>
  </div>
</template>
