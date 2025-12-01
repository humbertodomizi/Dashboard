<script setup>
import { computed, onMounted, ref } from "vue";
import { Form, Field, ErrorMessage } from "vee-validate";
import { useRouter, useRoute } from "vue-router";
import * as yup from "yup";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import MultiSelect from "primevue/multiselect";
import DatePicker from "primevue/datepicker";
import Editor from "primevue/editor";
import AutoComplete from "primevue/autocomplete";
import api from "../services/api";
import { useToast } from "primevue/usetoast";

const props = defineProps({
  initialData: {
    type: Object,
    default: null,
  },
  id: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["cancel", "submit"]);
const router = useRouter();
const route = useRoute();
const toast = useToast();

// Local state for fetched post
const fetchedPost = ref(null);
// Users for select
const users = ref([]);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  try {
    const usersData = await api.getUsers();
    users.value = usersData.map((u) => ({
      label: `${u.firstName} ${u.lastName} (${u.email})`,
      value: u._id, // Use _id for MongoDB
    }));
  } catch (e) {
    console.error("Failed to load users for select", e);
  }

  if (!props.initialData && props.id) {
    try {
      fetchedPost.value = await api.getPost(props.id);
    } catch (error) {
      console.error(error);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Post no encontrado",
        life: 3000,
      });
      router.push("/posts");
    }
  }
  loading.value = false;
});

const postData = computed(() => props.initialData || fetchedPost.value);

// Categories options

// Categories options
const categoryOptions = [
  { label: "Technology", value: "Technology" },
  { label: "Development", value: "Development" },
  { label: "Design", value: "Design" },
  { label: "Lifestyle", value: "Lifestyle" },
  { label: "Business", value: "Business" },
  { label: "Future", value: "Future" },
];

const statusOptions = [
  { label: "Draft", value: "Draft" },
  { label: "Published", value: "Published" },
];

// AutoComplete logic for tags
const tagsSuggestions = ref([]);
const allTags = [
  "vue",
  "javascript",
  "css",
  "html",
  "design",
  "frontend",
  "backend",
  "api",
];

const searchTags = (event) => {
  if (!event.query.trim().length) {
    tagsSuggestions.value = [...allTags];
  } else {
    tagsSuggestions.value = allTags.filter((tag) => {
      return tag.toLowerCase().startsWith(event.query.toLowerCase());
    });
    // Allow creating new tags if not exists exactly
    if (!tagsSuggestions.value.includes(event.query.toLowerCase())) {
      tagsSuggestions.value.push(event.query.toLowerCase());
    }
  }
};

// Schema
const schema = yup.object({
  title: yup.string().required("El título es obligatorio"),
  content: yup.string().required("El contenido es obligatorio"), // Rich text
  tags: yup.array().min(1, "Al menos un tag es requerido").required(),
  categories: yup
    .array()
    .min(1, "Al menos una categoría es requerida")
    .required(),
  userId: yup.string().required("El autor es obligatorio"),
  publishedAt: yup.date().required("La fecha es obligatoria"),
  status: yup.string().required("El estado es obligatorio"),
});

// Initial Values
const initialValues = computed(() => {
  if (postData.value) {
    return {
      ...postData.value,
      publishedAt: postData.value.publishedAt
        ? new Date(postData.value.publishedAt)
        : new Date(),
      // Ensure arrays
      tags: postData.value.tags || [],
      categories: postData.value.categories || [],
      userId: postData.value.user?._id || postData.value.user, // Handle populated or ID
    };
  }
  return {
    publishedAt: new Date(),
    status: "Draft",
    tags: [],
    categories: [],
  };
});

const onSubmit = async (values) => {
  // Prepare payload for API
  const payload = {
    ...values,
    user: values.userId, // API expects 'user' field with ID
  };
  // Remove frontend-specific or populated fields
  delete payload.userId;
  delete payload._id;
  delete payload.__v;
  delete payload.createdAt;
  delete payload.updatedAt;

  try {
    if (props.id || (fetchedPost.value && fetchedPost.value._id)) {
      const postId = props.id || fetchedPost.value._id;
      await api.updatePost(postId, payload);
      toast.add({
        severity: "success",
        summary: "Éxito",
        detail: "Post actualizado",
        life: 3000,
      });
    } else {
      await api.createPost(payload);
      toast.add({
        severity: "success",
        summary: "Éxito",
        detail: "Post creado",
        life: 3000,
      });
    }
    router.push("/posts");
  } catch (error) {
    console.error(error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Error al guardar post",
      life: 3000,
    });
  }
};

const handleCancel = () => {
  router.push("/posts");
};
</script>

