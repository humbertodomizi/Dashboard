<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import Sidebar from "./components/Sidebar.vue";
import Button from "primevue/button";

const route = useRoute();
const router = useRouter();

// Computed
const showBackButton = computed(() => {
  // Show back button if we are in a sub-route like /users/new or /users/1/edit
  // Simple check: more than 1 segment depth or specifically 'create'/'edit' in name
  return (
    route.name &&
    (route.name.includes("-create") || route.name.includes("-edit"))
  );
});

const getPageTitle = computed(() => {
  switch (route.name) {
    case "dashboard":
      return "Dashboard";
    case "users":
      return "Usuarios";
    case "user-create":
      return "Nuevo Usuario";
    case "user-edit":
      return "Editar Usuario";
    case "posts":
      return "Posts";
    case "post-create":
      return "Nuevo Post";
    case "post-edit":
      return "Editar Post";
    default:
      return "Dashboard";
  }
});

const goBack = () => {
  router.back();
};

// We can get the active view from the route path
const activeView = computed(() => {
  if (route.path.startsWith("/users")) return "users";
  if (route.path.startsWith("/posts")) return "posts";
  return "dashboard";
});

const handleSidebarNavigate = (viewId) => {
  if (viewId === "dashboard") router.push("/");
  else router.push(`/${viewId}`);
};
</script>

<template>
  <div class="flex h-screen bg-gray-50 font-sans text-gray-900">
    <!-- Sidebar -->
    <Sidebar :activeView="activeView" @navigate="handleSidebarNavigate" />

    <!-- Main Content -->
    <main
      class="flex-1 flex flex-col overflow-hidden transition-all duration-300"
    >
      <!-- Top Bar -->
      <header
        class="h-16 bg-white shadow-sm flex items-center px-6 justify-between border-b border-gray-100"
      >
        <div class="flex items-center gap-4">
          <Button
            v-if="showBackButton"
            icon="pi pi-arrow-left"
            text
            rounded
            aria-label="Volver"
            @click="goBack"
            class="p-0 w-10 h-10 text-gray-600 hover:bg-gray-100"
          />
          <h1 class="text-xl font-semibold text-gray-800">
            {{ getPageTitle }}
          </h1>
        </div>

        <!-- User Profile / Settings placeholder -->
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm"
          >
            AD
          </div>
          <span class="text-sm font-medium text-gray-600">Admin User</span>
        </div>
      </header>

      <!-- Content Area -->
      <div class="flex-1 overflow-auto p-6">
        <div class="max-w-7xl mx-auto w-full">
          <router-view v-slot="{ Component }">
            <Transition name="fade" mode="out-in">
              <component :is="Component" class="h-full" />
            </Transition>
          </router-view>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
/* Global overrides or utilities if needed */
:root {
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
