<script setup>
import { ref } from 'vue';

const props = defineProps({
  activeView: String
});

const emit = defineEmits(['navigate']);

const isExpanded = ref(true);

const toggleSidebar = () => {
  isExpanded.value = !isExpanded.value;
};

const menuItems = [
  { id: 'dashboard', label: 'Inicio', icon: 'pi pi-home' },
  { id: 'users', label: 'Usuarios', icon: 'pi pi-users' },
  { id: 'posts', label: 'Posts', icon: 'pi pi-file' },
];
</script>

<template>
  <aside 
    class="bg-white shadow-lg h-screen transition-all duration-300 ease-in-out border-r border-gray-100 flex flex-col"
    :class="[isExpanded ? 'w-64' : 'w-20']"
  >
    <div class="p-4 flex items-center justify-between border-b border-gray-100 h-16">
      <span v-if="isExpanded" class="text-xl font-bold text-gray-800 truncate">Dashboard</span>
      <button 
        @click="toggleSidebar" 
        class="p-2 rounded-full hover:bg-gray-100 text-gray-600 focus:outline-none transition-colors cursor-pointer ml-auto"
      >
        <i :class="['pi', isExpanded ? 'pi-angle-left' : 'pi-angle-right']"></i>
      </button>
    </div>

    <nav class="flex-1 p-4 space-y-2">
      <button
        v-for="item in menuItems"
        :key="item.id"
        @click="emit('navigate', item.id)"
        class="w-full flex items-center p-3 rounded-lg transition-colors duration-200 group cursor-pointer"
        :class="[
          activeView === item.id 
            ? 'bg-primary-50 text-primary-600' 
            : 'text-gray-600 hover:bg-gray-50'
        ]"
      >
        <i :class="[item.icon, 'text-xl mr-3']"></i>
        <span 
          v-if="isExpanded" 
          class="font-medium whitespace-nowrap transition-opacity duration-200"
        >
          {{ item.label }}
        </span>
      </button>
    </nav>
  </aside>
</template>

