<script setup>
import { ref, computed, onMounted, watch } from "vue";
import Chart from "primevue/chart";
import Select from "primevue/select";
import MultiSelect from "primevue/multiselect";
import api from "../services/api";

const selectedEntity = ref("users"); // 'users' | 'posts'
const entityOptions = [
  { label: "Usuarios", value: "users" },
  { label: "Posts", value: "posts" },
];

// Data processing
const usersStats = ref({
  usersByCountry: [],
  usersByRole: [],
  activityStatus: [],
  registrationsByYear: [],
  loginsByMonthYear: [],
});

const postsStats = ref({
  postsByStatus: [],
  postsByCategory: [],
  publishingTrend: [],
});

const isLoading = ref(true);

onMounted(async () => {
  try {
    const data = await api.getStats();
    usersStats.value = data.users;
    postsStats.value = data.posts;
  } catch (error) {
    console.error("Error loading stats:", error);
  } finally {
    isLoading.value = false;
  }
});

// Helper to transform API aggregate result to Chart.js format
const transformToChartData = (
  data,
  labelKey = "_id",
  valueKey = "count",
  label = "Data",
  colors = [],
) => {
  if (!data) return { labels: [], datasets: [] };
  return {
    labels: data.map((item) => item[labelKey] || "Unknown"),
    datasets: [
      {
        label,
        data: data.map((item) => item[valueKey]),
        backgroundColor: colors.length
          ? colors
          : ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
      },
    ],
  };
};

// ============================== USERS CHARTS ==============================

// --- Chart 1: Users by Country (Doughnut) ---
const countryChartData = computed(() => {
  return transformToChartData(
    usersStats.value.usersByCountry,
    "_id",
    "count",
    "Usuarios",
    [
      "#3b82f6",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#ec4899",
      "#6366f1",
      "#14b8a6",
    ],
  );
});

// --- Chart 2: Users by Role (Vertical Bar) ---
const roleChartData = computed(() => {
  return transformToChartData(
    usersStats.value.usersByRole,
    "_id",
    "count",
    "Usuarios por Rol",
    ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6"],
  );
});

// --- Chart 3: User Activity Status (Polar Area) ---
const activityChartData = computed(() => {
  return transformToChartData(
    usersStats.value.activityStatus,
    "_id",
    "count",
    "Estado de Actividad",
    ["#10b981", "#f59e0b", "#94a3b8"],
  );
});

// --- Chart 4: Registrations by Year (Bar) ---
const registrationChartData = computed(() => {
  return transformToChartData(
    usersStats.value.registrationsByYear,
    "_id",
    "count",
    "Nuevos Registros",
    ["#3b82f6"],
  );
});

// --- Chart 5: Logins by Year (Line) ---
const userYears = ref([]);
for (let i = 2019; i <= 2025; i++)
  userYears.value.push({ label: i.toString(), value: i });
const selectedUserYears = ref(userYears.value.map((y) => y.value));

const loginChartData = computed(() => {
  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  const yearColors = {
    2019: "#3b82f6",
    2020: "#ef4444",
    2021: "#10b981",
    2022: "#f59e0b",
    2023: "#8b5cf6",
    2024: "#ec4899",
    2025: "#6366f1",
  };

  const datasets = selectedUserYears.value.map((year) => {
    const loginsPerMonth = new Array(12).fill(0);

    // Check if API returned data
    if (usersStats.value.loginsByMonthYear) {
      usersStats.value.loginsByMonthYear.forEach((item) => {
        if (item._id.year === year) {
          // month is 1-based from Mongo $month
          loginsPerMonth[item._id.month - 1] = item.count;
        }
      });
    }

    const color = yearColors[year] || "#94a3b8";
    return {
      label: `${year}`,
      data: loginsPerMonth,
      fill: false,
      borderColor: color,
      backgroundColor: color,
      tension: 0.4,
    };
  });

  return { labels: months, datasets };
});

// ============================== POSTS CHARTS ==============================

// --- Chart 1: Posts by Status (Doughnut) ---
const postStatusChartData = computed(() => {
  return transformToChartData(
    postsStats.value.postsByStatus,
    "_id",
    "count",
    "Posts",
    ["#10b981", "#94a3b8"],
  );
});

// --- Chart 2: Posts by Category (Bar) ---
const postCategoryChartData = computed(() => {
  return transformToChartData(
    postsStats.value.postsByCategory,
    "_id",
    "count",
    "Posts por Categoría",
    ["#8b5cf6"],
  );
});

// --- Chart 3: Publishing Trend (Line) ---
const postYears = ref([]);
for (let i = 2020; i <= 2025; i++)
  postYears.value.push({ label: i.toString(), value: i });
const selectedPostYears = ref([2024, 2025]);