<template>
  <div
    class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-4xl mx-auto"
  >
    <h2 class="text-2xl font-semibold text-gray-800 mb-6">
      {{ postData ? "Editar Post" : "Nuevo Post" }}
    </h2>

    <div v-if="loading" class="flex justify-center p-8">
      <i class="pi pi-spin pi-spinner text-4xl text-blue-500"></i>
    </div>

    <Form
      v-else
      @submit="onSubmit"
      :validation-schema="schema"
      :initial-values="initialValues"
      v-slot="{ errors, isSubmitting, values, setFieldValue }"
    >
      <div class="grid grid-cols-1 gap-6 mb-6">
        <!-- Title -->
        <div class="flex flex-col gap-2">
          <label for="title" class="font-medium text-gray-700">Título</label>
          <Field name="title" v-slot="{ field, errorMessage }">
            <InputText
              v-bind="field"
              id="title"
              :invalid="!!errorMessage"
              placeholder="Título del post"
              fluid
            />
          </Field>
          <ErrorMessage name="title" class="text-red-500 text-sm" />
        </div>

        <!-- Content (Rich Text) -->
        <div class="flex flex-col gap-2">
          <label for="content" class="font-medium text-gray-700"
            >Contenido</label
          >
          <Field name="content" v-slot="{ field, errorMessage, handleChange }">
            <Editor
              :model-value="field.value"
              @text-change="(e) => handleChange(e.htmlValue)"
              editorStyle="height: 320px"
              :invalid="!!errorMessage"
            />
          </Field>
          <ErrorMessage name="content" class="text-red-500 text-sm" />
        </div>

        <!-- Tags (Creatable) -->
        <div class="flex flex-col gap-2">
          <label for="tags" class="font-medium text-gray-700">Tags</label>
          <Field name="tags" v-slot="{ field, errorMessage, handleChange }">
            <AutoComplete
              :model-value="field.value"
              @update:model-value="handleChange"
              multiple
              fluid
              :suggestions="tagsSuggestions"
              @complete="searchTags"
              :invalid="!!errorMessage"
              dropdown
              input-id="tags"
            />
          </Field>
          <ErrorMessage name="tags" class="text-red-500 text-sm" />
        </div>

        <!-- Categories -->
        <div class="flex flex-col gap-2">
          <label for="categories" class="font-medium text-gray-700"
            >Categorías</label
          >
          <Field
            name="categories"
            v-slot="{ field, errorMessage, handleChange }"
          >
            <MultiSelect
              :model-value="field.value"
              @update:model-value="handleChange"
              :options="categoryOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Selecciona categorías"
              display="chip"
              :invalid="!!errorMessage"
              fluid
              input-id="categories"
            />
          </Field>
          <ErrorMessage name="categories" class="text-red-500 text-sm" />
        </div>

        <!-- Author -->
        <div class="flex flex-col gap-2">
          <label for="userId" class="font-medium text-gray-700">Autor</label>
          <Field name="userId" v-slot="{ field, errorMessage, handleChange }">
            <Select
              :model-value="field.value"
              @update:model-value="handleChange"
              :options="users"
              optionLabel="label"
              optionValue="value"
              filter
              placeholder="Selecciona un usuario"
              :invalid="!!errorMessage"
              fluid
              input-id="userId"
            />
          </Field>
          <ErrorMessage name="userId" class="text-red-500 text-sm" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Date -->
          <div class="flex flex-col gap-2">
            <label for="publishedAt" class="font-medium text-gray-700"
              >Fecha de Publicación</label
            >
            <Field
              name="publishedAt"
              v-slot="{ field, errorMessage, handleChange }"
            >
              <DatePicker
                :model-value="field.value"
                @update:model-value="handleChange"
                showIcon
                :invalid="!!errorMessage"
                fluid
                dateFormat="dd/mm/yy"
                input-id="publishedAt"
              />
            </Field>
            <ErrorMessage name="publishedAt" class="text-red-500 text-sm" />
          </div>

          <!-- Status -->
          <div class="flex flex-col gap-2">
            <label for="status" class="font-medium text-gray-700">Estado</label>
            <Field name="status" v-slot="{ field, errorMessage, handleChange }">
              <Select
                :model-value="field.value"
                @update:model-value="handleChange"
                :options="statusOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Estado"
                :invalid="!!errorMessage"
                fluid
                input-id="status"
              />
            </Field>
            <ErrorMessage name="status" class="text-red-500 text-sm" />
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-4 pt-4 border-t border-gray-100 mt-8">
        <Button
          label="Cancelar"
          severity="secondary"
          variant="text"
          @click="handleCancel"
        />
        <Button
          type="submit"
          :label="postData ? 'Actualizar Post' : 'Publicar Post'"
          :loading="isSubmitting"
        />
      </div>
    </Form>
  </div>
</template>
