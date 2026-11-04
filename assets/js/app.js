/* Sitara Application Hub — Vue.js 3 application */

const { createApp, ref, computed, reactive, onMounted, watch } = Vue;

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
    single: true,
  },
  {
    key: 'toolchain',
    label: 'Toolchain',
    options: ['GCC', 'TI CCS', 'Yocto', 'CMake'],
  },
];

createApp({
  setup() {
    // ── Data ────────────────────────────────────────────────
    const allApps   = ref([]);
    const searchQuery = ref('');
    const openGroups  = reactive({});
    const activeFilters = reactive({});

    // ── Theme ────────────────────────────────────────────────
    const isDark = ref(true);

    function applyTheme(dark) {
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
      localStorage.setItem('ti-hub-theme', dark ? 'dark' : 'light');
    }

    function toggleTheme() {
      isDark.value = !isDark.value;
      applyTheme(isDark.value);
    }

    // ── Modal ────────────────────────────────────────────────
    const selectedApp = ref(null);
    const modalCopied = ref(false);

    function openModal(app) {
      selectedApp.value = app;
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      selectedApp.value = null;
      document.body.style.overflow = '';
    }

    function handleOverlayClick(e) {
      if (e.target === e.currentTarget) closeModal();
    }

    // ── Init ─────────────────────────────────────────────────
    FILTER_GROUPS.forEach((g, i) => {
      activeFilters[g.key] = new Set();
      openGroups[g.key] = i < 2;
    });

    onMounted(async () => {
      // Restore theme
      const saved = localStorage.getItem('ti-hub-theme');
      isDark.value = saved ? saved === 'dark' : true;
      applyTheme(isDark.value);

      // Load data
      try {
        const resp = await fetch('apps.json');
        allApps.value = await resp.json();
      } catch (e) {
        console.error('Failed to load apps.json', e);
      }

      // Close modal on Escape
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
      });
    });

    // ── Filtering ────────────────────────────────────────────
    const filteredApps = computed(() => {
      const q = searchQuery.value.trim().toLowerCase();
      return allApps.value.filter(app => {
        if (q) {
          const hay = [app.title, app.description, ...app.device_families, ...app.categories].join(' ').toLowerCase();
          if (!hay.includes(q)) return false;
        }
        for (const g of FILTER_GROUPS) {
          const sel = activeFilters[g.key];
          if (!sel.size) continue;
          if (g.single) {
            if (!sel.has(app[g.key])) return false;
          } else {
            if (![...sel].some(v => app[g.key].includes(v))) return false;
          }
        }
        return true;
      });
    });

    const activeChips = computed(() => {
      const chips = [];
      for (const g of FILTER_GROUPS) {
        for (const v of activeFilters[g.key]) {
          chips.push({ key: g.key, value: v, label: `${g.label}: ${v}` });
        }
      }
      return chips;
    });

    const hasAnyFilter = computed(() =>
      activeChips.value.length > 0 || searchQuery.value.trim() !== ''
    );

    function countFor(groupKey, option) {
      const q = searchQuery.value.trim().toLowerCase();
      return allApps.value.filter(app => {
        if (q) {
          const hay = [app.title, app.description, ...app.device_families, ...app.categories].join(' ').toLowerCase();
          if (!hay.includes(q)) return false;
        }
        for (const g of FILTER_GROUPS) {
          if (g.key === groupKey) continue;
          const sel = activeFilters[g.key];
          if (!sel.size) continue;
          if (g.single) { if (!sel.has(app[g.key])) return false; }
          else { if (![...sel].some(v => app[g.key].includes(v))) return false; }
        }
        const g = FILTER_GROUPS.find(x => x.key === groupKey);
        return g.single ? app[groupKey] === option : app[groupKey].includes(option);
      }).length;
    }

    // ── Actions ──────────────────────────────────────────────
    function toggleGroup(key) { openGroups[key] = !openGroups[key]; }

    function toggleFilter(key, value) {
      const s = activeFilters[key];
      s.has(value) ? s.delete(value) : s.add(value);
    }

    function removeChip(key, value) { activeFilters[key].delete(value); }

    function clearAll() {
      FILTER_GROUPS.forEach(g => activeFilters[g.key].clear());
      searchQuery.value = '';
    }

    function isChecked(key, value) { return activeFilters[key].has(value); }

    // ── Copy ─────────────────────────────────────────────────
    const copiedCardId = ref(null);

    function copyCardLink(app, e) {
      e.stopPropagation();
      navigator.clipboard.writeText(app.github_url).then(() => {
        copiedCardId.value = app.id;
        setTimeout(() => { copiedCardId.value = null; }, 1500);
      });
    }

    function copyModalLink() {
      if (!selectedApp.value) return;
      navigator.clipboard.writeText(selectedApp.value.github_url).then(() => {
        modalCopied.value = true;
        setTimeout(() => { modalCopied.value = false; }, 1500);
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
      isDark,
      toggleTheme,
      selectedApp,
      modalCopied,
      openModal,
      closeModal,
      handleOverlayClick,
      copiedCardId,
      copyCardLink,
      copyModalLink,
    };
  },
}).mount('#app');
