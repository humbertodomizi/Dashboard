<script setup>
import { ref, computed } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Menu from "primevue/menu";
import ConfirmDialog from "primevue/confirmdialog";
import Toast from "primevue/toast";
import TableSkeleton from "./TableSkeleton.vue";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  columns: {
    type: Array,
    required: true,
    // Expected format: { field: 'string', header: 'string', sortable: boolean, slotName?: 'string' }
  },
  loading: {
    type: Boolean,
    default: false,
  },
  rowsPerPageOptions: {
    type: Array,
    default: () => [10, 25, 50],
  },
  globalFilterFields: {
    type: Array,
    default: () => [],
  },
  customActions: {
    type: Array,
    default: () => [],
    // Format: { label: 'String', icon: 'pi pi-icon', event: 'eventName', class?: 'string' }
  },
});

const emit = defineEmits([
  "edit",
  "delete",
  "update:filters",
  "update:rows",
  "row-click",
]);
// Dynamic emits for custom actions are not strictly validated in Vue 3 script setup but work.

// Filters are handled by parent via v-model usually, but here we accept them as prop or just use DataTable's internal handling if passed bound
// To simplify, we assume the parent handles the filter object state and passes it to the slot or we bind it here if needed.
// However, PrimeVue DataTable needs `filters` prop.
// Let's use a defineModel or similar if we were in 3.4+, but for now we will accept filters as a prop `modelValue:filters`
const filters = defineModel("filters");
const rows = defineModel("rows", { default: 25 });

const confirm = useConfirm();
const toast = useToast();
const menu = ref();
const selectedItem = ref();

const baseMenuItems = [
  {
    label: "Eliminar",
    icon: "pi pi-trash",
    class: "text-red-600",
    command: () => {
      confirmDelete(selectedItem.value);
    },
  },
];

const menuItems = computed(() => {
  const custom = props.customActions.map((action) => ({
    label: action.label,
    icon: action.icon,
    class: action.class,
    command: () => emit(action.event, selectedItem.value),
  }));
  return [...custom, ...baseMenuItems];
});

const toggleMenu = (event, item) => {
  selectedItem.value = item;
  menu.value.toggle(event);
};

const onRowClick = (event) => {
  emit("edit", event.data);
};

const confirmDelete = (item) => {
  confirm.require({
    message: "¿Estás seguro de que deseas eliminar este registro?",
    header: "Confirmar Eliminación",
    icon: "pi pi-exclamation-triangle",
    rejectLabel: "Cancelar",
    acceptLabel: "Eliminar",
    rejectClass: "p-button-secondary p-button-outlined",
    acceptClass: "p-button-danger",
    accept: () => {
      emit("delete", item);
      toast.add({
        severity: "success",
        summary: "Eliminado",
        detail: "Registro eliminado correctamente",
        life: 3000,
      });
    },
  });
};
</script>

<template>
  <div>
    <TableSkeleton v-if="loading" :rows="rows" :columns="columns.length + 1" />

    <DataTable
      v-else
      v-model:filters="filters"
      :value="data"
      stripedRows
      paginator
      v-model:rows="rows"
      :rowsPerPageOptions="rowsPerPageOptions"
      class="p-datatable-sm cursor-pointer"
      :globalFilterFields="globalFilterFields"
      filterDisplay="menu"
      @row-click="onRowClick"
    >
      <template #empty>No se encontraron registros.</template>
      <template #loading>Cargando datos...</template>

      <!-- Dynamic Columns -->
      <Column
        v-for="col in columns"
        :key="col.field"
        :field="col.field"
        :header="col.header"
        :sortable="col.sortable"
      >
        <!-- If a slotName is provided, use a dynamic slot -->
        <template v-if="col.slotName" #body="slotProps">
          <slot :name="col.slotName" :data="slotProps.data">
            {{ slotProps.data[col.field] }}
          </slot>
        </template>
      </Column>

      <!-- Actions Column -->
      <Column class="w-16" :exportable="false">
        <template #body="slotProps">
          <Button
            icon="pi pi-ellipsis-v"
            text
            rounded
            @click="toggleMenu($event, slotProps.data)"
            aria-haspopup="true"
            aria-controls="overlay_menu"
            severity="secondary"
          />
        </template>
      </Column>
    </DataTable>

    <Menu ref="menu" id="overlay_menu" :model="menuItems" :popup="true" />
    <ConfirmDialog />
    <Toast />
  </div>
</template>
