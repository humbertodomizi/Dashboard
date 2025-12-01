<script setup>
import { Form, Field, ErrorMessage } from "vee-validate";
import { computed, onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import * as yup from "yup";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Select from "primevue/select";
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

// Local state for fetched user if accessing via URL directly
const fetchedUser = ref(null);
const loading = ref(false);

onMounted(async () => {
  if (!props.initialData && props.id) {
    loading.value = true;
    try {
      fetchedUser.value = await api.getUser(props.id);
    } catch (error) {
      console.error(error);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Usuario no encontrado",
        life: 3000,
      });
      router.push("/users");
    } finally {
      loading.value = false;
    }
  }
});

// Use either passed initialData or fetchedUser
const userData = computed(() => props.initialData || fetchedUser.value);

// Regex patterns
const patterns = {
  min8: /^.{8,}$/,
  upperLower: /^(?=.*[a-z])(?=.*[A-Z])/,
  number: /\d/,
  special: /[!@#$%^&*(),.?":{}|<>]/,
};

// Schema using Yup
const schema = computed(() => {
  const baseSchema = {
    firstName: yup.string().required("El nombre es obligatorio"),
    lastName: yup.string().required("El apellido es obligatorio"),
    email: yup
      .string()
      .email("Email inválido")
      .required("El email es obligatorio"),
    phoneNumber: yup.string().required("El teléfono es obligatorio"),
    role: yup.string().required("El rol es obligatorio"),

    // Address fields
    country: yup.string().required("El país es obligatorio"),
    state: yup.string().required("El estado/provincia es obligatorio"),
    streetName: yup.string().required("La calle es obligatoria"),
    streetNumber: yup.string().required("El número es obligatorio"),
    zipCode: yup.string().required("El código postal es obligatorio"),
  };

  if (userData.value) {
    // Edit mode: Password optional
    return yup.object({
      ...baseSchema,
      password: yup
        .string()
        .test(
          "password-strength",
          "La contraseña no cumple los requisitos",
          (value) => {
            if (!value) return true; // Optional
            return (
              patterns.min8.test(value) &&
              patterns.upperLower.test(value) &&
              patterns.number.test(value) &&
              patterns.special.test(value)
            );
          }
        ),
      confirmPassword: yup
        .string()
        .oneOf([yup.ref("password")], "Las contraseñas deben coincidir")
        .test(
          "required-confirmation",
          "Confirmar contraseña es obligatorio",
          function (value) {
            return !this.parent.password || !!value;
          }
        ),
    });
  } else {
    // Create mode: Password required
    return yup.object({
      ...baseSchema,
      password: yup
        .string()
        .required("La contraseña es obligatoria")
        .matches(patterns.min8, "Mínimo 8 caracteres")
        .matches(patterns.upperLower, "Mayúscula y minúscula requerida")
        .matches(patterns.number, "Debe tener un número")
        .matches(patterns.special, "Debe tener un carácter especial"),
      confirmPassword: yup
        .string()
        .oneOf([yup.ref("password")], "Las contraseñas deben coincidir")
        .required("Confirmar contraseña es obligatorio"),
    });
  }
});

// Prepare initial values by flattening the structure if needed
const initialValues = computed(() => {
  if (!userData.value) return {};

  const { address, ...rest } = userData.value;
  return {
    ...rest,
    country: address?.country,
    state: address?.state,
    streetName: address?.streetName,
    streetNumber: address?.streetNumber,
    zipCode: address?.zipCode,
  };
});

const roles = [
  { label: "Admin", value: "Admin" },
  { label: "Visitor", value: "Visitor" },
  { label: "Moderator", value: "Moderator" },
  { label: "Editor", value: "Editor" },
];

// Dummy countries list for the dropdown
const countries = [
  { label: "USA", value: "USA" },
  { label: "Spain", value: "Spain" },
  { label: "Mexico", value: "Mexico" },
  { label: "Argentina", value: "Argentina" },
  { label: "Colombia", value: "Colombia" },
  { label: "Chile", value: "Chile" },
  { label: "Peru", value: "Peru" },
];

const getPasswordStrength = (val) => {
  if (!val) return 0;
  let score = 0;
  if (patterns.min8.test(val)) score++;
  if (patterns.upperLower.test(val)) score++;
  if (patterns.number.test(val)) score++;
  if (patterns.special.test(val)) score++;
  return score;
};

const getStrengthColor = (score) => {
  if (score === 0) return "bg-gray-200";
  if (score <= 1) return "bg-red-500";
  if (score === 2) return "bg-orange-500";
  if (score === 3) return "bg-yellow-400";
  return "bg-green-500";
};

const onSubmit = async (values) => {
  // Transform flat form data to nested structure if needed for API
  const userData = {
    ...values,
    address: {
      country: values.country,
      state: values.state,
      streetName: values.streetName,
      streetNumber: values.streetNumber,
      zipCode: values.zipCode,
    },
  };

  // Remove flat address fields from root object if desired, or keep as is depending on API
  delete userData.country;
  delete userData.state;
  delete userData.streetName;
  delete userData.streetNumber;
  delete userData.zipCode;

  // Remove password if empty (edit mode)
  if (!userData.password) delete userData.password;
  delete userData.confirmPassword; // Remove confirmation

  try {
    if (userData.value) {
      // Actually check id or userData existence
      // Edit Mode
      await api.updateUser(userData.value._id, userData); // wait, userData.value is the ref computed from props/fetch
      // We need to use the ID from there.
      // But wait, 'userData' variable here shadows the computed property 'userData'.
      // Let's rename the payload variable.
    }
  } catch (e) {}
  // Refactoring logic above:

  const payload = { ...userData };

  try {
    if (props.id || (fetchedUser.value && fetchedUser.value._id)) {
      const userId = props.id || fetchedUser.value._id;
      await api.updateUser(userId, payload);
      toast.add({
        severity: "success",
        summary: "Éxito",
        detail: "Usuario actualizado",
        life: 3000,
      });
    } else {
      await api.createUser(payload);
      toast.add({
        severity: "success",
        summary: "Éxito",
        detail: "Usuario creado",
        life: 3000,
      });
    }
    router.push("/users");
  } catch (error) {
    console.error(error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Error al guardar usuario",
      life: 3000,
    });
  }
};