const postTrendChartData = computed(() => {
  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  const yearColors = {
    2020: "#ef4444",
    2021: "#10b981",
    2022: "#f59e0b",
    2023: "#8b5cf6",
    2024: "#ec4899",
    2025: "#6366f1",
  };

  const datasets = selectedPostYears.value.map((year) => {
    const postsPerMonth = new Array(12).fill(0);

    if (postsStats.value.publishingTrend) {
      postsStats.value.publishingTrend.forEach((item) => {
        if (item._id.year === year) {
          postsPerMonth[item._id.month - 1] = item.count;
        }
      });
    }

    const color = yearColors[year] || "#94a3b8";
    return {
      label: `${year}`,
      data: postsPerMonth,
      fill: false,
      borderColor: color,
      backgroundColor: color,
      tension: 0.4,
    };
  });

  return { labels: months, datasets };
});

// --- Common Options ---
const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom" },
  },
};

const barOptions = {
  ...commonOptions,
  scales: { y: { beginAtZero: true }, x: { grid: { display: false } } },
};
const lineOptions = {
  ...commonOptions,
  scales: { y: { beginAtZero: true }, x: { grid: { display: false } } },
  plugins: { legend: { position: "top" } },
};
const doughnutOptions = {
  ...commonOptions,
  plugins: { legend: { position: "right" } },
};
const polarOptions = {
  ...commonOptions,
  scales: { r: { grid: { color: "#f3f4f6" } } },
  plugins: { legend: { position: "right" } },
};
</script>

<template>
  <div class="space-y-6">
    <!-- Entity Switcher -->
    <div
      class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center"
    >
      <h2 class="text-xl font-bold text-gray-800">
        Métricas de {{ selectedEntity === "users" ? "Usuarios" : "Posts" }}
      </h2>
      <Select
        v-model="selectedEntity"
        :options="entityOptions"
        optionLabel="label"
        optionValue="value"
        class="w-48"
      />
    </div>

    <!-- USERS VIEW -->
    <div v-if="selectedEntity === 'users'" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        <div
          class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[350px]"
        >
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            Usuarios por País
          </h3>
          <div class="flex-1 relative">
            <Chart
              type="doughnut"
              :data="countryChartData"
              :options="doughnutOptions"
              class="h-full w-full"
            />
          </div>
        </div>
        <div
          class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[350px]"
        >
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            Estado de Actividad
          </h3>
          <div class="flex-1 relative">
            <Chart
              type="polarArea"
              :data="activityChartData"
              :options="polarOptions"
              class="h-full w-full"
            />
          </div>
        </div>
        <div
          class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[350px]"
        >
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            Usuarios por Rol
          </h3>
          <div class="flex-1 relative">
            <Chart
              type="bar"
              :data="roleChartData"
              :options="barOptions"
              class="h-full w-full"
            />
          </div>
        </div>
        <div
          class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[350px]"
        >
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            Nuevos Registros por Año
          </h3>
          <div class="flex-1 relative">
            <Chart
              type="bar"
              :data="registrationChartData"
              :options="barOptions"
              class="h-full w-full"
            />
          </div>
        </div>
      </div>
      <div
        class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px] flex flex-col"
      >
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-800">
            Actividad de Logins
          </h3>
          <MultiSelect
            v-model="selectedUserYears"
            :options="userYears"
            optionLabel="label"
            optionValue="value"
            placeholder="Años"
            display="chip"
            class="w-full md:w-60"
          />
        </div>
        <div class="flex-1 relative">
          <Chart
            type="line"
            :data="loginChartData"
            :options="lineOptions"
            class="h-full w-full"
          />
        </div>
      </div>
    </div>

    <!-- POSTS VIEW -->
    <div v-else class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[350px]"
        >
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            Posts por Estado
          </h3>
          <div class="flex-1 relative">
            <Chart
              type="doughnut"
              :data="postStatusChartData"
              :options="doughnutOptions"
              class="h-full w-full"
            />
          </div>
        </div>
        <div
          class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[350px]"
        >
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            Posts por Categoría
          </h3>
          <div class="flex-1 relative">
            <Chart
              type="bar"
              :data="postCategoryChartData"
              :options="barOptions"
              class="h-full w-full"
            />
          </div>
        </div>
      </div>
      <div
        class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px] flex flex-col"
      >
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-800">
            Tendencia de Publicaciones
          </h3>
          <MultiSelect
            v-model="selectedPostYears"
            :options="postYears"
            optionLabel="label"
            optionValue="value"
            placeholder="Años"
            display="chip"
            class="w-full md:w-60"
          />
        </div>
        <div class="flex-1 relative">
          <Chart
            type="line"
            :data="postTrendChartData"
            :options="lineOptions"
            class="h-full w-full"
          />
        </div>
      </div>
    </div>
  </div>
</template>
