<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import { FilterMatchMode, FilterOperator } from "@primevue/core/api";
import SharedDataTable from "../components/SharedDataTable.vue";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import api from "../services/api";

const router = useRouter();
const emit = defineEmits(["create-post", "edit-post"]);
const confirm = useConfirm();
const toast = useToast();

const posts = ref([]);
const isLoading = ref(true);
const rowsPerPage = ref(25);

onMounted(async () => {
  await loadPosts();
});

const loadPosts = async () => {
  isLoading.value = true;
  try {
    // API returns populated user, or we can just use what is returned
    // The API getAllPosts populates 'user' field
    const rawPosts = await api.getPosts();
    posts.value = rawPosts.map((post) => ({
      ...post,
      userName: post.user
        ? `${post.user.firstName} ${post.user.lastName}`
        : "Desconocido",
      userEmail: post.user ? post.user.email : "",
      publishedDateObj: post.publishedAt ? new Date(post.publishedAt) : null,
    }));
  } catch (error) {
    console.error(error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudieron cargar los posts",
      life: 3000,
    });
  } finally {
    isLoading.value = false;
  }
};

// Categories for filter
const categories = computed(() => {
  const uniqueCategories = [
    ...new Set(posts.value.flatMap((p) => p.categories || [])),
  ];
  return uniqueCategories.map((c) => ({ label: c, value: c }));
});

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  title: { value: null, matchMode: FilterMatchMode.CONTAINS },
  userName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  userEmail: { value: null, matchMode: FilterMatchMode.CONTAINS },
  status: { value: null, matchMode: FilterMatchMode.EQUALS },
  publishedDateObj: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
  },
});

const columns = [
  { field: "title", header: "Título", sortable: true },
  { field: "userName", header: "Autor", sortable: true, slotName: "author" },
  {
    field: "categories",
    header: "Categorías",
    sortable: false,
    slotName: "categories",
  },
  { field: "publishedAt", header: "Fecha", sortable: true, slotName: "date" },
  { field: "status", header: "Estado", sortable: true, slotName: "status" },
];

const refreshData = () => {
  loadPosts();
};

const handleEdit = (post) => {
  router.push(`/posts/${post._id}/edit`);
};

const customActions = [
  {
    label: "Publicar post",
    icon: "pi pi-check-circle",
    event: "publish",
    class: "text-green-600",
  },
];

const handlePublish = async (post) => {
  if (post.status === "Published") {
    toast.add({
      severity: "info",
      summary: "Info",
      detail: "El post ya está publicado",
      life: 3000,
    });
    return;
  }

  try {
    await api.updatePost(post._id, { status: "Published" });
    toast.add({
      severity: "success",
      summary: "Éxito",
      detail: "Post publicado correctamente",
      life: 3000,
    });
    await loadPosts();
  } catch (error) {
    console.error(error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Error al publicar el post",
      life: 3000,
    });
  }
};

const handleDelete = (post) => {
  // SharedDataTable handles confirmation dialog, here we just execute logic if we were emitting
  // But SharedDataTable emits 'delete'
  // Wait, SharedDataTable uses its own confirmDelete logic and emits 'delete'.
  // We need to actually delete from API when event is emitted.
  // Actually SharedDataTable implementation:
  // confirmDelete -> accept -> emit('delete', item) -> toast
  // So in parent we should listen to @delete and call API.
  // BUT SharedDataTable in my implementation handles the UI part.
  // Let's look at SharedDataTable again.

  // Re-reading SharedDataTable:
  // accept: () => { emit('delete', item); toast... }
  // So it emits 'delete'. The parent (this file) receives @delete="handleDelete"

  deletePost(post);
};

const deletePost = async (post) => {
  try {
    await api.deletePost(post._id);
    posts.value = posts.value.filter((p) => p._id !== post._id);
    // Toast is handled by SharedDataTable? Yes, it shows "Registro eliminado correctamente".
    // But if API fails, we should probably show error.
    // The current SharedDataTable implementation is optimistic UI for the toast or assumes success.
    // Ideally we should pass a function or handle confirm in parent.
    // For now, let's assume success or we can add global error handler.
  } catch (error) {
    console.error(error);
    // Toast service is global, we can show error here
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo eliminar el post",
      life: 3000,
    });
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString();
};

const getStatusSeverity = (status) => {
  switch (status) {
    case "Published":
      return "bg-green-100 text-green-700";
    case "Draft":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-blue-100 text-blue-700";
  }
};
</script>

<template>
  <div
    class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full"
  >
    <div
      class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4"
    >
      <h2 class="text-2xl font-semibold text-gray-800">Gestión de Posts</h2>
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
          label="Nuevo Post"
          icon="pi pi-plus"
          @click="router.push('/posts/new')"
          class="bg-primary-600 border-primary-600 hover:bg-primary-700 flex-1 md:flex-none"
        />
      </div>
    </div>

    <!-- Filters Toolbar -->
    <div class="flex flex-col md:flex-row gap-4 mb-6">
      <IconField class="w-full md:w-64">
        <InputIcon class="pi pi-search" />
        <InputText
          v-model="filters['global'].value"
          placeholder="Buscar post..."
          fluid
        />
      </IconField>

      <!-- Specific filters can be added here bound to filters model if strictly needed outside table menu -->
      <!-- Using PrimeVue DataTable built-in filter menu features mostly, but adding a quick Status filter here -->

      <Select
        v-model="filters['status'].value"
        :options="['Published', 'Draft']"
        placeholder="Estado"
        showClear
        class="w-full md:w-40"
      />
    </div>

    <SharedDataTable
      :data="posts"
      :columns="columns"
      v-model:filters="filters"
      v-model:rows="rowsPerPage"
      :loading="isLoading"
      :globalFilterFields="['title', 'userName', 'userEmail']"
      :customActions="customActions"
      @edit="handleEdit"
      @delete="handleDelete"
      @publish="handlePublish"
    >
      <template #author="{ data }">
        <div class="flex flex-col">
          <span class="font-medium">{{ data.userName }}</span>
          <span class="text-xs text-gray-500">{{ data.userEmail }}</span>
        </div>
      </template>

      <template #categories="{ data }">
        <div class="flex gap-1 flex-wrap">
          <span
            v-for="cat in data.categories"
            :key="cat"
            class="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs"
          >
            {{ cat }}
          </span>
        </div>
      </template>

      <template #date="{ data }">
        {{ formatDate(data.publishedAt) }}
      </template>

      <template #status="{ data }">
        <span
          class="px-3 py-1 rounded-full text-xs font-medium"
          :class="getStatusSeverity(data.status)"
        >
          {{ data.status }}
        </span>
      </template>
    </SharedDataTable>
  </div>
</template>