const handleCancel = () => {
  router.push("/users");
};
</script>

<template>
  <div
    class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-4xl mx-auto"
  >
    <h2 class="text-2xl font-semibold text-gray-800 mb-6">
      {{ userData ? "Editar Usuario" : "Nuevo Usuario" }}
    </h2>

    <div v-if="loading" class="flex justify-center p-8">
      <i class="pi pi-spin pi-spinner text-4xl text-blue-500"></i>
    </div>

    <Form
      v-else
      @submit="onSubmit"
      :validation-schema="schema"
      :initial-values="initialValues"
      v-slot="{ errors, isSubmitting, values }"
    >
      <!-- Personal Information -->
      <h3 class="text-lg font-medium text-gray-700 mb-4 border-b pb-2">
        Información Personal
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="flex flex-col gap-2">
          <label for="firstName" class="font-medium text-gray-700"
            >Nombre</label
          >
          <Field
            name="firstName"
            v-slot="{ field, errorMessage, handleChange }"
          >
            <InputText
              :model-value="field.value"
              @update:model-value="handleChange"
              id="firstName"
              :invalid="!!errorMessage"
              placeholder="Nombre"
              fluid
            />
          </Field>
          <ErrorMessage name="firstName" class="text-red-500 text-sm" />
        </div>

        <div class="flex flex-col gap-2">
          <label for="lastName" class="font-medium text-gray-700"
            >Apellido</label
          >
          <Field name="lastName" v-slot="{ field, errorMessage, handleChange }">
            <InputText
              :model-value="field.value"
              @update:model-value="handleChange"
              id="lastName"
              :invalid="!!errorMessage"
              placeholder="Apellido"
              fluid
            />
          </Field>
          <ErrorMessage name="lastName" class="text-red-500 text-sm" />
        </div>

        <div class="flex flex-col gap-2">
          <label for="email" class="font-medium text-gray-700">Email</label>
          <Field name="email" v-slot="{ field, errorMessage, handleChange }">
            <InputText
              :model-value="field.value"
              @update:model-value="handleChange"
              id="email"
              :invalid="!!errorMessage"
              placeholder="ejemplo@correo.com"
              fluid
              autocomplete="username"
            />
          </Field>
          <ErrorMessage name="email" class="text-red-500 text-sm" />
        </div>

        <div class="flex flex-col gap-2">
          <label for="phoneNumber" class="font-medium text-gray-700"
            >Teléfono</label
          >
          <Field
            name="phoneNumber"
            v-slot="{ field, errorMessage, handleChange }"
          >
            <InputText
              :model-value="field.value"
              @update:model-value="handleChange"
              id="phoneNumber"
              :invalid="!!errorMessage"
              placeholder="+1 234 567 890"
              fluid
            />
          </Field>
          <ErrorMessage name="phoneNumber" class="text-red-500 text-sm" />
        </div>

        <div class="flex flex-col gap-2 md:col-span-2">
          <label for="role" class="font-medium text-gray-700">Rol</label>
          <Field name="role" v-slot="{ field, errorMessage, handleChange }">
            <Select
              :model-value="field.value"
              @update:model-value="handleChange"
              :options="roles"
              optionLabel="label"
              optionValue="value"
              placeholder="Selecciona un rol"
              :invalid="!!errorMessage"
              fluid
            />
          </Field>
          <ErrorMessage name="role" class="text-red-500 text-sm" />
        </div>
      </div>

      <!-- Address Information -->
      <h3 class="text-lg font-medium text-gray-700 mb-4 border-b pb-2 mt-8">
        Dirección
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="flex flex-col gap-2">
          <label for="country" class="font-medium text-gray-700">País</label>
          <Field name="country" v-slot="{ field, errorMessage, handleChange }">
            <Select
              :model-value="field.value"
              @update:model-value="handleChange"
              :options="countries"
              optionLabel="label"
              optionValue="value"
              placeholder="Selecciona país"
              :invalid="!!errorMessage"
              fluid
            />
          </Field>
          <ErrorMessage name="country" class="text-red-500 text-sm" />
        </div>

        <div class="flex flex-col gap-2">
          <label for="state" class="font-medium text-gray-700"
            >Estado / Provincia</label
          >
          <Field name="state" v-slot="{ field, errorMessage, handleChange }">
            <InputText
              :model-value="field.value"
              @update:model-value="handleChange"
              id="state"
              :invalid="!!errorMessage"
              placeholder="Estado"
              fluid
            />
          </Field>
          <ErrorMessage name="state" class="text-red-500 text-sm" />
        </div>

        <div class="flex flex-col gap-2 md:col-span-1">
          <label for="streetName" class="font-medium text-gray-700"
            >Calle</label
          >
          <Field
            name="streetName"
            v-slot="{ field, errorMessage, handleChange }"
          >
            <InputText
              :model-value="field.value"
              @update:model-value="handleChange"
              id="streetName"
              :invalid="!!errorMessage"
              placeholder="Nombre de la calle"
              fluid
            />
          </Field>
          <ErrorMessage name="streetName" class="text-red-500 text-sm" />
        </div>

        <div class="flex flex-col gap-2 md:col-span-1">
          <div class="flex gap-4">
            <div class="flex-1">
              <label
                for="streetNumber"
                class="font-medium text-gray-700 mb-2 block"
                >Número</label
              >
              <Field
                name="streetNumber"
                v-slot="{ field, errorMessage, handleChange }"
              >
                <InputText
                  :model-value="field.value"
                  @update:model-value="handleChange"
                  id="streetNumber"
                  :invalid="!!errorMessage"
                  placeholder="123"
                  fluid
                />
              </Field>
              <ErrorMessage name="streetNumber" class="text-red-500 text-sm" />
            </div>
            <div class="flex-1">
              <label for="zipCode" class="font-medium text-gray-700 mb-2 block"
                >Código Postal</label
              >
              <Field
                name="zipCode"
                v-slot="{ field, errorMessage, handleChange }"
              >
                <InputText
                  :model-value="field.value"
                  @update:model-value="handleChange"
                  id="zipCode"
                  :invalid="!!errorMessage"
                  placeholder="00000"
                  fluid
                />
              </Field>
              <ErrorMessage name="zipCode" class="text-red-500 text-sm" />
            </div>
          </div>
        </div>
      </div>

      <!-- Security -->
      <h3 class="text-lg font-medium text-gray-700 mb-4 border-b pb-2 mt-8">
        Seguridad
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="flex flex-col gap-2">
          <label for="password" class="font-medium text-gray-700"
            >Contraseña {{ userData ? "(Opcional)" : "" }}</label
          >
          <Field
            name="password"
            v-slot="{ field, errorMessage, value, handleChange }"
          >
            <Password
              :model-value="field.value"
              @update:model-value="handleChange"
              :invalid="!!errorMessage"
              toggleMask
              :feedback="false"
              placeholder="******"
              fluid
              class="w-full"
              inputClass="w-full"
              :inputProps="{ autocomplete: 'new-password' }"
            />

            <!-- Strength Meter (Only show if value is present or creating) -->
            <div
              v-if="value"
              class="h-1.5 w-full bg-gray-100 rounded-full mt-3 overflow-hidden flex"
            >
              <div
                class="h-full transition-all duration-300 ease-out rounded-full"
                :class="getStrengthColor(getPasswordStrength(value))"
                :style="{ width: `${(getPasswordStrength(value) / 4) * 100}%` }"
              ></div>
            </div>

            <!-- Validation Checklist -->
            <ul v-if="value" class="mt-3 space-y-1 text-sm">
              <li
                class="flex items-center gap-2"
                :class="
                  patterns.min8.test(value || '')
                    ? 'text-green-600'
                    : 'text-gray-500'
                "
              >
                <i
                  class="pi"
                  :class="
                    patterns.min8.test(value || '')
                      ? 'pi-check-circle'
                      : 'pi-circle'
                  "
                ></i>
                <span>Mínimo 8 caracteres</span>
              </li>
              <li
                class="flex items-center gap-2"
                :class="
                  patterns.upperLower.test(value || '')
                    ? 'text-green-600'
                    : 'text-gray-500'
                "
              >
                <i
                  class="pi"
                  :class="
                    patterns.upperLower.test(value || '')
                      ? 'pi-check-circle'
                      : 'pi-circle'
                  "
                ></i>
                <span>Mayúscula y minúscula</span>
              </li>
              <li
                class="flex items-center gap-2"
                :class="
                  patterns.number.test(value || '')
                    ? 'text-green-600'
                    : 'text-gray-500'
                "
              >
                <i
                  class="pi"
                  :class="
                    patterns.number.test(value || '')
                      ? 'pi-check-circle'
                      : 'pi-circle'
                  "
                ></i>
                <span>Al menos 1 número</span>
              </li>
              <li
                class="flex items-center gap-2"
                :class="
                  patterns.special.test(value || '')
                    ? 'text-green-600'
                    : 'text-gray-500'
                "
              >
                <i
                  class="pi"
                  :class="
                    patterns.special.test(value || '')
                      ? 'pi-check-circle'
                      : 'pi-circle'
                  "
                ></i>
                <span>Al menos 1 carácter especial</span>
              </li>
            </ul>
          </Field>
          <ErrorMessage name="password" class="text-red-500 text-sm" />
        </div>

        <div class="flex flex-col gap-2">
          <label for="confirmPassword" class="font-medium text-gray-700"
            >Confirmar Contraseña</label
          >
          <Field
            name="confirmPassword"
            v-slot="{ field, errorMessage, handleChange }"
          >
            <Password
              :model-value="field.value"
              @update:model-value="handleChange"
              :invalid="!!errorMessage"
              toggleMask
              :feedback="false"
              placeholder="******"
              fluid
              class="w-full"
              inputClass="w-full"
              :inputProps="{ autocomplete: 'new-password' }"
            />
          </Field>
          <ErrorMessage name="confirmPassword" class="text-red-500 text-sm" />
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
          :label="userData ? 'Actualizar Usuario' : 'Guardar Usuario'"
          :loading="isSubmitting"
        />
      </div>
    </Form>
  </div>
</template>
