/* Sitara Application Hub — Vue.js 3 application */

const { createApp, ref, computed, reactive, onMounted } = Vue;

// ── Filter group definitions ─────────────────────────────
const FILTER_GROUPS = [
  {
    key: 'device_families',
    label: 'Device Family',
    options: ['AM62x', 'AM62Ax', 'AM62Px', 'AM64x', 'AM65x', 'AM67', 'AM68x', 'AM69x'],
  },
  {
    key: 'os',
    label: 'Operating System',
    options: ['Linux', 'RTOS', 'Android', 'Buildroot', 'Debian'],
  },
  {
    key: 'categories',
    label: 'Category',
    options: ['AI/ML', 'Motor Control', 'Industrial', 'Vision', 'HMI', 'Networking', 'Security', 'Audio', 'Graphics', 'IoT'],
  },
  {
    key: 'item_type',
    label: 'Item Type',
    options: ['Demo', 'Reference Design', 'Application Note', 'Application SW Pack'],
    single: true, // item_type is a string, not array
  },
  {
    key: 'toolchain',
    label: 'Toolchain',
    options: ['GCC', 'TI CCS', 'Yocto', 'CMake'],
  },
];

// ── App ─────────────────────────────────────────────────
createApp({
  setup() {
    const allApps = ref([]);
    const searchQuery = ref('');
    const openGroups = reactive({});
    const activeFilters = reactive({}); // { key: Set<string> }

    // Init filter state and open first two groups by default
    FILTER_GROUPS.forEach((g, i) => {
      activeFilters[g.key] = new Set();
      openGroups[g.key] = i < 2;
    });

    onMounted(async () => {
      const resp = await fetch('apps.json');
      allApps.value = await resp.json();
    });

    // ── Computed: filtered apps ──────────────────────────
    const filteredApps = computed(() => {
      const q = searchQuery.value.trim().toLowerCase();

      return allApps.value.filter(app => {
        // Search filter
        if (q) {
          const hay = `${app.title} ${app.description} ${app.device_families.join(' ')} ${app.categories.join(' ')}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }

        // Checkbox filters
        for (const group of FILTER_GROUPS) {
          const selected = activeFilters[group.key];
          if (selected.size === 0) continue;

          if (group.single) {
            // item_type is a plain string
            if (!selected.has(app[group.key])) return false;
          } else {
            // array fields: app must have at least one selected value
            const appValues = app[group.key];
            const hasMatch = [...selected].some(v => appValues.includes(v));
            if (!hasMatch) return false;
          }
        }

        return true;
      });
    });

    // ── Computed: active filter chips (for toolbar) ──────
    const activeChips = computed(() => {
      const chips = [];
      for (const group of FILTER_GROUPS) {
        for (const val of activeFilters[group.key]) {
          chips.push({ key: group.key, value: val, label: `${group.label}: ${val}` });
        }
      }
      return chips;
    });

    const hasAnyFilter = computed(() =>
      activeChips.value.length > 0 || searchQuery.value.trim() !== ''
    );

    // ── Computed: option counts based on current filters ─
    function countFor(groupKey, option) {
      // Count apps matching all OTHER active filters plus this option
      const q = searchQuery.value.trim().toLowerCase();
      return allApps.value.filter(app => {
        if (q) {
          const hay = `${app.title} ${app.description} ${app.device_families.join(' ')} ${app.categories.join(' ')}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        for (const group of FILTER_GROUPS) {
          if (group.key === groupKey) continue;
          const selected = activeFilters[group.key];
          if (selected.size === 0) continue;
          if (group.single) {
            if (!selected.has(app[group.key])) return false;
          } else {
            const hasMatch = [...selected].some(v => app[group.key].includes(v));
            if (!hasMatch) return false;
          }
        }
        // Check if this option matches
        const group = FILTER_GROUPS.find(g => g.key === groupKey);
        if (group.single) return app[groupKey] === option;
        return app[groupKey].includes(option);
      }).length;
    }

    // ── Actions ──────────────────────────────────────────
    function toggleGroup(key) {
      openGroups[key] = !openGroups[key];
    }

    function toggleFilter(key, value) {
      const set = activeFilters[key];
      if (set.has(value)) {
        set.delete(value);
      } else {
        set.add(value);
      }
    }

    function removeChip(key, value) {
      activeFilters[key].delete(value);
    }

    function clearAll() {
      FILTER_GROUPS.forEach(g => activeFilters[g.key].clear());
      searchQuery.value = '';
    }

    function isChecked(key, value) {
      return activeFilters[key].has(value);
    }

    // ── Copy link ────────────────────────────────────────
    const copiedId = ref(null);

    function copyLink(app) {
      const url = app.github_url;
      navigator.clipboard.writeText(url).then(() => {
        copiedId.value = app.id;
        setTimeout(() => { copiedId.value = null; }, 1500);
      });
    }

    return {
      FILTER_GROUPS,
      allApps,
      searchQuery,
      openGroups,
      activeFilters,
      filteredApps,
      activeChips,
      hasAnyFilter,
      countFor,
      toggleGroup,
      toggleFilter,
      removeChip,
      clearAll,
      isChecked,
      copiedId,
      copyLink,
    };
  },
}).mount('#app');
