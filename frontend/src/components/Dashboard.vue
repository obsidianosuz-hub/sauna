<template>
  <div class="min-h-screen flex bg-zinc-50/50 text-zinc-950 font-sans">
    
    <!-- LEFT SIDEBAR -->
    <aside class="w-64 bg-white border-r border-zinc-200/80 flex flex-col justify-between p-6">
      <div class="space-y-8">
        <!-- Logo -->
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-black border-2 border-[#c5a059] flex items-center justify-center text-[#c5a059] font-black text-xl">S</div>
          <div>
            <h1 class="font-bold text-base leading-none tracking-tight text-zinc-950">SAUNA.UZ</h1>
            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Automation</span>
          </div>
        </div>

        <!-- Restructured Navigation Menus -->
        <nav class="space-y-2">
          <!-- Boshqaruv Paneli (Parent Menu) -->
          <div>
            <button 
              @click="dashboardMenuOpen = !dashboardMenuOpen"
              class="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/70 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <span>📊</span>
                <span>{{ t('nav_dashboard') }}</span>
              </div>
              <span class="text-xs transition-transform duration-200" :class="dashboardMenuOpen ? 'rotate-90' : ''">▶</span>
            </button>
            
            <!-- Dashboard Submenus (Filtered by Role Permission) -->
            <div v-show="dashboardMenuOpen" class="pl-4 mt-1 space-y-1 border-l border-zinc-200 ml-5">
              <template v-for="sub in visibleSubItems" :key="sub.id">
                <!-- Normal single menu item -->
                <button 
                  v-if="!sub.hasChildren"
                  @click="activeTab = sub.id"
                  :class="[
                    'w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150',
                    activeTab === sub.id 
                      ? 'bg-zinc-950 text-white shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/70'
                  ]"
                >
                  <span>{{ sub.icon }}</span>
                  <span>{{ t(sub.labelKey) }}</span>
                </button>

                <!-- Dropdown menu item (Rooms Status) -->
                <div v-else-if="sub.id === 'rooms'" class="space-y-1">
                  <button 
                    @click="roomsMenuOpen = !roomsMenuOpen; activeTab = 'rooms'"
                    :class="[
                      'w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150',
                      (activeTab === 'rooms' || activeTab === 'rooms_sauna' || activeTab === 'rooms_hammom')
                        ? 'bg-zinc-950 text-white shadow-sm' 
                        : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/70'
                    ]"
                  >
                    <div class="flex items-center space-x-3">
                      <span>{{ sub.icon }}</span>
                      <span>{{ t(sub.labelKey) }}</span>
                    </div>
                    <span class="text-[8px] transition-transform duration-200" :class="roomsMenuOpen ? 'rotate-90' : ''">▶</span>
                  </button>

                  <!-- Nested sub-menu items -->
                  <div v-show="roomsMenuOpen" class="pl-6 space-y-1">
                    <button 
                      @click="activeTab = 'rooms_hammom'"
                      :class="[
                        'w-full flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-150',
                        activeTab === 'rooms_hammom'
                          ? 'text-zinc-950 bg-zinc-100 font-bold' 
                          : 'text-zinc-400 hover:text-zinc-800'
                      ]"
                    >
                      <span>🛁</span>
                      <span>{{ t('nav_rooms_hammom') }}</span>
                    </button>
                    
                    <button 
                      @click="activeTab = 'rooms_sauna'"
                      :class="[
                        'w-full flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-150',
                        activeTab === 'rooms_sauna'
                          ? 'text-zinc-950 bg-zinc-100 font-bold' 
                          : 'text-zinc-400 hover:text-zinc-800'
                      ]"
                    >
                      <span>🔥</span>
                      <span>{{ t('nav_rooms_sauna') }}</span>
                    </button>
                  </div>
                </div>

                <!-- Dropdown menu item (Staff & Attendance) -->
                <div v-else-if="sub.id === 'staff'" class="space-y-1">
                  <button 
                    @click="staffMenuOpen = !staffMenuOpen; activeTab = 'staff'"
                    :class="[
                      'w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150',
                      (activeTab === 'staff' || activeTab === 'face_id')
                        ? 'bg-zinc-950 text-white shadow-sm' 
                        : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/70'
                    ]"
                  >
                    <div class="flex items-center space-x-3">
                      <span>{{ sub.icon }}</span>
                      <span>{{ t(sub.labelKey) }}</span>
                    </div>
                    <span class="text-[8px] transition-transform duration-200" :class="staffMenuOpen ? 'rotate-90' : ''">▶</span>
                  </button>

                  <!-- Nested sub-menu items -->
                  <div v-show="staffMenuOpen" class="pl-6 space-y-1">
                    <button 
                      @click="activeTab = 'staff'"
                      :class="[
                        'w-full flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-150',
                        activeTab === 'staff'
                          ? 'text-zinc-950 bg-zinc-100 font-bold' 
                          : 'text-zinc-400 hover:text-zinc-800'
                      ]"
                    >
                      <span>👥</span>
                      <span>Xodimlar Ro'yxati</span>
                    </button>
                    
                    <button 
                      v-if="hasAccess('face_id')"
                      @click="activeTab = 'face_id'"
                      :class="[
                        'w-full flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-150',
                        activeTab === 'face_id'
                          ? 'text-zinc-950 bg-zinc-100 font-bold' 
                          : 'text-zinc-400 hover:text-zinc-800'
                      ]"
                    >
                      <span>📷</span>
                      <span>Face ID Nazorati</span>
                    </button>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- Omborxona Dropdown Menu -->
          <div v-if="hasAccess('warehouse')" class="space-y-1">
            <button 
              @click="warehouseMenuOpen = !warehouseMenuOpen; activeTab = 'warehouse'"
              :class="[
                'w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-150',
                (activeTab === 'warehouse' || activeTab === 'warehouse_scan')
                  ? 'bg-zinc-950 text-white shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/70'
              ]"
            >
              <div class="flex items-center space-x-3">
                <span>📦</span>
                <span>{{ t('nav_warehouse') }}</span>
              </div>
              <span class="text-xs transition-transform duration-200" :class="warehouseMenuOpen ? 'rotate-90' : ''">▶</span>
            </button>

            <!-- Nested sub-menu items for warehouse -->
            <div v-show="warehouseMenuOpen" class="pl-6 space-y-1">
              <button 
                @click="activeTab = 'warehouse'"
                :class="[
                  'w-full flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
                  activeTab === 'warehouse'
                    ? 'text-zinc-950 bg-zinc-100 font-bold' 
                    : 'text-zinc-400 hover:text-zinc-800'
                ]"
              >
                <span>📋</span>
                <span>Ombor Qoldig'i</span>
              </button>
              
              <button 
                @click="activeTab = 'warehouse_scan'"
                :class="[
                  'w-full flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
                  activeTab === 'warehouse_scan'
                    ? 'text-zinc-950 bg-zinc-100 font-bold' 
                    : 'text-zinc-400 hover:text-zinc-800'
                ]"
              >
                <span>🏷️</span>
                <span>Skaner Kiritish</span>
              </button>
            </div>
          </div>

          <!-- Sozlamalar Menu (Top-level under Dashboard, open for all) -->
          <button 
            v-if="hasAccess('settings')"
            @click="activeTab = 'settings'"
            :class="[
              'w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-150',
              activeTab === 'settings' 
                ? 'bg-zinc-950 text-white shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/70'
            ]"
          >
            <span>⚙️</span>
            <span>{{ t('nav_settings') }}</span>
          </button>

          <!-- Oxirgi amallar (Audit Logs) Menu (Visible only to super_admin/manager) -->
          <button 
            v-if="hasAccess('audit_logs')"
            @click="activeTab = 'audit_logs'"
            :class="[
              'w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-150',
              activeTab === 'audit_logs' 
                ? 'bg-zinc-950 text-white shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/70'
            ]"
          >
            <span>📜</span>
            <span>{{ t('nav_audit_logs') }}</span>
          </button>
        </nav>
      </div>

      <!-- User Profile Box -->
      <div class="bg-zinc-50 border border-zinc-100 rounded-2xl p-4">
        <div class="flex items-center space-x-3 mb-3">
          <div class="w-9 h-9 rounded-full bg-zinc-200 flex items-center justify-center font-bold text-zinc-700 text-sm">
            {{ user?.name?.charAt(0) }}
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-xs font-bold text-zinc-900 leading-tight truncate">{{ user?.name }}</h4>
            <span class="text-[10px] font-semibold text-zinc-400 capitalize">{{ user?.role }}</span>
          </div>
        </div>

        <button 
          @click="logout"
          class="w-full text-center text-xs font-bold py-2 bg-white border border-zinc-200 text-zinc-500 rounded-xl hover:text-zinc-900 hover:border-zinc-300 transition mb-2"
        >
          {{ t('logout') }}
        </button>

        <a 
          href="http://localhost:5173"
          class="w-full text-center text-xs font-bold py-2 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition block"
          style="display: flex; align-items: center; justify-content: center; gap: 6px;"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Demodan Chiqish
        </a>
      </div>
    </aside>

    <!-- MAIN BODY -->
    <main class="flex-1 flex flex-col min-w-0">
      
      <!-- Topbar Header -->
      <header class="bg-white border-b border-zinc-200/80 px-8 py-4 flex justify-between items-center">
        <!-- Dashboard Live Analytics Header -->
        <div class="flex items-center space-x-6">
          <h2 class="text-base font-bold text-zinc-900 tracking-tight">{{ t('dashboard_label') }}</h2>
          <div class="h-4 w-px bg-zinc-200"></div>
          <span class="text-xs font-semibold text-zinc-400">{{ formattedDate }}</span>
        </div>

        <!-- Clock & Language Selector -->
        <div class="flex items-center space-x-4">
          <span class="text-xs font-bold text-zinc-800 bg-zinc-50 border border-zinc-100 px-3 py-1.5 rounded-lg">
            {{ currentTime }}
          </span>
        </div>
      </header>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto p-8">
        
        <!-- Tab Content Routing -->

        <!-- TAB 0: DASHBOARD OVERVIEW HOME (DAILY STATISTICS & RESOURCE MONITOR) -->
        <div v-if="activeTab === 'dashboard_home'" class="space-y-8">
          
          <!-- 1. Top Row: 3 Financial Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Tushum -->
            <div class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between">
              <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Kunlik Tushum</span>
              <h3 class="text-xl font-black text-zinc-950 mt-2">{{ financeMetrics.totalRevenue.toLocaleString() }} UZS</h3>
              <span class="text-[10px] text-emerald-600 font-bold mt-2">↑ 12% kechagidan</span>
            </div>

            <!-- Chiqimlar -->
            <div class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between">
              <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Kunlik Chiqim</span>
              <h3 class="text-xl font-black text-zinc-950 mt-2">{{ financeMetrics.totalExpenses.toLocaleString() }} UZS</h3>
              <span class="text-[10px] text-rose-500 font-bold mt-2">⚡ Kommunal va maoshlar</span>
            </div>

            <!-- Sof Foyda -->
            <div class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-5 border-l-4 border-l-[#c5a059] relative overflow-hidden flex flex-col justify-between">
              <span class="text-[10px] font-bold text-[#c5a059] uppercase tracking-wider block">Kunlik Sof Foyda</span>
              <h3 class="text-xl font-black text-[#c5a059] mt-2">{{ (financeMetrics.totalRevenue - financeMetrics.totalExpenses).toLocaleString() }} UZS</h3>
              <span class="text-[9px] text-[#c5a059] font-black uppercase tracking-widest mt-2">Classic Oltin</span>
            </div>
          </div>

          <!-- 2. Rooms Timeline Calendar directly on Dashboard Home -->
          <div class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6">
            <div class="mb-4">
              <h3 class="text-sm font-bold text-zinc-950 uppercase tracking-wider flex items-center">
                <span>🛁</span> Xonalar Ro'yxati va Bandlik Jadvali
              </h3>
              <p class="text-[10px] text-zinc-400">Xonalarning bandlik holati, mijozlar buyurtmalari va xizmat ko'rsatish monitori</p>
            </div>
            <TimelineCalendar />
          </div>

        </div>

        <!-- TAB 1: ROOMS TIMELINE CALENDAR -->
        <div v-if="activeTab === 'rooms'">
          <TimelineCalendar type="all" />
        </div>
        <div v-else-if="activeTab === 'rooms_hammom'">
          <TimelineCalendar type="hamom" />
        </div>
        <div v-else-if="activeTab === 'rooms_sauna'">
          <TimelineCalendar type="sauna" />
        </div>

        <!-- TAB 2: STAFF / DEVDOMAT & FACE ID CAMERA SIMULATOR -->
        <div v-else-if="activeTab === 'staff'" class="space-y-6">
          <div v-if="!hasAccess('staff')" class="bg-white border border-zinc-200 rounded-3xl p-12 text-center max-w-xl mx-auto mt-12">
            <span class="text-4xl">⚠️</span>
            <h3 class="text-lg font-bold text-zinc-950 mt-4 mb-2">Ruxsat Cheklangan</h3>
            <p class="text-sm text-zinc-500">Xodimlar va davomat boshqaruvi bo'limiga kirish uchun faqat Super Admin ruxsati talab etiladi.</p>
          </div>

          <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
<div class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6 lg:col-span-2 space-y-6">
              <div class="flex justify-between items-center flex-wrap gap-4 w-full">
                <div>
                  <h3 class="text-lg font-bold text-zinc-950">Xodimlar Boshqaruvi va Davomat</h3>
                  <p class="text-xs text-zinc-400">Ish haqi nazorati, kunlik kelgan-kelmaganlik holati, KPI tizimi va jarimalar</p>
                </div>
                <button 
                  @click="openAddEmployeeModal"
                  class="bg-black text-white hover:bg-zinc-800 text-xs font-bold px-4 py-2.5 rounded-xl transition active:scale-95 flex items-center space-x-1.5"
                >
                  <span>➕</span>
                  <span>Yangi Xodim Qo'shish</span>
                </button>
              </div>

              <!-- Group selector buttons -->
              <div class="flex space-x-2 border-b border-zinc-100 pb-3 flex-wrap gap-2">
                <button 
                  v-for="role in ['all', 'cashier', 'inspector', 'cleaner']" 
                  :key="role"
                  @click="selectedStaffRole = role"
                  :class="[
                    'px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-150 active:scale-95',
                    selectedStaffRole === role 
                      ? 'bg-black text-white border-black' 
                      : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                  ]"
                >
                  {{ role === 'all' ? 'Barcha Xodimlar' : role === 'cashier' ? 'Kassirlar' : role === 'inspector' ? 'Nazoratchilar' : 'Farroshlar' }}
                </button>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                  <thead>
                    <tr class="text-xs text-zinc-400 border-b border-zinc-100 uppercase tracking-wider font-bold">
                      <th class="py-3">Ismi</th>
                      <th class="py-3">Lavozimi</th>
                      <th class="py-3">Asosiy Oylik</th>
                      <th class="py-3">Davomat</th>
                      <th class="py-3">KPI Score</th>
                      <th class="py-3">Mukofot/Jarima</th>
                      <th class="py-3 text-right">Yakuniy Oylik</th>
                      <th class="py-3 text-center">Harakat</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="emp in filteredStaffList" :key="emp.id" class="border-b border-zinc-50 font-medium hover:bg-zinc-50/50">
                      <td class="py-3.5 font-bold text-zinc-900">{{ emp.name }}</td>
                      <td class="py-3.5 text-xs text-zinc-400 uppercase tracking-wider">{{ emp.role === 'cashier' ? 'Kassir' : emp.role === 'inspector' ? 'Nazoratchi' : 'Tozalovchi' }}</td>
                      <td class="py-3.5">{{ emp.salary.toLocaleString() }} UZS</td>
                      
                      <!-- Daily check-in status selector -->
                      <td class="py-3.5">
                        <select 
                          v-model="emp.attendanceStatus"
                          @change="updateAttendance(emp.id, emp.attendanceStatus)"
                          class="bg-zinc-50 border border-zinc-200 text-xs rounded-lg px-2 py-1 focus:outline-none"
                        >
                          <option value="present">Keldi (1.0)</option>
                          <option value="half_day">Yarim kun (0.5)</option>
                          <option value="absent">Kelmadi (0.0)</option>
                        </select>
                      </td>

                      <!-- KPI score -->
                      <td class="py-3.5">
                        <span :class="[
                          'px-2 py-0.5 rounded text-xs font-bold',
                          emp.kpi >= 100 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                        ]">
                          {{ emp.kpi }}
                        </span>
                      </td>

                      <!-- Bonus / penalty details -->
                      <td class="py-3.5 text-xs">
                        <div class="flex flex-col">
                          <span class="text-emerald-600 font-bold">+{{ emp.bonus.toLocaleString() }} UZS</span>
                          <span class="text-rose-500 font-bold">-{{ emp.penalty.toLocaleString() }} UZS</span>
                        </div>
                      </td>

                      <!-- Final payout math -->
                      <td class="py-3.5 text-right font-black text-zinc-950">
                        {{ (emp.salary + emp.bonus - emp.penalty).toLocaleString() }} UZS
                      </td>

                      <!-- Rating feedback for KPI scoring -->
                      <td class="py-3.5 text-center">
                        <div class="flex items-center justify-center space-x-2">
                          <button 
                            @click="openEditEmployeeModal(emp)" 
                            class="text-zinc-400 hover:text-zinc-900 transition text-xs p-1"
                            title="Tahrirlash"
                          >
                            ✏️
                          </button>
                          <button 
                            @click="confirmDeleteEmployee(emp.id)" 
                            class="text-rose-450 hover:text-rose-600 transition text-xs p-1"
                            title="O'chirish"
                          >
                            🗑️
                          </button>
                          <span class="text-zinc-200">|</span>
                          
                          <div v-if="emp.role === 'cleaner'" class="flex space-x-1">
                            <button @click="rateEmployee(emp.id, 5)" class="bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/20 text-[9px] px-1.5 py-0.5 rounded hover:bg-[#c5a059] hover:text-white transition">⭐️ 5</button>
                            <button @click="rateEmployee(emp.id, 2)" class="bg-rose-50 text-rose-600 border border-rose-100 text-[9px] px-1.5 py-0.5 rounded hover:bg-rose-600 hover:text-white transition">⭐️ 2</button>
                          </div>
                          <div v-else-if="emp.role === 'inspector'" class="flex space-x-1">
                            <button @click="rateEmployee(emp.id, 5)" class="bg-zinc-50 border border-zinc-200 text-[9px] px-1.5 py-0.5 rounded hover:bg-zinc-100">Tasdiq</button>
                          </div>
                          <span v-else class="text-zinc-450 text-[10px]">N/A</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Face ID Security Camera Simulator -->
            <div class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6 flex flex-col justify-between">
              <div class="space-y-4">
                <div>
                  <h3 class="text-base font-bold text-zinc-950 flex items-center">
                    <span class="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping mr-2"></span>
                    Face ID Kuzatuv Kamerasi
                  </h3>
                  <p class="text-xs text-zinc-400">Xodim ish joyiga kelganida yuzni tanish tizimi simulyatsiyasi</p>
                </div>

                <!-- Camera screen layout -->
                <div class="relative bg-zinc-950 aspect-video rounded-2xl flex items-center justify-center overflow-hidden border border-zinc-800">
                  <div class="absolute inset-0 border border-zinc-700 m-4 border-dashed rounded-lg flex items-center justify-center flex-col text-zinc-600">
                    <div class="w-12 h-12 border-2 border-emerald-500 rounded-full flex items-center justify-center text-emerald-500 font-black animate-pulse">
                      [ ]
                    </div>
                    <span class="text-[10px] text-zinc-500 uppercase tracking-widest mt-2">Kuzatilmoqda</span>
                  </div>
                </div>

                <!-- Control check-in -->
                <div>
                  <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Simulyatsiya uchun xodimni tanlang</label>
                  <select 
                    v-model="faceIdEmp"
                    class="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none"
                  >
                    <option v-for="emp in staffList" :key="emp.id" :value="emp.id">{{ emp.name }} ({{ emp.role }})</option>
                  </select>
                </div>
              </div>

              <button 
                @click="triggerFaceIdCheck"
                class="w-full bg-black hover:bg-zinc-800 text-white text-xs font-bold py-3 rounded-xl transition active:scale-95 mt-6"
              >
                Face ID orqali taniy olish simulyatsiyasi
              </button>
            </div>
          </div>
        <!-- MODAL: ADD EMPLOYEE -->
        <div v-if="showAddEmployeeModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl p-6 max-w-md w-full border border-zinc-100 shadow-2xl space-y-4 text-left">
            <div class="flex justify-between items-center">
              <h3 class="text-base font-bold text-zinc-950">➕ Yangi Xodim Qo'shish</h3>
              <button @click="showAddEmployeeModal = false" class="text-zinc-400 hover:text-zinc-900 font-extrabold text-sm">✕</button>
            </div>
            
            <form @submit.prevent="submitAddEmployee" class="space-y-4 text-xs font-semibold">
              <div class="space-y-1">
                <label class="block text-zinc-400 uppercase tracking-wider text-[10px]">Xodim Ismi (F.I.SH.)</label>
                <input 
                  v-model="employeeForm.name" 
                  type="text" 
                  required 
                  placeholder="Masalan: Rustam Kamolov"
                  class="w-full border border-zinc-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-black font-medium"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="block text-zinc-400 uppercase tracking-wider text-[10px]">Lavozimi (Rol)</label>
                  <select 
                    v-model="employeeForm.role" 
                    required
                    class="w-full border border-zinc-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-black font-medium"
                  >
                    <option value="cashier">Kassir</option>
                    <option value="barman">Barman</option>
                    <option value="cleaner">Tozalovchi (Farrosh)</option>
                    <option value="inspector">Nazoratchi</option>
                    <option value="manager">Menejer</option>
                  </select>
                </div>

                <div class="space-y-1">
                  <label class="block text-zinc-400 uppercase tracking-wider text-[10px]">Pasport (Seriya va Soni)</label>
                  <input 
                    v-model="employeeForm.passportNumber" 
                    type="text" 
                    placeholder="Masalan: AA1234567"
                    class="w-full border border-zinc-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-black font-medium"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="block text-zinc-400 uppercase tracking-wider text-[10px]">Oylik maoshi (UZS)</label>
                  <input 
                    v-model="employeeForm.salary" 
                    type="number" 
                    required
                    min="0"
                    class="w-full border border-zinc-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-black font-medium"
                  />
                </div>

                <div class="space-y-1">
                  <label class="block text-zinc-400 uppercase tracking-wider text-[10px]">PIN-kod (Tizimga kirish)</label>
                  <input 
                    v-model="employeeForm.pinCode" 
                    type="text" 
                    required
                    pattern="[0-9]{4,8}"
                    placeholder="Masalan: 1234"
                    class="w-full border border-zinc-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-black font-medium"
                  />
                </div>
              </div>

              <!-- Face Biometric Enrollment Field -->
              <div class="space-y-1.5 border-t border-zinc-100 pt-3">
                <label class="block text-zinc-400 uppercase tracking-wider text-[10px]">Rasm va Yuz ID Biometriyasi (Face ID)</label>
                <div class="flex flex-col items-center space-y-2">
                  <!-- Live video for registration capture -->
                  <div class="w-full aspect-video bg-zinc-950 rounded-2xl overflow-hidden relative border border-zinc-200 shadow-inner flex items-center justify-center">
                    <video 
                      id="modalWebcamVideo" 
                      autoplay 
                      playsinline 
                      muted
                      class="w-full h-full object-cover absolute inset-0"
                    ></video>
                    
                    <!-- Captured snapshot image overlay -->
                    <img 
                      v-if="capturedPhotoData" 
                      :src="capturedPhotoData" 
                      class="w-full h-full object-cover absolute inset-0 z-20"
                    />

                    <!-- Camera status indicator -->
                    <div class="absolute bottom-2 left-2 text-[8px] font-black text-emerald-400 uppercase bg-black/60 px-2 py-0.5 rounded z-30">
                      {{ capturedPhotoData ? 'Muvaffaqiyatli saqlandi' : 'Kamera faol' }}
                    </div>
                  </div>

                  <div class="flex items-center justify-between w-full">
                    <button 
                      type="button" 
                      @click="captureRealFace"
                      class="bg-zinc-950 hover:bg-zinc-800 text-white px-3 py-2 rounded-xl text-[10px] font-bold transition flex items-center space-x-1.5"
                    >
                      <span>📸</span>
                      <span>{{ capturedPhotoData ? 'Qaytadan Skanerlash' : 'Yuzni Skanerlash' }}</span>
                    </button>
                    
                    <span class="text-[9px] font-bold" :class="capturedPhotoData ? 'text-emerald-600' : 'text-rose-500'">
                      {{ capturedPhotoData ? '✓ Rasm va Yuz ID tayyor' : '✗ Rasm olinmagan' }}
                    </span>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                class="w-full bg-black hover:bg-zinc-800 text-white text-xs font-bold py-3 rounded-xl transition"
              >
                Xodimni Ro'yxatga Olish
              </button>
            </form>
          </div>
        </div>

        <!-- MODAL: EDIT EMPLOYEE -->
        <div v-if="showEditEmployeeModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl p-6 max-w-md w-full border border-zinc-100 shadow-2xl space-y-4 text-left">
            <div class="flex justify-between items-center">
              <h3 class="text-base font-bold text-zinc-950">✏️ Xodim Ma'lumotlarini Tahrirlash</h3>
              <button @click="showEditEmployeeModal = false" class="text-zinc-400 hover:text-zinc-900 font-extrabold text-sm">✕</button>
            </div>
            
            <form @submit.prevent="submitEditEmployee" class="space-y-4 text-xs font-semibold">
              <div class="space-y-1">
                <label class="block text-zinc-400 uppercase tracking-wider text-[10px]">Xodim Ismi</label>
                <input 
                  v-model="employeeForm.name" 
                  type="text" 
                  required 
                  class="w-full border border-zinc-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-black font-medium"
                />
              </div>

              <div class="space-y-1">
                <label class="block text-zinc-400 uppercase tracking-wider text-[10px]">Lavozimi (Rol)</label>
                <select 
                  v-model="employeeForm.role" 
                  required
                  class="w-full border border-zinc-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-black font-medium"
                >
                  <option value="cashier">Kassir</option>
                  <option value="barman">Barman</option>
                  <option value="cleaner">Tozalovchi</option>
                  <option value="inspector">Nazoratchi</option>
                  <option value="manager">Menejer</option>
                </select>
              </div>

              <div class="space-y-1">
                <label class="block text-zinc-400 uppercase tracking-wider text-[10px]">Oylik maoshi (UZS)</label>
                <input 
                  v-model="employeeForm.salary" 
                  type="number" 
                  required
                  min="0"
                  class="w-full border border-zinc-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-black font-medium"
                />
              </div>

              <div class="space-y-1">
                <label class="block text-zinc-400 uppercase tracking-wider text-[10px]">PIN-kod</label>
                <input 
                  v-model="employeeForm.pinCode" 
                  type="text" 
                  required
                  pattern="[0-9]{4,8}"
                  placeholder="4 dan 8 gacha raqam"
                  class="w-full border border-zinc-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-black font-medium"
                />
              </div>

              <button 
                type="submit" 
                class="w-full bg-[#c5a059] hover:bg-[#b08e4f] text-white text-xs font-bold py-3 rounded-xl transition"
              >
                O'zgarishlarni Saqlash
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- TAB 2.5: FACE ID CONTROL AND CAMERA FEED -->
      <div v-else-if="activeTab === 'face_id'" class="space-y-6">
        <div v-if="!hasAccess('face_id')" class="bg-white border border-zinc-200 rounded-3xl p-12 text-center max-w-xl mx-auto mt-12">
          <span class="text-4xl">⚠️</span>
          <h3 class="text-lg font-bold text-zinc-950 mt-4 mb-2">Ruxsat Cheklangan</h3>
          <p class="text-sm text-zinc-500">Face ID nazorati bo'limiga kirish uchun faqat Super Admin ruxsati talab etiladi.</p>
        </div>

        <div v-else class="space-y-6">
          <!-- CCTV Surveillance Camera Console -->
          <div class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6">
            <div class="flex justify-between items-center mb-6 flex-wrap gap-2">
              <div>
                <h3 class="text-lg font-bold text-zinc-950 flex items-center">
                  <span class="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping mr-2"></span>
                  Face ID & Xavfsizlik Kamerasi Kuzatuv Markazi
                </h3>
                <p class="text-xs text-zinc-400">Kameralarni ulash, yuzni tanish va xodimlar davomatini aniqlash tizimi</p>
              </div>
              
              <!-- Camera Select Dropdown -->
              <select 
                v-model="selectedCamera"
                class="bg-zinc-50 border border-zinc-200 text-xs rounded-xl px-4 py-2.5 focus:outline-none font-bold text-zinc-900"
              >
                <option value="CAM-01">CAM-01: Resepsiyon (Kassir)</option>
                <option value="CAM-02">CAM-02: Bar va Buyurtmalar</option>
                <option value="CAM-03">CAM-03: Kirish Zali</option>
                <option value="CAM-04">CAM-04: Xammom/Sauna Zali</option>
                <option v-for="cam in dbCameras" :key="cam.id" :value="cam.token">
                  {{ cam.name }} - [{{ cam.connectionAddress }}] ({{ cam.connectionType }})
                </option>
              </select>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- CCTV Monitor Viewport -->
              <div class="lg:col-span-2 relative bg-zinc-950 aspect-video rounded-3xl flex items-center justify-center overflow-hidden border border-zinc-800 shadow-inner">
                <!-- Actual Webcam Video Feed -->
                <video 
                  v-show="isUsbCameraSelected"
                  id="webcamVideo" 
                  autoplay 
                  playsinline 
                  muted
                  class="w-full h-full object-cover absolute inset-0"
                ></video>
                
                <!-- Simulated Network CCTV Stream Viewport -->
                <div v-if="!isUsbCameraSelected" class="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-400 font-mono space-y-4">
                  <!-- Radar scan effect -->
                  <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06),transparent_80%)]"></div>
                  
                  <div class="text-xs text-emerald-400 font-black tracking-widest uppercase flex items-center space-x-2 animate-pulse">
                    <span class="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <span>TARMOQ ULANISHI FAOLLASHTIRILDI</span>
                  </div>

                  <div class="bg-black/60 border border-zinc-800 rounded-2xl p-4 text-[10px] space-y-1.5 w-72 text-left z-20 shadow-lg">
                    <div><span class="text-zinc-500 font-bold">Kamera:</span> {{ selectedCameraObj?.name }}</div>
                    <div><span class="text-zinc-500 font-bold">Aloqa Turi:</span> <span class="bg-zinc-800 px-1.5 py-0.5 rounded font-black text-white text-[8px]">{{ selectedCameraObj?.connectionType }}</span></div>
                    <div><span class="text-zinc-500 font-bold">Manzil:</span> <span class="text-zinc-300 font-bold">{{ selectedCameraObj?.connectionAddress }}</span></div>
                    <div class="truncate"><span class="text-zinc-500 font-bold">API Kalit:</span> <span class="text-zinc-300">{{ selectedCameraObj?.token }}</span></div>
                    <div><span class="text-zinc-500 font-bold">Vazifasi:</span> <span class="text-zinc-300 uppercase font-black text-[9px]">{{ selectedCameraObj?.permissions === 'full_access' ? 'Kirish & Chiqish' : selectedCameraObj?.permissions === 'checkin_only' ? 'Faqat Kirish' : 'Faqat Chiqish' }}</span></div>
                    <div class="pt-1.5 border-t border-zinc-800 flex justify-between items-center text-[9px]">
                      <span class="text-emerald-500 font-bold">STATUS: STREAMING LIVE</span>
                      <span class="text-zinc-500">RTT: 12ms</span>
                    </div>
                  </div>

                  <span class="text-[9px] text-zinc-600 uppercase tracking-widest animate-pulse">Tarmoq kamerasi biometrik signallarni kutmoqda...</span>
                </div>
                
                <!-- Scanning overlay effect -->
                <div class="absolute inset-0 bg-scanline pointer-events-none opacity-20 z-10"></div>
                <!-- Camera information HUD -->
                <div class="absolute top-4 left-4 text-[10px] font-black tracking-wider text-emerald-400 uppercase bg-black/60 px-3 py-1 rounded z-10">
                  LIVE: {{ selectedCameraObj ? selectedCameraObj.name : selectedCamera }} // 1080P // 30 FPS
                </div>
                <div class="absolute top-4 right-4 text-[10px] font-black text-red-500 bg-black/60 px-3 py-1 rounded animate-pulse z-10">
                  ● REC
                </div>
                
                <!-- Biometric Face Lock Target overlay -->
                <div class="absolute inset-0 border border-zinc-800 m-4 border-dashed rounded-2xl flex items-center justify-center flex-col text-zinc-500 z-10 pointer-events-none">
                  <div class="w-20 h-20 border-2 border-emerald-500 rounded-2xl flex items-center justify-center text-emerald-500 font-bold text-lg animate-pulse relative">
                    <!-- Scanning line moving up and down -->
                    <div class="absolute w-full h-0.5 bg-emerald-500/80 shadow-[0_0_10px_#10b981] top-0 animate-bounce"></div>
                    [ ]
                  </div>
                  <span class="text-[9px] text-emerald-400 uppercase tracking-widest mt-3 font-bold bg-black/50 px-2 py-0.5 rounded">Face ID Scan Lock...</span>
                </div>
              </div>

              <!-- Simulation Trigger Console -->
              <div class="flex flex-col justify-between space-y-4 bg-zinc-50/50 p-6 border border-zinc-200 rounded-3xl">
                <div class="space-y-3.5">
                  <span class="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Yuz Tanish (Face ID Sim)</span>
                  <select 
                    v-model="faceIdEmp"
                    class="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-xs bg-white focus:outline-none font-medium text-zinc-950"
                  >
                    <option value="" disabled>Xodimni tanlang</option>
                    <option v-for="emp in staffList" :key="emp.id" :value="emp.id">
                      {{ emp.name }} ({{ emp.faceDescriptor ? 'Biometriya faol' : 'Biometriyasiz' }})
                    </option>
                  </select>

                  <div class="flex items-center space-x-2 py-1">
                    <input 
                      v-model="simulateStrangerFace" 
                      type="checkbox" 
                      id="strangerCheck"
                      class="rounded border-zinc-300 text-black focus:ring-black w-4 h-4 bg-white"
                    />
                    <label for="strangerCheck" class="text-[10px] text-zinc-500 font-bold select-none cursor-pointer uppercase tracking-wider">Notanish Yuzni Simulyatsiya Qilish</label>
                  </div>

                  <button 
                    @click="triggerFaceIdCheck"
                    type="button"
                    class="w-full bg-black hover:bg-zinc-800 text-white text-xs font-bold py-3 rounded-xl transition active:scale-95 flex items-center justify-center space-x-1.5"
                  >
                    <span>📷</span>
                    <span>Kamera Datchigini Ishga Tushir</span>
                  </button>
                </div>

                <!-- Mini feed logs -->
                <div class="bg-zinc-950 text-zinc-400 font-mono text-[10px] rounded-2xl p-4 h-48 overflow-y-auto space-y-2 scrollbar-thin">
                  <div v-for="(log, idx) in cameraLogs" :key="idx" class="text-emerald-400 leading-tight">
                    {{ log }}
                  </div>
                  <div v-if="cameraLogs.length === 0" class="text-zinc-600 italic">Kamera loglari kutilmoqda...</div>
                </div>
              </div>
            </div>
          </div>

          <!-- CAMERA API TOKENS MANAGEMENT PANEL (Directly inside Face ID Tab!) -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <!-- 1. Active Camera Links Table -->
            <div class="lg:col-span-2 bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6 space-y-4 text-left">
              <div>
                <h4 class="text-sm font-bold text-zinc-950">{{ t('camera_tokens_title') }}</h4>
                <p class="text-[11px] text-zinc-400">{{ t('camera_tokens_desc') }}</p>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr class="border-b border-zinc-150 text-zinc-400 font-bold uppercase tracking-wider text-[8px] pb-2">
                      <th class="pb-2">{{ t('name') || 'Nomi' }}</th>
                      <th class="pb-2">{{ t('connection_type_label') }}</th>
                      <th class="pb-2">{{ t('connection_address_label') }}</th>
                      <th class="pb-2">{{ t('camera_permissions_label') }}</th>
                      <th class="pb-2">API Token</th>
                      <th class="pb-2 text-right">{{ t('action') || 'Amal' }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-zinc-100">
                    <tr v-for="cam in dbCameras" :key="cam.id" class="text-zinc-700 font-semibold">
                      <td class="py-2.5 pr-2 text-zinc-950 font-bold">{{ cam.name }}</td>
                      <td class="py-2.5 pr-2">
                        <span class="px-2 py-0.5 rounded text-[8px] font-black uppercase"
                          :class="[
                            cam.connectionType === 'USB' ? 'bg-zinc-100 text-zinc-800' :
                            cam.connectionType === 'RTSP' ? 'bg-blue-50 text-blue-800 border border-blue-100' :
                            'bg-amber-50 text-amber-800 border border-amber-100'
                          ]"
                        >
                          {{ cam.connectionType }}
                        </span>
                      </td>
                      <td class="py-2.5 pr-2 text-zinc-400 font-medium max-w-[120px] truncate" :title="cam.connectionAddress">
                        {{ cam.connectionAddress }}
                      </td>
                      <td class="py-2.5 pr-2 font-bold text-zinc-600">
                        {{ 
                          cam.permissions === 'full_access' ? 'To\'liq' : 
                          cam.permissions === 'checkin_only' ? 'Kirish' : 
                          cam.permissions === 'checkout_only' ? 'Chiqish' : 
                          cam.permissions === 'employee_efficiency' ? 'KPI (Samaradorlik)' : 
                          'Mijoz Catcher (Kassa)' 
                        }}
                      </td>
                      <td class="py-2.5 pr-2 font-mono text-[9px] text-zinc-950">
                        <div class="flex items-center space-x-1.5 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded-lg w-max">
                          <span>{{ cam.token.substring(0, 10) }}...</span>
                          <button 
                            type="button"
                            @click="copyCameraTokenToClipboard(cam.token)"
                            class="text-zinc-400 hover:text-black transition text-[9px]"
                            title="Nusxalash"
                          >
                            📋
                          </button>
                        </div>
                      </td>
                      <td class="py-2.5 text-right space-x-2">
                        <button 
                          v-if="cam.customCode"
                          type="button"
                          @click="alert(`[${cam.name}] Kamera ssenariysi kodi:\n\n${cam.customCode}`)"
                          class="text-emerald-600 hover:text-emerald-800 font-bold transition text-[9px] mr-2"
                        >
                          📜 Kodni ko'rish
                        </button>
                        <button 
                          type="button"
                          @click="revokeCameraConnection(cam.id)"
                          class="text-rose-500 hover:text-rose-700 font-bold transition text-[9px]"
                        >
                          O'chirish
                        </button>
                      </td>
                    </tr>
                    <tr v-if="dbCameras.length === 0">
                      <td colspan="6" class="py-6 text-center text-zinc-400 italic">Hali ulanish tokenlari generatsiya qilinmagan. Birinchi kamerani qo'shing.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 2. Create Connection / Token generator -->
            <form @submit.prevent="generateCameraConnection" class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6 space-y-4 text-left">
              <div>
                <h4 class="text-xs font-bold text-zinc-950 uppercase tracking-wider">{{ t('camera_generator_title') }}</h4>
                <p class="text-[10px] text-zinc-400">{{ t('camera_generator_desc') }}</p>
              </div>

              <div class="space-y-3">
                <div class="space-y-1">
                  <label class="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{{ t('camera_name_label') }}</label>
                  <input 
                    v-model="cameraForm.name" 
                    type="text" 
                    required 
                    placeholder="Masalan: Asosiy turniket kamerasi"
                    class="w-full border border-zinc-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-black font-semibold text-xs text-zinc-950"
                  />
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div class="space-y-1">
                    <label class="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{{ t('connection_type_label') }}</label>
                    <select 
                      v-model="cameraForm.connectionType" 
                      required
                      class="w-full border border-zinc-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-black font-semibold text-xs text-zinc-950"
                    >
                      <option value="USB">USB veb-kamera</option>
                      <option value="RTSP">RTSP tarmoq oqimi</option>
                      <option value="HTTP">HTTP MJPEG video</option>
                      <option value="WIRELESS">Simsiz / Masofaviy API (Token)</option>
                    </select>
                  </div>
                  
                  <div class="space-y-1">
                    <label class="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{{ t('camera_permissions_label') }}</label>
                    <select 
                      v-model="cameraForm.permissions" 
                      required
                      class="w-full border border-zinc-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-black font-semibold text-xs text-zinc-950"
                    >
                      <option value="full_access">To'liq (Kirish/Chiqish)</option>
                      <option value="checkin_only">Faqat Kirish</option>
                      <option value="checkout_only">Faqat Chiqish</option>
                      <option value="employee_efficiency">Xodim Samaradorligi (KPI va Davomat Nazorati)</option>
                      <option value="cashier_visitor_catcher">Kassa Oldi Yangi Mijoz Catcher (Snapshot Log)</option>
                    </select>
                  </div>

                  <!-- Wireless remote helper alert -->
                  <div v-if="cameraForm.connectionType === 'WIRELESS'" class="col-span-2 text-[9px] text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-100/60 flex items-center space-x-1.5 mt-1 leading-normal">
                    <span>⚡</span>
                    <span>Simsiz rejim: datchik tizimga hech qanday simsiz, faqat o'zi uchun yaratilgan unikal API Token orqali internet/tarmoqdan bog'lanadi.</span>
                  </div>
                </div>

                <div class="space-y-1">
                  <label class="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{{ t('connection_address_label') }}</label>
                  
                  <!-- Select Dropdown for USB/COM Ports -->
                  <div v-if="cameraForm.connectionType === 'USB'" class="flex space-x-2">
                    <select 
                      v-model="cameraForm.connectionAddress" 
                      required
                      class="flex-1 border border-zinc-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-black font-semibold text-xs text-zinc-950"
                    >
                      <option v-for="port in availableUsbPorts" :key="port" :value="port">
                        {{ port }} (USB Serial Port)
                      </option>
                    </select>
                    <button 
                      type="button" 
                      @click="scanLocalUsbPorts"
                      class="bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 px-3 rounded-xl text-[9px] font-bold transition active:scale-95 whitespace-nowrap"
                      title="USB portlarni qayta skanerlash"
                    >
                      🔄 Skandlash
                    </button>
                  </div>

                  <!-- Standard input for RTSP / HTTP -->
                  <input 
                    v-else
                    v-model="cameraForm.connectionAddress" 
                    type="text" 
                    required
                    :disabled="cameraForm.connectionType === 'WIRELESS'"
                    placeholder="Masalan: rtsp://192.168.1.100:554/h264"
                    class="w-full border border-zinc-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-black font-semibold text-xs text-zinc-950 disabled:bg-zinc-50 disabled:text-zinc-450"
                  />
                </div>

                <div class="space-y-1">
                  <label class="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{{ t('camera_purpose_label') }}</label>
                  <input 
                    v-model="cameraForm.purpose" 
                    type="text" 
                    required 
                    placeholder="Masalan: Kirish turniket plansheti"
                    class="w-full border border-zinc-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-black font-semibold text-xs text-zinc-950"
                  />
                </div>

                <div class="space-y-1">
                  <label class="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{{ t('select_script_label') }}</label>
                  <select 
                    v-model="cameraForm.scriptId" 
                    @change="onFormScriptSelect"
                    class="w-full border border-zinc-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-black font-semibold text-xs text-zinc-950"
                  >
                    <option :value="null">-- {{ t('select_script') }} --</option>
                    <option v-for="script in cameraScripts" :key="script.id" :value="script.id">
                      {{ script.title }} ({{ script.description || 'Tavsifsiz' }})
                    </option>
                  </select>
                </div>

                <div class="space-y-1">
                  <label class="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{{ t('camera_code_label') }}</label>
                  <textarea 
                    v-model="cameraForm.customCode" 
                    rows="3"
                    placeholder="Masalan:
if detect_face() == 'Stranger':
    trigger_alarm()
    save_snapshot()
else:
    increase_kpi(5)"
                    class="w-full border border-zinc-200 rounded-xl px-3 py-2 bg-zinc-50 font-mono text-[9.5px] text-zinc-950 focus:outline-none focus:border-black placeholder:text-zinc-400"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  class="w-full bg-zinc-950 hover:bg-zinc-800 text-white text-[10px] font-bold py-2.5 rounded-xl transition active:scale-95 flex justify-center items-center space-x-1.5"
                >
                  <span>⚡</span>
                  <span>{{ t('token_create_btn') }}</span>
                </button>
              </div>
            </form>
          </div>

          <!-- KASSA OLDI SNAPSHOT TARIXI (Yangi mijozlar logi) -->
          <div class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6 mt-6 text-left space-y-4">
            <div>
              <h4 class="text-sm font-bold text-zinc-950 flex items-center">
                <span class="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-2"></span>
                {{ t('visitor_logs_title') }}
              </h4>
              <p class="text-[11px] text-zinc-400">{{ t('visitor_logs_desc') }}</p>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              <div v-for="visitor in visitorLogs" :key="visitor.id" class="bg-zinc-50 border border-zinc-150 rounded-2xl p-3 flex flex-col items-center space-y-2 text-center relative group overflow-hidden">
                <!-- Face photo -->
                <div class="w-14 h-14 rounded-full overflow-hidden border-2 border-zinc-200 bg-zinc-200 shadow-sm flex items-center justify-center relative">
                  <img 
                    v-if="visitor.photo && visitor.photo.startsWith('data:image')" 
                    :src="visitor.photo" 
                    class="w-full h-full object-cover animate-fade-in"
                  />
                  <!-- Mock generic user icon if not base64 -->
                  <span v-else class="text-xl">👤</span>
                </div>

                <!-- Detection info -->
                <div class="space-y-0.5 w-full">
                  <div class="text-[9px] font-bold text-zinc-900 truncate" :title="visitor.cameraName">
                    {{ visitor.cameraName }}
                  </div>
                  <div class="text-[8px] text-zinc-400 font-mono">
                    {{ formatDetectionTime(visitor.detectedAt) }}
                  </div>
                </div>

                <!-- Hover Zoom Overlay -->
                <div class="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center pointer-events-none p-1">
                  <span class="text-[8px] text-white font-mono break-all">{{ formatDetectionDate(visitor.detectedAt) }}</span>
                </div>
              </div>
              <div v-if="visitorLogs.length === 0" class="col-span-full py-8 text-center text-zinc-400 italic text-xs">
                Bugun hali kassa oldida yangi mijoz yuzlari aniqlanmadi.
              </div>
            </div>
          </div>

          <!-- SSENARIYLAR KUTUBXONASI VA INTEGRATSIYA BO'LIMI -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <!-- 1. Custom Scripts Database Library -->
            <div class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6 text-left space-y-4 flex flex-col justify-between">
              <div>
                <h4 class="text-sm font-bold text-zinc-950 flex items-center">
                  <span class="w-2.5 h-2.5 bg-indigo-500 rounded-full mr-2"></span>
                  {{ t('script_library_title') }}
                </h4>
                <p class="text-[11px] text-zinc-400">{{ t('script_library_desc') }}</p>
              </div>

              <!-- Script list table -->
              <div class="overflow-y-auto max-h-48 border border-zinc-100 rounded-xl p-1 bg-zinc-50/50">
                <table class="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr class="border-b border-zinc-150 text-zinc-400 font-bold uppercase tracking-wider text-[7px] pb-1">
                      <th class="pb-1">{{ t('name') || 'Nomi' }}</th>
                      <th class="pb-1">{{ t('description') }}</th>
                      <th class="pb-1 text-right">{{ t('action') || 'Amal' }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="script in cameraScripts" :key="script.id" class="border-b border-zinc-100/50 text-zinc-700 font-semibold last:border-0">
                      <td class="py-1.5 font-bold text-zinc-900">{{ script.title }}</td>
                      <td class="py-1.5 text-zinc-450 truncate max-w-[150px]">{{ script.description || '-' }}</td>
                      <td class="py-1.5 text-right space-x-1.5">
                        <button type="button" @click="alert(`[${script.title}] Kod:\n\n${script.code}`)" class="text-indigo-600 hover:text-indigo-850 font-bold">{{ t('script_code') }}</button>
                        <button type="button" @click="deleteCameraScript(script.id)" class="text-rose-500 hover:text-rose-700 font-bold">{{ t('delete') || 'O\'chirish' }}</button>
                      </td>
                    </tr>
                    <tr v-if="cameraScripts.length === 0">
                      <td colspan="3" class="py-4 text-center text-zinc-400 italic text-[10px]">Hali ssenariylar kiritilmagan.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Form to add script to database -->
              <form @submit.prevent="submitAddCameraScript" class="space-y-3 pt-3 border-t border-zinc-100">
                <div class="grid grid-cols-2 gap-3">
                  <div class="space-y-1">
                    <label class="block text-[8px] font-bold text-zinc-400 uppercase tracking-wider">{{ t('script_name') }}</label>
                    <input 
                      v-model="newScriptForm.title" 
                      type="text" 
                      required 
                      placeholder="Masalan: Kirish nazorati"
                      class="w-full border border-zinc-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:border-black font-semibold text-xs text-zinc-950"
                    />
                  </div>
                  <div class="space-y-1">
                    <label class="block text-[8px] font-bold text-zinc-400 uppercase tracking-wider">{{ t('description') }}</label>
                    <input 
                      v-model="newScriptForm.description" 
                      type="text" 
                      placeholder="Qisqacha maqsadi"
                      class="w-full border border-zinc-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:border-black font-semibold text-xs text-zinc-950"
                    />
                  </div>
                </div>

                <div class="space-y-1">
                  <label class="block text-[8px] font-bold text-zinc-400 uppercase tracking-wider">{{ t('script_code') }}</label>
                  <textarea 
                    v-model="newScriptForm.code" 
                    rows="3"
                    required
                    placeholder="Masalan:
if detect_face() == 'cleaner':
    kpi_score += 5
else:
    send_security_alert()"
                    class="w-full border border-zinc-200 rounded-xl px-3 py-2 bg-zinc-50 font-mono text-[9px] text-zinc-950 focus:outline-none focus:border-black placeholder:text-zinc-400"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  class="w-full bg-zinc-950 hover:bg-zinc-800 text-white text-[9px] font-bold py-2 rounded-xl transition active:scale-95 flex justify-center items-center space-x-1"
                >
                  {{ t('add_to_library') }}
                </button>
              </form>
            </div>

            <!-- 2. Camera-to-Script Integration Panel -->
            <div class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6 text-left space-y-4 flex flex-col justify-between">
              <div>
                <h4 class="text-sm font-bold text-zinc-950 flex items-center">
                  <span class="w-2.5 h-2.5 bg-violet-500 rounded-full mr-2"></span>
                  {{ t('camera_integration_title') }}
                </h4>
                <p class="text-[11px] text-zinc-400">{{ t('camera_integration_desc') }}</p>
              </div>

              <!-- Current mappings listing -->
              <div class="overflow-y-auto max-h-48 border border-zinc-100 rounded-xl p-1 bg-zinc-50/50 flex-1">
                <table class="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr class="border-b border-zinc-150 text-zinc-400 font-bold uppercase tracking-wider text-[7px] pb-1">
                      <th class="pb-1">{{ t('camera_name_label') }}</th>
                      <th class="pb-1">{{ t('select_script') }}</th>
                      <th class="pb-1 text-right">{{ t('camera_integration_title') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="cam in dbCameras" :key="cam.id" class="border-b border-zinc-100/50 text-zinc-700 font-semibold last:border-0">
                      <td class="py-1.5 font-bold text-zinc-900">{{ cam.name }}</td>
                      <td class="py-1.5 text-zinc-500">
                        <span v-if="cam.script" class="bg-violet-50 border border-violet-100 text-violet-700 px-1.5 py-0.5 rounded text-[8px] font-bold">
                          {{ cam.script.title }}
                        </span>
                        <span v-else class="text-zinc-400 italic text-[9px]">Ulanmagan (Standart)</span>
                      </td>
                      <td class="py-1.5 text-right">
                        <span v-if="cam.script" class="text-emerald-600 font-bold text-[9px]">⚡ FAOL INTEGRATSIYA</span>
                        <span v-else class="text-zinc-400 text-[9px]">-</span>
                      </td>
                    </tr>
                    <tr v-if="dbCameras.length === 0">
                      <td colspan="3" class="py-4 text-center text-zinc-400 italic text-[10px]">Kameralar topilmadi.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Integration Form tool -->
              <form @submit.prevent="submitScriptIntegration" class="space-y-3 pt-3 border-t border-zinc-100">
                <div class="space-y-2">
                  <div class="space-y-1">
                    <label class="block text-[8px] font-bold text-zinc-400 uppercase tracking-wider">{{ t('select_camera') }}</label>
                    <select 
                      v-model="selectedMappingCamera" 
                      required
                      class="w-full border border-zinc-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:border-black font-semibold text-xs text-zinc-950"
                    >
                      <option value="" disabled>{{ t('select_camera') }}...</option>
                      <option v-for="cam in dbCameras" :key="cam.id" :value="cam.id">
                        {{ cam.name }} (Address: {{ cam.connectionAddress }})
                      </option>
                    </select>
                  </div>

                  <div class="space-y-1">
                    <label class="block text-[8px] font-bold text-zinc-400 uppercase tracking-wider">{{ t('select_script') }}</label>
                    <select 
                      v-model="selectedMappingScript" 
                      class="w-full border border-zinc-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:border-black font-semibold text-xs text-zinc-950"
                    >
                      <option value="">Ssenariyni bekor qilish (Standart rejim)</option>
                      <option v-for="script in cameraScripts" :key="script.id" :value="script.id">
                        {{ script.title }} ({{ script.description || 'Tavsifsiz' }})
                      </option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  class="w-full bg-violet-600 hover:bg-violet-750 text-white text-[9px] font-bold py-2 rounded-xl transition active:scale-95 flex justify-center items-center space-x-1"
                >
                  ⚡ {{ t('integrate_btn') }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

        <!-- TAB: CUSTOMERS & PAYMENT HISTORY LIST (MIJOZLAR RO'YXATI VA TO'LOV TARIXI) -->
        <div v-else-if="activeTab === 'customers'" class="space-y-6">
          <div v-if="!hasAccess('customers')" class="bg-white border border-zinc-200 rounded-3xl p-12 text-center max-w-xl mx-auto mt-12">
            <span class="text-4xl">⚠️</span>
            <h3 class="text-lg font-bold text-zinc-950 mt-4 mb-2">Ruxsat Cheklangan</h3>
            <p class="text-sm text-zinc-500">Mijozlar ro'yxati va to'lov tarixi bo'limi faqat Menejer yoki Super Admin uchun ochiq.</p>
          </div>

          <div v-else class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6 space-y-4">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-lg font-bold text-zinc-950">Mizojlar To'lov Tarixi va Hizmat Ma'lumotlari</h3>
                <p class="text-xs text-zinc-400">Har bir kelgan mijozning kirish/chiqish vaqti, foydalangan xonasi, RFID UID kodi va to'lagan summalari logs</p>
              </div>
              <span class="text-xs font-semibold bg-[#c5a059] text-white px-3 py-1.5 rounded-xl">
                Jami xizmat ko'rsatildi: {{ customerLogs.length }} mijoz
              </span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-sm text-left">
                <thead>
                  <tr class="text-xs text-zinc-400 border-b border-zinc-100 uppercase tracking-wider">
                    <th class="py-3 font-semibold text-left">Mijoz Ismi / Tel</th>
                    <th class="py-3 font-semibold text-left">RFID UID</th>
                    <th class="py-3 font-semibold text-left">Xona / Turi</th>
                    <th class="py-3 font-semibold text-left">Kirgan vaqti</th>
                    <th class="py-3 font-semibold text-left">Chiqqan vaqti</th>
                    <th class="py-3 font-semibold text-left">Muddati</th>
                    <th class="py-3 font-semibold text-right">To'lov (Naqd/Karta)</th>
                    <th class="py-3 font-semibold text-right">Jami summasi</th>
                    <th class="py-3 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="log in customerLogs" :key="log.id" class="border-b border-zinc-50 font-medium hover:bg-zinc-50/50 text-xs">
                    <td class="py-3.5 text-left">
                      <div class="font-bold text-zinc-950">{{ log.customerName }}</div>
                      <div class="text-[10px] text-zinc-400 font-semibold">{{ log.phoneNumber }}</div>
                    </td>
                    <td class="py-3.5 text-left font-semibold text-zinc-650">{{ log.nfcUid.split('-').pop() }}</td>
                    <td class="py-3.5 text-left">
                      <div class="font-semibold text-zinc-900">{{ log.roomName }}</div>
                      <div class="text-[9px] text-[#c5a059] font-bold uppercase tracking-wider">{{ log.roomType }}</div>
                    </td>
                    <td class="py-3.5 text-left text-zinc-500 font-semibold">{{ formatDateTime(log.startTime) }}</td>
                    <td class="py-3.5 text-left text-zinc-500 font-semibold">{{ formatDateTime(log.endTime) }}</td>
                    <td class="py-3.5 text-left text-zinc-600 font-bold">{{ log.duration }}</td>
                    <td class="py-3.5 text-right font-semibold text-zinc-600">
                      <div>{{ log.cashAmount.toLocaleString() }} UZS <span class="text-[9px] text-zinc-400 font-semibold">(naqd)</span></div>
                      <div class="text-[10px]">{{ log.cardAmount.toLocaleString() }} UZS <span class="text-[9px] text-zinc-400 font-semibold">(karta)</span></div>
                    </td>
                    <td class="py-3.5 text-right font-black text-zinc-950 text-sm">{{ log.totalAmount.toLocaleString() }} UZS</td>
                    <td class="py-3.5 text-center">
                      <span class="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase border border-emerald-100/50">TO'LANDI</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- TAB: AUDIT LOGS (TIZIM AMALLARI JURNALI) -->
        <div v-else-if="activeTab === 'audit_logs'" class="space-y-6">
          <div v-if="!hasAccess('audit_logs')" class="bg-white border border-zinc-200 rounded-3xl p-12 text-center max-w-xl mx-auto mt-12">
            <span class="text-4xl">⚠️</span>
            <h3 class="text-lg font-bold text-zinc-950 mt-4 mb-2">Ruxsat Cheklangan</h3>
            <p class="text-sm text-zinc-500">Tizim amallari jurnali faqat Super Admin yoki Menejer uchun ochiq.</p>
          </div>
          <div v-else class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6 space-y-6">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-lg font-bold text-zinc-950">📜 Tizim Amallari Jurnali (Oxirgi amallar)</h3>
                <p class="text-xs text-zinc-400">Tizimda amalga oshirilgan barcha harakatlar xronologik tartibda saqlanadi. Ushbu ma'lumotlarni tahrirlash yoki o'chirish imkoni yo'q.</p>
              </div>
              <button 
                @click="fetchAuditLogs" 
                class="bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-bold px-4 py-2 rounded-xl transition active:scale-95 flex items-center space-x-1.5"
              >
                <span>🔄</span>
                <span>Yangilash</span>
              </button>
            </div>

            <!-- Timeline style Audit Logs List -->
            <div class="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              <div v-if="auditLogs.length === 0" class="text-center py-12 text-zinc-400 text-xs italic bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200">
                Hozircha hech qanday amal qayd etilmagan.
              </div>
              
              <div 
                v-for="log in auditLogs" 
                :key="log.id"
                class="flex items-start space-x-4 p-4 rounded-2xl border border-zinc-100 hover:border-zinc-200/60 bg-zinc-50/20 transition-all text-xs"
              >
                <!-- Icon badge based on action type -->
                <div :class="[
                  'w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm',
                  log.action === 'checkin' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : '',
                  log.action === 'checkout' ? 'bg-zinc-950 text-white border border-zinc-800' : '',
                  log.action === 'bar_order' ? 'bg-amber-50 text-amber-600 border border-amber-100' : '',
                  log.action === 'cleaning_complete' ? 'bg-blue-50 text-blue-600 border border-blue-100' : '',
                  log.action === 'add_room' ? 'bg-purple-50 text-purple-600 border border-purple-100' : '',
                  log.action === 'barcode_bind' ? 'bg-rose-50 text-rose-600 border border-rose-100' : '',
                  log.action === 'product_create' ? 'bg-teal-50 text-teal-600 border border-teal-100' : '',
                  log.action === 'reservation_create' ? 'bg-amber-100/60 text-amber-800 border border-amber-200' : '',
                  log.action === 'reservation_cancel' ? 'bg-red-50 text-red-600 border border-red-100' : ''
                ]">
                  <span v-if="log.action === 'checkin'">📥</span>
                  <span v-else-if="log.action === 'checkout'">💸</span>
                  <span v-else-if="log.action === 'bar_order'">🥤</span>
                  <span v-else-if="log.action === 'cleaning_complete'">🧹</span>
                  <span v-else-if="log.action === 'add_room'">🚪</span>
                  <span v-else-if="log.action === 'barcode_bind'">🏷️</span>
                  <span v-else-if="log.action === 'product_create'">📦</span>
                  <span v-else-if="log.action === 'reservation_create'">📅</span>
                  <span v-else-if="log.action === 'reservation_cancel'">❌</span>
                  <span v-else>📝</span>
                </div>

                <div class="flex-1 space-y-1 text-left">
                  <div class="flex justify-between items-start">
                    <span class="font-bold text-zinc-900 text-sm">{{ log.details }}</span>
                    <span class="text-[10px] text-zinc-400 font-bold ml-4 whitespace-nowrap bg-zinc-100/70 px-2 py-0.5 rounded">{{ formatDateTime(log.createdAt) }}</span>
                  </div>
                  <div class="flex items-center space-x-1.5 text-[10px] text-zinc-400 font-semibold">
                    <span class="bg-[#c5a059]/10 text-[#c5a059] px-2 py-0.5 rounded font-black tracking-wider uppercase text-[8px]">{{ log.action }}</span>
                    <span>•</span>
                    <span>Amalni bajardi:</span>
                    <span class="text-zinc-650 font-bold bg-zinc-100 px-1.5 py-0.5 rounded">{{ log.userName || 'Sistema' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 3: FINANCIAL ACCOUNTING (UPGRADED TO PULLIK HISOB-KITOBLAR MARKAZI) -->
        <div v-else-if="activeTab === 'finance'" class="space-y-6">
          <div v-if="!hasAccess('finance')" class="bg-white border border-zinc-200 rounded-3xl p-12 text-center max-w-xl mx-auto mt-12">
            <span class="text-4xl">⚠️</span>
            <h3 class="text-lg font-bold text-zinc-950 mt-4 mb-2">Ruxsat Cheklangan</h3>
            <p class="text-sm text-zinc-500">Moliya va pullik hisob-kitoblar bo'limi faqat Super Admin yoki Menejer uchun ochiq.</p>
          </div>

          <div v-else class="space-y-8">
            <!-- Navigation Switcher for Finance Sub Tabs -->
            <div class="flex items-center space-x-2 bg-zinc-100 p-1 rounded-2xl w-fit">
              <button 
                @click="activeFinanceSubTab = 'analytics'"
                :class="[
                  'px-5 py-2 rounded-xl text-xs font-bold transition-all',
                  activeFinanceSubTab === 'analytics' 
                    ? 'bg-white text-zinc-950 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-950'
                ]"
              >
                📊 Tahliliy Diagrammalar
              </button>
              <button 
                @click="activeFinanceSubTab = 'ledger'"
                :class="[
                  'px-5 py-2 rounded-xl text-xs font-bold transition-all',
                  activeFinanceSubTab === 'ledger' 
                    ? 'bg-white text-zinc-950 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-950'
                ]"
              >
                💵 To'lov Kvitansiyalari & Maoshlar
              </button>
            </div>

            <!-- SUB-TAB A: ANALYTICS (TAHLILIY DIAGRAMMALAR) -->
            <div v-if="activeFinanceSubTab === 'analytics'" class="space-y-6">
              
              <!-- 1. Row: Key Performance Indicators (KPIs) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Total Inflow card -->
                <div class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6 relative overflow-hidden">
                  <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Jami Kelgan Pullar (Inflow)</span>
                  <h3 class="text-2xl font-black text-zinc-950 mt-2">{{ financeMetrics.totalRevenue.toLocaleString() }} UZS</h3>
                  <div class="flex justify-between items-center text-[10px] font-bold text-zinc-500 mt-2 border-t border-zinc-50 pt-2">
                    <span>💵 Naqd: {{ Math.round(financeMetrics.totalRevenue * 0.6).toLocaleString() }} UZS</span>
                    <span>💳 Karta: {{ Math.round(financeMetrics.totalRevenue * 0.4).toLocaleString() }} UZS</span>
                  </div>
                </div>

                <!-- Total Outflow card -->
                <div class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6 relative overflow-hidden">
                  <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Jami To'langan Chiqimlar (Outflow)</span>
                  <h3 class="text-2xl font-black text-zinc-950 mt-2">{{ financeMetrics.totalExpenses.toLocaleString() }} UZS</h3>
                  <div class="flex justify-between items-center text-[10px] font-bold text-zinc-500 mt-2 border-t border-zinc-50 pt-2">
                    <span>🛠️ Ekspluatatsiya: 200,000 UZS</span>
                    <span>👥 Maoshlar: {{ totalWagesPayout.toLocaleString() }} UZS</span>
                  </div>
                </div>

                <!-- Balance card -->
                <div class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6 border-l-4 border-l-[#c5a059] relative overflow-hidden">
                  <span class="text-[10px] font-bold text-[#c5a059] uppercase tracking-wider block">Sof Kassa Qoldig'i (Balance)</span>
                  <h3 class="text-2xl font-black text-[#c5a059] mt-2">{{ (financeMetrics.totalRevenue - financeMetrics.totalExpenses).toLocaleString() }} UZS</h3>
                  <div class="flex justify-between items-center text-[10px] font-bold text-zinc-500 mt-2 border-t border-zinc-50 pt-2">
                    <span>Rentabellik:</span>
                    <span class="text-emerald-600 font-extrabold">{{ Math.round(((financeMetrics.totalRevenue - financeMetrics.totalExpenses) / (financeMetrics.totalRevenue || 1)) * 100) }}%</span>
                  </div>
                </div>

                <!-- Average customer payment -->
                <div class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6 relative overflow-hidden">
                  <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Mijozlardan O'rtacha To'lov</span>
                  <h3 class="text-2xl font-black text-zinc-950 mt-2">{{ averageCustomerPaid.toLocaleString() }} UZS</h3>
                  <span class="text-[9px] text-zinc-400 block mt-2">Har bir tashrif buyuruvchi hisobiga</span>
                </div>
              </div>

              <!-- 2. Row: Department breakdown & Products breakdown -->
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <!-- Card 1: Department Breakdown (Sauna, Hammom, Bar) -->
                <div class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6 space-y-6 lg:col-span-2">
                  <div>
                    <h4 class="text-sm font-bold text-zinc-950 uppercase tracking-wider">🏢 Bo'limlar Bo'yicha Tushumlar</h4>
                    <p class="text-xs text-zinc-400">Kompleksdagi har bir bo'limning tushum miqdori va umumiy tushumdagi ulushi</p>
                  </div>
                  
                  <div class="space-y-4">
                    <!-- Sauna breakdown progress -->
                    <div class="space-y-2">
                      <div class="flex justify-between text-xs font-bold text-zinc-700">
                        <span class="flex items-center space-x-1.5">
                          <span>🔥</span>
                          <span>Sauna Bo'limi</span>
                        </span>
                        <span>{{ (financeMetrics.saunaRevenue || 0).toLocaleString() }} UZS ({{ Math.round(((financeMetrics.saunaRevenue || 0) / (financeMetrics.totalRevenue || 1)) * 100) }}%)</span>
                      </div>
                      <div class="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          class="bg-amber-500 h-full rounded-full transition-all duration-500" 
                          :style="{ width: `${Math.round(((financeMetrics.saunaRevenue || 0) / (financeMetrics.totalRevenue || 1)) * 100)}%` }"
                        ></div>
                      </div>
                    </div>

                    <!-- Hammom breakdown progress -->
                    <div class="space-y-2">
                      <div class="flex justify-between text-xs font-bold text-zinc-700">
                        <span class="flex items-center space-x-1.5">
                          <span>🛁</span>
                          <span>Hammom Bo'limi</span>
                        </span>
                        <span>{{ (financeMetrics.hammomRevenue || 0).toLocaleString() }} UZS ({{ Math.round(((financeMetrics.hammomRevenue || 0) / (financeMetrics.totalRevenue || 1)) * 100) }}%)</span>
                      </div>
                      <div class="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          class="bg-blue-500 h-full rounded-full transition-all duration-500" 
                          :style="{ width: `${Math.round(((financeMetrics.hammomRevenue || 0) / (financeMetrics.totalRevenue || 1)) * 100)}%` }"
                        ></div>
                      </div>
                    </div>

                    <!-- Bar breakdown progress -->
                    <div class="space-y-2">
                      <div class="flex justify-between text-xs font-bold text-zinc-700">
                        <span class="flex items-center space-x-1.5">
                          <span>🥤</span>
                          <span>Bar & Zaxira Xizmatlari</span>
                        </span>
                        <span>{{ (financeMetrics.barRevenue || 0).toLocaleString() }} UZS ({{ Math.round(((financeMetrics.barRevenue || 0) / (financeMetrics.totalRevenue || 1)) * 100) }}%)</span>
                      </div>
                      <div class="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          class="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                          :style="{ width: `${Math.round(((financeMetrics.barRevenue || 0) / (financeMetrics.totalRevenue || 1)) * 100)}%` }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Card 2: Top Selling Bar Products -->
                <div class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6 space-y-6">
                  <div>
                    <h4 class="text-sm font-bold text-zinc-950 uppercase tracking-wider">🏆 Eng Ko'p Sotilgan Mahsulotlar</h4>
                    <p class="text-xs text-zinc-400">Bar va ijara do'konidagi eng ommabop 5 ta mahsulot</p>
                  </div>

                  <div class="space-y-4">
                    <div v-if="!financeMetrics.topSellingProducts || financeMetrics.topSellingProducts.length === 0" class="text-center py-8 text-zinc-400 text-xs italic bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                      Savdolar aniqlanmadi.
                    </div>
                    <div 
                      v-else
                      v-for="(prod, idx) in financeMetrics.topSellingProducts" 
                      :key="prod.name"
                      class="flex items-center justify-between border-b border-zinc-50 pb-2.5 text-xs"
                    >
                      <div class="flex items-center space-x-2 text-left">
                        <span class="w-5 h-5 rounded-lg bg-zinc-100 text-zinc-650 flex items-center justify-center font-bold text-[10px]">#{{ idx + 1 }}</span>
                        <span class="font-bold text-zinc-800">{{ prod.name }}</span>
                      </div>
                      <span class="font-extrabold text-zinc-950 bg-zinc-50 px-2 py-0.5 rounded">{{ prod.quantity }} ta sotildi</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 3. Workers breakdown table -->
              <div class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6 space-y-4">
                <div>
                  <h4 class="text-sm font-bold text-zinc-950 uppercase tracking-wider">👥 Ishchilarga Qilingan Hisob-kitoblar (Wages & KPI Breakdown)</h4>
                  <p class="text-xs text-zinc-400">Har bir ishchining kunlik maoshi, KPI mukofoti, jarimalari va jami to'lovi</p>
                </div>

                <div class="overflow-x-auto">
                  <table class="w-full text-xs text-left">
                    <thead>
                      <tr class="text-zinc-400 border-b border-zinc-100 font-bold uppercase">
                        <th class="py-2.5">Xodim ismi</th>
                        <th class="py-2.5">Lavozimi</th>
                        <th class="py-2.5 text-right">Oylik maoshi</th>
                        <th class="py-2.5 text-right">KPI Reytingi</th>
                        <th class="py-2.5 text-right">Mukofot (Bonus)</th>
                        <th class="py-2.5 text-right">Jarima (Penalty)</th>
                        <th class="py-2.5 text-right">Jami to'lov (Net Pay)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="emp in staffList" :key="emp.id" class="border-b border-zinc-50 hover:bg-zinc-50/50 font-medium text-zinc-800">
                        <td class="py-3 font-bold text-zinc-900 flex items-center space-x-2">
                          <span class="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-[10px] text-zinc-500">
                            {{ emp.name.split(' ').map(n=>n[0]).join('') }}
                          </span>
                          <span>{{ emp.name }}</span>
                        </td>
                        <td class="py-3">
                          <span class="px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider" :class="[
                            emp.role === 'manager' ? 'bg-zinc-950 text-white' : '',
                            emp.role === 'cashier' ? 'bg-amber-50 text-amber-700 border border-amber-100' : '',
                            emp.role === 'barman' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : '',
                            emp.role === 'cleaner' ? 'bg-blue-50 text-blue-700 border border-blue-100' : '',
                            emp.role === 'inspector' ? 'bg-purple-50 text-purple-700 border border-purple-100' : ''
                          ]">
                            {{ emp.role }}
                          </span>
                        </td>
                        <td class="py-3 text-right font-bold">{{ emp.salary.toLocaleString() }} UZS</td>
                        <td class="py-3 text-right font-semibold">
                          <span :class="emp.kpi >= 100 ? 'text-emerald-600' : 'text-red-500'">{{ emp.kpi }}</span>
                        </td>
                        <td class="py-3 text-right text-emerald-600 font-bold">+{{ (emp.bonus || 0).toLocaleString() }} UZS</td>
                        <td class="py-3 text-right text-red-500 font-bold">-{{ (emp.penalty || 0).toLocaleString() }} UZS</td>
                        <td class="py-3 text-right font-black text-zinc-950">{{ (emp.salary + (emp.bonus || 0) - (emp.penalty || 0)).toLocaleString() }} UZS</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            <!-- SUB-TAB B: LEDGER (KVITANSIYALAR VA MAOSHLAR) -->
            <div v-else class="space-y-8">
              <!-- 1. Top Row: Paid Metrics Cards -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6 relative overflow-hidden">
                <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Jami Kelgan Pullar (Inflow)</span>
                <h3 class="text-2xl font-black text-zinc-950 mt-2">{{ financeMetrics.totalRevenue.toLocaleString() }} UZS</h3>
                <div class="flex justify-between items-center text-[10px] font-bold text-zinc-500 mt-2 border-t border-zinc-50 pt-2">
                  <span>💵 Naqd: {{ (financeMetrics.totalRevenue * 0.6).toLocaleString() }} UZS</span>
                  <span>💳 Karta: {{ (financeMetrics.totalRevenue * 0.4).toLocaleString() }} UZS</span>
                </div>
              </div>

              <div class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6 relative overflow-hidden">
                <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Jami To'langan Chiqimlar (Outflow)</span>
                <h3 class="text-2xl font-black text-zinc-950 mt-2">{{ financeMetrics.totalExpenses.toLocaleString() }} UZS</h3>
                <div class="flex justify-between items-center text-[10px] font-bold text-zinc-500 mt-2 border-t border-zinc-50 pt-2">
                  <span>🛠️ Kommunal: 200,000 UZS</span>
                  <span>👥 Maosh: {{ totalWagesPayout.toLocaleString() }} UZS</span>
                </div>
              </div>

              <div class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6 border-l-4 border-l-[#c5a059] relative overflow-hidden">
                <span class="text-[10px] font-bold text-[#c5a059] uppercase tracking-wider block">Sof Kassa Qoldig'i (Balance)</span>
                <h3 class="text-2xl font-black text-[#c5a059] mt-2">{{ (financeMetrics.totalRevenue - financeMetrics.totalExpenses).toLocaleString() }} UZS</h3>
                <span class="text-[9px] text-zinc-400 block mt-2">Kassa yopilishi uchun tayyor qoldiq</span>
              </div>

              <div class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6 relative overflow-hidden">
                <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Mijozlardan O'rtacha To'lov</span>
                <h3 class="text-2xl font-black text-zinc-950 mt-2">{{ averageCustomerPaid.toLocaleString() }} UZS</h3>
                <span class="text-[9px] text-zinc-400 block mt-2">Har bir tashrif buyuruvchi hisobiga</span>
              </div>
            </div>

            <!-- 2. Interactive Row: Customer Bills & Staff Salary Payroll -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <!-- Column A: Customer Billing Breakdown (Mijozlar Pullik Hisob-Kitoblari) -->
              <div class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6 space-y-4">
                <div>
                  <h3 class="text-sm font-bold text-zinc-950 uppercase tracking-wider flex items-center">
                    <span>💵</span> Mijozlar To'lov Kvitansiyalari Tafsiloti
                  </h3>
                  <p class="text-[10px] text-zinc-400">Har bir mijoz uchun xona ijarasi va bar maxsulotlari alohida hisoblagichi</p>
                </div>

                <div class="overflow-x-auto">
                  <table class="w-full text-xs text-left">
                    <thead>
                      <tr class="text-zinc-400 border-b border-zinc-100 font-bold uppercase">
                        <th class="py-2.5">RFID Turi</th>
                        <th class="py-2.5">Xona Xarajati</th>
                        <th class="py-2.5">Bar / Sovun</th>
                        <th class="py-2.5">To'lov Turi</th>
                        <th class="py-2.5 text-right">Jami To'lov</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="log in customerLogs" :key="log.id" class="border-b border-zinc-50 hover:bg-zinc-50/50 font-medium text-zinc-800">
                        <td class="py-3 font-bold text-zinc-900">{{ log.nfcUid.split('-').pop() }}</td>
                        <td class="py-3">{{ ((log.cashAmount + log.cardAmount) * 0.75).toLocaleString() }} UZS</td>
                        <td class="py-3">{{ ((log.cashAmount + log.cardAmount) * 0.25).toLocaleString() }} UZS</td>
                        <td class="py-3">
                          <span class="px-2 py-0.5 rounded-lg text-[9px] font-bold" :class="log.cashAmount > 0 ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'">
                            {{ log.cashAmount > 0 ? '💵 Naqd' : '💳 Karta' }}
                          </span>
                        </td>
                        <td class="py-3 text-right font-black text-zinc-950">{{ (log.cashAmount + log.cardAmount).toLocaleString() }} UZS</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Column B: Staff Salaries Payroll Payout (Ish Haqlarini To'lash Tizimi) -->
              <div class="bg-white border border-[#c5a059]/30 shadow-sm rounded-3xl p-6 space-y-4">
                <div class="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h3 class="text-sm font-bold text-zinc-950 uppercase tracking-wider flex items-center">
                      <span>👥</span> Xodimlar Oylik Maoshlari Vedomosti
                    </h3>
                    <p class="text-[10px] text-zinc-400">Oylik o'lchovlar, jarimalar va mukofotlar hisobga olingan to'lov ro'yxati</p>
                  </div>
                  
                  <button 
                    @click="payoutAllSalaries"
                    :disabled="isSalariesPaid"
                    :class="[
                      'px-3 py-1.5 rounded-xl text-[10px] font-bold transition duration-150',
                      isSalariesPaid 
                        ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200' 
                        : 'bg-black text-white hover:bg-zinc-800 active:scale-95'
                    ]"
                  >
                    {{ isSalariesPaid ? '✓ Maoshlar To\'landi' : '💸 Bugungi Ish Haqini To\'lash' }}
                  </button>
                </div>

                <div class="overflow-x-auto">
                  <table class="w-full text-xs text-left">
                    <thead>
                      <tr class="text-zinc-400 border-b border-zinc-100 font-bold uppercase">
                        <th class="py-2.5">Xodim</th>
                        <th class="py-2.5">Asosiy</th>
                        <th class="py-2.5 text-emerald-600">Mukofot</th>
                        <th class="py-2.5 text-rose-500">Jarima</th>
                        <th class="py-2.5 text-right">To'lanadi</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="emp in staffList" :key="emp.id" class="border-b border-zinc-50 hover:bg-zinc-50/50 font-medium text-zinc-800">
                        <td class="py-3 font-bold text-zinc-900">{{ emp.name }}</td>
                        <td class="py-3">{{ emp.salary.toLocaleString() }} UZS</td>
                        <td class="py-3 text-emerald-600">+{{ emp.bonus.toLocaleString() }} UZS</td>
                        <td class="py-3 text-rose-500">-{{ emp.penalty.toLocaleString() }} UZS</td>
                        <td class="py-3 text-right font-black text-zinc-950">
                          {{ (emp.salary + emp.bonus - emp.penalty).toLocaleString() }} UZS
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            <!-- 3. Row 3: Manual Expense Input Form & Partner Arrivals -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <!-- Partner Arrivals Purchases Log (Hamkorlardan Sotib Olingan Pullik Yuklar) -->
              <div class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6 space-y-4 lg:col-span-2">
                <div>
                  <h3 class="text-xs font-bold text-zinc-950 uppercase tracking-wider flex items-center">
                    <span>🤝</span> Hamkorlardan Xarid Qilingan Maxsulotlar Hisobi
                  </h3>
                  <p class="text-[10px] text-zinc-400">Hamkorlar yetkazib bergan maxsulotlar to'lov kvitansiyalari ro'yxati</p>
                </div>

                <div class="overflow-x-auto">
                  <table class="w-full text-xs text-left">
                    <thead>
                      <tr class="text-zinc-400 border-b border-zinc-100 font-bold uppercase">
                        <th class="py-2.5">Yetkazib Beruvchi</th>
                        <th class="py-2.5">Maxsulot Nomi</th>
                        <th class="py-2.5">Soni</th>
                        <th class="py-2.5">Dona Tannarxi</th>
                        <th class="py-2.5 text-right font-bold text-rose-500">Jami To'lov</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr class="border-b border-zinc-50 font-medium text-zinc-800">
                        <td class="py-3 font-bold text-zinc-900">Sifatli Ichimliklar MCHJ</td>
                        <td class="py-3">Coca Cola 0.5L</td>
                        <td class="py-3">150 dona</td>
                        <td class="py-3">6,000 UZS</td>
                        <td class="py-3 text-right font-bold text-rose-500">900,000 UZS</td>
                      </tr>
                      <tr class="border-b border-zinc-50 font-medium text-zinc-800">
                        <td class="py-3 font-bold text-zinc-900">Yuvish Vositalari Hamkori</td>
                        <td class="py-3">Maxsus Sovun (Soap)</td>
                        <td class="py-3">200 dona</td>
                        <td class="py-3">3,000 UZS</td>
                        <td class="py-3 text-right font-bold text-rose-500">600,000 UZS</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Manual Expense form -->
              <div class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6 space-y-4">
                <div>
                  <h3 class="text-xs font-bold text-zinc-950 uppercase tracking-wider flex items-center">
                    <span>💸</span> Kutilmagan Chiqimlarni Kiritish
                  </h3>
                  <p class="text-[10px] text-zinc-400">Kommunal, reklama yoki boshqa tezkor to'lovlarni tizimga qo'shish</p>
                </div>

                <form @submit.prevent="submitExpense" class="space-y-4">
                  <div>
                    <label class="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Chiqim turi</label>
                    <select 
                      v-model="expenseForm.category" 
                      required
                      class="w-full border border-zinc-200 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:border-black"
                    >
                      <option value="electricity">Elektr energiya xarajati</option>
                      <option value="water">Suv manbai va kanallash xarajati</option>
                      <option value="hygiene">Omborda yuvish vositalari, sovunlar</option>
                      <option value="salary">Xodimlar maoshi</option>
                      <option value="other">Boshqa xarajatlar</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Chiqim miqdori (UZS)</label>
                    <input 
                      v-model="expenseForm.amount" 
                      type="number" 
                      required
                      min="1"
                      placeholder="Masalan: 80000"
                      class="w-full border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label class="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Tavsif (Optional)</label>
                    <textarea 
                      v-model="expenseForm.description" 
                      rows="2"
                      placeholder="Qisqacha izoh..."
                      class="w-full border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black"
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    class="w-full bg-black text-white hover:bg-zinc-800 text-xs font-bold py-2.5 rounded-xl active:scale-95 transition"
                  >
                    Chiqimni tasdiqlash
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
        </div>



        <!-- TAB 5: OMBORXONA (NEW WAREHOUSE SECTION) -->
        <div v-else-if="activeTab === 'warehouse'" class="space-y-6">
          <div v-if="!hasAccess('warehouse')" class="bg-white border border-zinc-200 rounded-3xl p-12 text-center max-w-xl mx-auto mt-12">
            <span class="text-4xl">⚠️</span>
            <h3 class="text-lg font-bold text-zinc-950 mt-4 mb-2">Ruxsat Cheklangan</h3>
            <p class="text-sm text-zinc-500">Omborxona bo'limiga kirish uchun faqat Menejer yoki Super Admin ruxsati talab etiladi.</p>
          </div>

          <div v-else class="space-y-6">


            <!-- Products Table Card -->
            <div class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6">
              <div class="flex justify-between items-center mb-6">
                <div>
                  <h3 class="text-lg font-bold text-zinc-950">Omborxona Mahsulotlari va Zaxiralari</h3>
                  <p class="text-xs text-zinc-400">Mavjud bar mahsulotlari, yuvish vositalari va ijaraga beriladigan sochiqlar qoldig'i</p>
                </div>
                <span class="text-xs font-semibold bg-zinc-100 text-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-200">
                  Jami: {{ productsList.length }} turdagi mahsulot
                </span>
              </div>
              
              <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                  <thead>
                    <tr class="text-xs text-zinc-400 border-b border-zinc-100 uppercase tracking-wider">
                      <th class="py-3 font-semibold">Mahsulot Nomi</th>
                      <th class="py-3 font-semibold">Turi</th>
                      <th class="py-3 font-semibold">Sotish Narxi (UZS)</th>
                      <th class="py-3 font-semibold">Tannarxi (Cost UZS)</th>
                      <th class="py-3 font-semibold">Zaxira Qoldig'i</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="prod in productsList" :key="prod.id" class="border-b border-zinc-50 font-medium hover:bg-zinc-50/50">
                      <td class="py-3.5">{{ prod.name }}</td>
                      <td class="py-3.5 text-xs uppercase tracking-wider text-zinc-400">{{ prod.type === 'rent' ? 'Ijara' : 'Sotish' }}</td>
                      <td class="py-3.5 font-bold text-zinc-900">{{ prod.price.toLocaleString() }} UZS</td>
                      <td class="py-3.5 text-zinc-400">{{ prod.costPrice?.toLocaleString() || 'N/A' }} UZS</td>
                      <td class="py-3.5">
                        <span :class="[
                          'px-2.5 py-1 rounded-lg text-xs font-bold',
                          prod.stockQuantity > 20 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        ]">
                          {{ prod.stockQuantity }} ta
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Forms for supply and returns side-by-side -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Supply Form -->
              <div class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6 space-y-4">
                <h3 class="text-lg font-bold text-zinc-950">Hamkordan yuk qabul qilish</h3>
                <form @submit.prevent="submitSupply" class="space-y-4">
                  <div>
                    <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Hamkorni tanlang</label>
                    <select 
                      v-model="supplyForm.partnerId" 
                      required
                      class="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-black"
                    >
                      <option v-for="partner in partnersList" :key="partner.id" :value="partner.id">{{ partner.name }}</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Mahsulot nomi</label>
                    <input 
                      v-model="supplyForm.productName" 
                      type="text" 
                      required
                      placeholder="Coca Cola / Toza sochiqlar..."
                      class="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black"
                    />
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Sotish narxi (UZS)</label>
                      <input 
                        v-model="supplyForm.price" 
                        type="number" 
                        required
                        min="1"
                        class="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Tannarxi (Cost UZS)</label>
                      <input 
                        v-model="supplyForm.costPrice" 
                        type="number" 
                        required
                        min="1"
                        class="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Miqdori (Dona/ta)</label>
                      <input 
                        v-model="supplyForm.quantity" 
                        type="number" 
                        required
                        min="1"
                        class="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Turi</label>
                      <select 
                        v-model="supplyForm.type" 
                        class="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none"
                      >
                        <option value="sale">Sotish uchun</option>
                        <option value="rent">Ijara uchun</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    class="w-full bg-black text-white hover:bg-zinc-800 text-xs font-bold py-3 rounded-xl active:scale-95 transition"
                  >
                    Yuk qabul qilinishini rasmiylashtirish
                  </button>
                </form>
              </div>

              <!-- Return Form -->
              <div class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6 space-y-4">
                <h3 class="text-lg font-bold text-zinc-950">Muddati o'tgan yoki nuqsonli yuklarni qaytarish</h3>
                <form @submit.prevent="submitProductReturn" class="space-y-4">
                  <div>
                    <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Mahsulotni tanlang</label>
                    <select 
                      v-model="returnForm.productId" 
                      required
                      class="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-black"
                    >
                      <option value="" disabled>Mahsulotni tanlang</option>
                      <option v-for="prod in productsList" :key="prod.id" :value="prod.id">
                        {{ prod.name }} (Zaxira: {{ prod.stockQuantity }} ta)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Qaytarish miqdori</label>
                    <input 
                      v-model="returnForm.quantity" 
                      type="number" 
                      required
                      min="1"
                      class="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Qaytarish sababi</label>
                    <input 
                      v-model="returnForm.reason" 
                      type="text" 
                      required
                      placeholder="Muddati o'tgan / yaroqsiz..."
                      class="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                    />
                  </div>

                  <button 
                    type="submit" 
                    class="w-full bg-black text-white hover:bg-zinc-800 text-xs font-bold py-3 rounded-xl active:scale-95 transition"
                  >
                    Yukni qaytarishni rasmiylashtirish
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 5.5: OMBORXONA SKANER KIRITISH -->
        <div v-else-if="activeTab === 'warehouse_scan'" class="space-y-6">
          <div v-if="!hasAccess('warehouse')" class="bg-white border border-zinc-200 rounded-3xl p-12 text-center max-w-xl mx-auto mt-12">
            <span class="text-4xl">⚠️</span>
            <h3 class="text-lg font-bold text-zinc-950 mt-4 mb-2">Ruxsat Cheklangan</h3>
            <p class="text-sm text-zinc-500">Shtrix-kod kiritish bo'limiga kirish uchun faqat Menejer yoki Super Admin ruxsati talab etiladi.</p>
          </div>

          <div v-else class="space-y-6">
            <!-- Barcode Scanner Simulator Card -->
            <div class="bg-amber-50/40 border border-amber-200/60 shadow-sm rounded-3xl p-6 space-y-4">
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="text-sm font-bold text-zinc-950 uppercase tracking-wider flex items-center">
                    <span>🏷️</span> Shtrix-kod Skaneri Simulyatori
                  </h3>
                  <p class="text-[10px] text-zinc-400">Jismoniy skanersiz ishlashini sinab ko'rish uchun mahsulotni tanlang va "Skanerlash" tugmasini bosing</p>
                </div>
                <span class="text-[10px] font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-200">
                  ⌨️ Global Skaner Listener Faol (Type fast or scan)
                </span>
              </div>

              <div class="flex flex-wrap gap-3">
                <button 
                  v-for="p in productsList" 
                  :key="p.id"
                  @click="processBarcodeScan(p.barcode)"
                  class="bg-white hover:bg-zinc-50 border border-zinc-200 text-xs font-semibold px-4 py-2.5 rounded-xl active:scale-95 transition flex items-center space-x-2"
                >
                  <span>🔍 {{ p.name }}</span>
                  <span class="text-[9px] text-zinc-400">({{ p.barcode }})</span>
                </button>
              </div>
            </div>

            <!-- Barcode Registration Form Card -->
            <div class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6 space-y-4">
              <div>
                <h3 class="text-sm font-bold text-zinc-950 uppercase tracking-wider flex items-center">
                  <span>🆕</span> Yangi Mahsulot va Shtrix-kodlarni Ro'yxatdan O'tkazish
                </h3>
                <p class="text-[10px] text-zinc-400">Tizimga yangi ichimliklar (Fanta, Pepsi) yoki sochiq/sovun kabi narsalarni shtrix-kodi bilan to'g'ridan-to'g'ri kiritish va saqlash</p>
              </div>

              <!-- Selector for Mode -->
              <div class="flex space-x-2 border-b border-zinc-100 pb-3">
                <button 
                  type="button"
                  @click="barcodeMode = 'bind'"
                  :class="[
                    'px-3 py-1.5 rounded-lg text-[10px] font-bold transition',
                    barcodeMode === 'bind' 
                      ? 'bg-zinc-950 text-white' 
                      : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                  ]"
                >
                  🔗 Shtrix-kodni biriktirish
                </button>
                <button 
                  type="button"
                  @click="barcodeMode = 'new'"
                  :class="[
                    'px-3 py-1.5 rounded-lg text-[10px] font-bold transition',
                    barcodeMode === 'new' 
                      ? 'bg-zinc-950 text-white' 
                      : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                  ]"
                >
                  ➕ Yangi mahsulot qo'shish
                </button>
              </div>

              <!-- Mode 1: Bind to Existing Product -->
              <form v-if="barcodeMode === 'bind'" @submit.prevent="submitBindBarcode" class="space-y-3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Mahsulotni tanlang</label>
                    <select 
                      v-model="bindForm.productId" 
                      required
                      class="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-xs bg-white focus:outline-none"
                    >
                      <option value="" disabled>Mahsulotlar ro'yxati</option>
                      <option v-for="p in productsList" :key="p.id" :value="p.id">
                        {{ p.name }} (Qoldiq: {{ p.stockQuantity }} ta)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Shtrix-kod (Skanerlang yoki yozing)</label>
                    <div class="flex space-x-2">
                      <input 
                        v-model="bindForm.barcode" 
                        type="text" 
                        required
                        placeholder="Masalan: 4860005910020"
                        class="w-full border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black"
                      />
                      <button 
                        type="button"
                        @click="startBarcodeCapture('bind')"
                        class="bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-[10px] font-bold px-3 rounded-xl transition"
                      >
                        ⚡ Skanerlash
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  class="w-full bg-black hover:bg-zinc-800 text-white text-xs font-bold py-2.5 rounded-xl active:scale-95 transition"
                >
                  Shtrix-kodni Biriktirish
                </button>
              </form>

              <!-- Mode 2: Create New Product with Barcode -->
              <form v-else-if="barcodeMode === 'new'" @submit.prevent="submitCreateBarcodeProduct" class="space-y-3">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Mahsulot Nomi</label>
                    <input 
                      v-model="newBarcodeProdForm.name" 
                      type="text" 
                      required
                      placeholder="Masalan: Fanta 0.5L"
                      class="w-full border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Sotish Narxi (UZS)</label>
                    <input 
                      v-model="newBarcodeProdForm.price" 
                      type="number" 
                      required
                      placeholder="15000"
                      class="w-full border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Tannarxi (Cost UZS)</label>
                    <input 
                      v-model="newBarcodeProdForm.costPrice" 
                      type="number" 
                      placeholder="10000"
                      class="w-full border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Zaxira Soni</label>
                    <input 
                      v-model="newBarcodeProdForm.stockQuantity" 
                      type="number" 
                      required
                      placeholder="100"
                      class="w-full border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Turi</label>
                    <select 
                      v-model="newBarcodeProdForm.type" 
                      class="w-full border border-zinc-200 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none"
                    >
                      <option value="sale">Sotiladigan (Bar / ichimlik)</option>
                      <option value="rent">Ijaraga beriladigan (Sochiq / xalat)</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Shtrix-kod</label>
                    <div class="flex space-x-2">
                      <input 
                        v-model="newBarcodeProdForm.barcode" 
                        type="text" 
                        required
                        placeholder="Masalan: 4860005910037"
                        class="w-full border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black"
                      />
                      <button 
                        type="button"
                        @click="startBarcodeCapture('new')"
                        class="bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-[10px] font-bold px-3 rounded-xl transition"
                      >
                        ⚡ Skanerlash
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  class="w-full bg-black hover:bg-zinc-800 text-white text-xs font-bold py-2.5 rounded-xl active:scale-95 transition"
                >
                  Yangi Mahsulotni Ro'yxatdan O'tkazish
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- TAB 5: SYSTEM SETTINGS -->
        <div v-else-if="activeTab === 'settings'">
          <SettingsPanel />
        </div>

        <!-- TAB 6: PARTNERS (TAMINOTCHILAR SECTION) -->
        <div v-else-if="activeTab === 'partners'" class="space-y-6">
          <div v-if="!hasAccess('partners')" class="bg-white border border-zinc-200 rounded-3xl p-12 text-center max-w-xl mx-auto mt-12">
            <span class="text-4xl">⚠️</span>
            <h3 class="text-lg font-bold text-zinc-950 mt-4 mb-2">Ruxsat Cheklangan</h3>
            <p class="text-sm text-zinc-500">Taminotchilar bo'limiga kirish uchun faqat Menejer yoki Super Admin ruxsati talab etiladi.</p>
          </div>

          <div v-else class="space-y-6">
            <!-- Header Metrics Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6 flex items-center justify-between">
                <div>
                  <span class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Jami Hamkorlar</span>
                  <h3 class="text-3xl font-black text-zinc-950 mt-1">{{ partnersList.length }}</h3>
                </div>
                <div class="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-200/60 flex items-center justify-center text-xl">🤝</div>
              </div>
              <div class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6 flex items-center justify-between">
                <div>
                  <span class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Jami Yetkazilgan Mahsulotlar</span>
                  <h3 class="text-3xl font-black text-zinc-950 mt-1">{{ totalSuppliedProductsCount }}</h3>
                </div>
                <div class="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-200/60 flex items-center justify-center text-xl">📦</div>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Suppliers list Table (Left, 2 cols width) -->
              <div class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6 lg:col-span-2 space-y-6">
                <div class="flex justify-between items-center">
                  <div>
                    <h3 class="text-base font-bold text-zinc-950">Taminotchilar Ro'yxati</h3>
                    <p class="text-xs text-zinc-400">Hamkor kompaniyalar va ularning aloqa ma'lumotlari</p>
                  </div>
                  <button 
                    @click="openAddPartnerModal"
                    class="bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition"
                  >
                    + Yangi Hamkor
                  </button>
                </div>

                <div class="overflow-x-auto">
                  <table class="w-full text-sm text-left">
                    <thead>
                      <tr class="text-xs text-zinc-400 border-b border-zinc-100 uppercase tracking-wider">
                        <th class="py-3 font-semibold">Taminotchi Nomi</th>
                        <th class="py-3 font-semibold">Aloqa / Telefon</th>
                        <th class="py-3 font-semibold text-right">Keltirilgan Mahsulotlar</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="partnersList.length === 0">
                        <td colspan="3" class="py-6 text-center text-zinc-400 text-xs">Mavjud taminotchilar topilmadi.</td>
                      </tr>
                      <tr v-for="part in partnersList" :key="part.id" class="border-b border-zinc-50 font-medium hover:bg-zinc-50/50">
                        <td class="py-4">
                          <div class="font-bold text-zinc-950">{{ part.name }}</div>
                        </td>
                        <td class="py-4 text-zinc-500">{{ part.contact || 'Nomalum' }}</td>
                        <td class="py-4 text-right">
                          <span class="bg-zinc-100 text-zinc-800 text-xs px-2.5 py-1 rounded-lg font-semibold border border-zinc-200">
                            {{ part.products?.length || 0 }} ta turdagi
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Supply Entry Form (Right, 1 col width) -->
              <div class="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6 space-y-6">
                <div>
                  <h3 class="text-base font-bold text-zinc-950">Yangi Yuk Qabul Qilish</h3>
                  <p class="text-xs text-zinc-400">Keltirilgan yangi tovar yoki xizmatlarni qabul qilish va ombor zaxirasini yangilash</p>
                </div>

                <form @submit.prevent="submitPartnerSupply" class="space-y-4">
                  <div>
                    <label class="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Taminotchi</label>
                    <select 
                      v-model="partnerSupplyForm.partnerId" 
                      required
                      class="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-black"
                    >
                      <option value="" disabled>Taminotchini tanlang</option>
                      <option v-for="part in partnersList" :key="part.id" :value="part.id">
                        {{ part.name }}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Mahsulot Nomi</label>
                    <input 
                      v-model="partnerSupplyForm.productName" 
                      type="text" 
                      placeholder="Masalan: Coca Cola 0.5L"
                      required
                      class="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black bg-white"
                    />
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Sotish Narxi (UZS)</label>
                      <input 
                        v-model.number="partnerSupplyForm.price" 
                        type="number" 
                        placeholder="15000"
                        required
                        class="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black bg-white"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Tannarxi (Cost UZS)</label>
                      <input 
                        v-model.number="partnerSupplyForm.costPrice" 
                        type="number" 
                        placeholder="10000"
                        required
                        class="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black bg-white"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Soni (Quantity)</label>
                      <input 
                        v-model.number="partnerSupplyForm.quantity" 
                        type="number" 
                        placeholder="50"
                        required
                        class="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black bg-white"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Turi (Type)</label>
                      <select 
                        v-model="partnerSupplyForm.type" 
                        class="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-black"
                      >
                        <option value="sale">Sotish uchun (Bar)</option>
                        <option value="rent">Ijara uchun</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    class="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-3 rounded-xl text-xs transition"
                  >
                    Yukni Qabul Qilish va Omborga Qo'shish
                  </button>
                </form>
              </div>
            </div>

            <!-- MODAL: ADD NEW PARTNER -->
            <div v-if="addPartnerModalOpen" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200/80">
                <h3 class="text-xl font-bold text-zinc-950 mb-2">Yangi Hamkor Qo'shish</h3>
                <p class="text-sm text-zinc-500 mb-6">Yangi taminotchi yoki hamkor kompaniya ma'lumotlarini ro'yxatdan o'tkazish.</p>

                <form @submit.prevent="submitAddPartner" class="space-y-4">
                  <div>
                    <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Taminotchi / Hamkor Nomi</label>
                    <input 
                      v-model="newPartnerForm.name" 
                      type="text" 
                      placeholder="Masalan: PepsiCo Uzbekistan"
                      required
                      class="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black bg-white"
                    />
                  </div>

                  <div>
                    <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Aloqa Ma'lumotlari (Telefon / Email)</label>
                    <input 
                      v-model="newPartnerForm.contact" 
                      type="text" 
                      placeholder="Masalan: +998 90 123 45 67"
                      class="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black bg-white"
                    />
                  </div>

                  <div class="flex space-x-3 pt-4">
                    <button 
                      type="button" 
                      @click="addPartnerModalOpen = false"
                      class="flex-1 py-3 border border-zinc-200 rounded-xl text-zinc-500 text-xs font-bold hover:bg-zinc-50 transition"
                    >
                      Bekor qilish
                    </button>
                    <button 
                      type="submit" 
                      class="flex-1 py-3 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition"
                    >
                      Saqlash
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>

    <!-- Floating Barcode Scanner Notification Overlay -->
    <div 
      v-if="scannerNotification" 
      class="fixed bottom-6 right-6 bg-zinc-900 border border-zinc-800 text-white px-5 py-4 rounded-2xl shadow-2xl z-50 flex items-center space-x-3.5 transition-all duration-300"
    >
      <div class="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
        ✓
      </div>
      <div>
        <h4 class="font-bold text-xs">Shtrix-kod skanerlandi!</h4>
        <p class="text-[10px] text-zinc-400">
          {{ scannerNotification.name }} - Zaxiradan 1 ta chegirildi. Qoldiq: {{ scannerNotification.stockQuantity }} ta
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import TimelineCalendar from './TimelineCalendar.vue';
import SettingsPanel from './SettingsPanel.vue';
import axios from 'axios';

const router = useRouter();
const user = ref(null);
const activeTab = ref('dashboard_home');

const currentTime = ref('');
const formattedDate = ref('');
const timerId = ref(null);

const staffList = ref([]);
const partnersList = ref([]);
const productsList = ref([]);
const financeMetrics = ref({
  totalRevenue: 2800000,
  totalExpenses: 850000,
  netProfit: 1950000,
  roomRevenue: 1800000,
  barRevenue: 1000000,
  saunaRevenue: 1000000,
  hammomRevenue: 800000,
  topSellingProducts: []
});

const activeFinanceSubTab = ref('analytics');

const showAddEmployeeModal = ref(false);
const showEditEmployeeModal = ref(false);
const employeeForm = ref({
  id: null,
  name: '',
  role: 'cleaner',
  salary: 3000000,
  pinCode: '',
  passportNumber: '',
  faceDescriptor: ''
});

const simulateStrangerFace = ref(false);
const capturedPhotoData = ref('');
let modalWebcamStream = null;

// Partners Panel Data Models
const addPartnerModalOpen = ref(false);
const newPartnerForm = ref({ name: '', contact: '' });
const partnerSupplyForm = ref({ partnerId: '', productName: '', price: null, costPrice: null, quantity: null, type: 'sale' });

const totalSuppliedProductsCount = computed(() => {
  return partnersList.value.reduce((sum, partner) => sum + (partner.products?.length || 0), 0);
});

// Mock control variables
const faceIdEmp = ref('');
const selectedStaffRole = ref('all');
const selectedCamera = ref('CAM-01');
const cameraLogs = ref([
  "[Tizim] Kameralar faol holatda. Yuz tanish moduli ishlamoqda."
]);

const dbCameras = ref([]);
const cameraForm = ref({ name: '', connectionType: 'USB', connectionAddress: 'COM3', permissions: 'full_access', purpose: '', customCode: '' });
const availableUsbPorts = ref(['COM3', 'COM1', 'COM2', 'COM4', '/dev/ttyUSB0']);
const visitorLogs = ref([]);
const cameraScripts = ref([]);
const newScriptForm = ref({ title: '', description: '', code: '' });
const selectedMappingScript = ref('');
const selectedMappingCamera = ref('');

const scanLocalUsbPorts = async () => {
  try {
    if (navigator.serial) {
      const ports = await navigator.serial.getPorts();
      if (ports && ports.length > 0) {
        const detected = ports.map((p, idx) => `COM-AutoDetect-${idx + 1}`);
        availableUsbPorts.value = [...new Set([...detected, 'COM3', 'COM1', 'COM2', 'COM4', '/dev/ttyUSB0'])];
        alert(`Skanerlash yakunlandi. Tizimda ${ports.length} ta USB/Serial port aniqlandi.`);
        return;
      }
    }
  } catch (e) {
    console.warn('Web Serial port detection failed:', e);
  }
  alert("Portlar qayta skanerlandi. Qurilmada faol: COM3 (RFID-RC522), COM1 (Datchik).");
};

const selectedCameraObj = computed(() => {
  return dbCameras.value.find(c => c.token === selectedCamera.value) || null;
});

const isUsbCameraSelected = computed(() => {
  if (selectedCamera.value === 'CAM-01' || selectedCamera.value === 'CAM-02' || selectedCamera.value === 'CAM-03' || selectedCamera.value === 'CAM-04') {
    return true;
  }
  if (selectedCameraObj.value && selectedCameraObj.value.connectionType === 'USB') {
    return true;
  }
  return false;
});

watch(() => cameraForm.value.connectionType, (newVal) => {
  if (newVal === 'USB') {
    cameraForm.value.connectionAddress = 'COM3';
  } else if (newVal === 'WIRELESS') {
    cameraForm.value.connectionAddress = 'wireless_api_stream';
  } else if (cameraForm.value.connectionAddress === 'COM3' || cameraForm.value.connectionAddress === 'wireless_api_stream') {
    cameraForm.value.connectionAddress = '';
  }
});

// Computed helper metrics for staff and camera
const filteredStaffList = computed(() => {
  if (selectedStaffRole.value === 'all') return staffList.value;
  return staffList.value.filter(emp => emp.role === selectedStaffRole.value);
});

const presentStaffCount = computed(() => {
  return staffList.value.filter(e => e.attendanceStatus === 'present').length;
});
const absentStaffCount = computed(() => {
  return staffList.value.filter(e => e.attendanceStatus === 'absent').length;
});
const halfStaffCount = computed(() => {
  return staffList.value.filter(e => e.attendanceStatus === 'half_day').length;
});
const totalStaffBonuses = computed(() => {
  return staffList.value.reduce((sum, e) => sum + (e.bonus || 0), 0);
});
const totalStaffPenalties = computed(() => {
  return staffList.value.reduce((sum, e) => sum + (e.penalty || 0), 0);
});

const fineEmployee = (id) => {
  const emp = staffList.value.find(e => e.id === id);
  if (emp) {
    emp.kpi = Math.max(50, emp.kpi - 10);
    emp.penalty += 50000;
  }
};

const bonusEmployee = (id) => {
  const emp = staffList.value.find(e => e.id === id);
  if (emp) {
    emp.kpi = Math.min(150, emp.kpi + 5);
    emp.bonus += 50000;
  }
};

const isSalariesPaid = ref(false);

const totalWagesPayout = computed(() => {
  return staffList.value.reduce((sum, emp) => sum + (emp.salary + emp.bonus - emp.penalty), 0);
});

const averageCustomerPaid = computed(() => {
  if (customerLogs.value.length === 0) return 0;
  const total = customerLogs.value.reduce((sum, log) => sum + (log.cashAmount + log.cardAmount), 0);
  return Math.round(total / customerLogs.value.length);
});

const payoutAllSalaries = async () => {
  if (isSalariesPaid.value) return;
  const amount = totalWagesPayout.value;
  try {
    const response = await axios.post('/api/finance/expense', {
      category: 'salary',
      amount: amount,
      description: `Barcha xodimlar uchun bugungi ish haqlari va mukofotlar to'lovi.`
    }, getAuthHeaders());
    if (response.data.success) {
      isSalariesPaid.value = true;
      await fetchFinanceMetrics();
      alert(`Bugungi xodimlar ish haqlari kassa chiqimidan to'landi! Jami to'lov: ${amount.toLocaleString()} UZS.`);
    }
  } catch (error) {
    console.error('Payout Salaries Error:', error);
    alert('Ish haqlarini to\'lashda xatolik yuz berdi.');
  }
};

const customerLogs = ref([]);

const fetchHistory = async () => {
  try {
    const response = await axios.get('/api/sessions/history', getAuthHeaders());
    if (response.data.success) {
      customerLogs.value = response.data.data;
    }
  } catch (error) {
    console.error('Fetch History Error:', error);
  }
};

const auditLogs = ref([]);

const fetchAuditLogs = async () => {
  try {
    const response = await axios.get('/api/audit-logs', getAuthHeaders());
    if (response.data.success) {
      auditLogs.value = response.data.data;
    }
  } catch (error) {
    console.error('Fetch Audit Logs Error:', error);
  }
};

const fetchFinanceMetrics = async () => {
  try {
    const response = await axios.get('/api/finance/metrics', getAuthHeaders());
    if (response.data.success) {
      const d = response.data.data;
      financeMetrics.value = {
        totalRevenue: d.totalRevenue || 0,
        totalExpenses: d.totalExpenses || 0,
        netProfit: d.netProfit || 0,
        roomRevenue: d.roomRevenue || 0,
        barRevenue: d.barRevenue || 0,
        saunaRevenue: d.saunaRevenue || 0,
        hammomRevenue: d.hammomRevenue || 0,
        topSellingProducts: d.topSellingProducts || []
      };
    }
  } catch (error) {
    console.error('Fetch Finance Metrics Error:', error);
  }
};

const formatDateTime = (isoString) => {
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const updateAttendance = async (id, status) => {
  const emp = staffList.value.find(e => e.id === id);
  if (emp) {
    emp.attendanceStatus = status;
    // Dynamic KPI penalty adjustment if absent
    if (status === 'absent') {
      emp.kpi = Math.max(50, emp.kpi - 20);
      emp.penalty += 50000;
    } else if (status === 'present') {
      emp.kpi = Math.min(150, emp.kpi + 5);
    }
    
    try {
      await axios.post('/api/employees/attendance', {
        employeeId: Number(id),
        status: status
      }, getAuthHeaders());
    } catch (error) {
      console.error('Update Attendance Error:', error);
    }
  }
};

// Forms
const expenseForm = ref({ category: 'electricity', amount: '', description: '' });
const returnForm = ref({ productId: '', quantity: '', reason: '' });
const supplyForm = ref({ partnerId: '', productName: '', price: '', costPrice: '', quantity: '', type: 'sale' });

const translations = {
  uz: {
    dashboard_label: "Boshqaruv Paneli",
    nav_dashboard: "Boshqaruv Paneli",
    nav_dashboard_home: "Kunlik Statistika",
    nav_warehouse: "Omborxona",
    nav_rooms: "Xonalar holati",
    nav_rooms_hammom: "Hammom xonalari",
    nav_rooms_sauna: "Sauna xonalari",
    nav_staff: "Xodimlar & Davomat",
    nav_face_id: "Face ID Nazorati",
    nav_customers: "Mijozlar Ro'yxati",
    nav_audit_logs: "Oxirgi amallar",
    nav_finance: "Moliyaviy hisoblar",
    nav_partners: "Hamkor ta'minotchilar",
    nav_settings: "Sozlamalar",
    logout: "Tizimdan chiqish",
    visitor_logs_title: "Kassa Oldida Aniqlangan Yangi Yuzlar / Tashrif buyuruvchilar Logi",
    visitor_logs_desc: "Kun davomida kassa oldidagi yuz aniqlash datchigi orqali olingan snapshots tarixi",
    camera_tokens_title: "Faol Kamera Aloqalari va Tokenlar",
    camera_tokens_desc: "Tizimga ulangan kameralar, ularning aloqa turi va tokenlari ro'yxati",
    camera_generator_title: "Kamera Token Generator",
    camera_generator_desc: "Har bir kamera uchun bitta alohida ulanish va API tokenini yaratish",
    camera_name_label: "Kamera Nomi (Label)",
    connection_type_label: "Aloqa Turi",
    camera_permissions_label: "Kamera Vazifasi",
    connection_address_label: "Ulanish Manzili (USB Port / Address)",
    camera_purpose_label: "Tavsif (Maqsadi)",
    camera_code_label: "Kamera uchun Ssenariy Kodi / Algoritm (Custom Script / Code)",
    token_create_btn: "Token Yaratish va Ulash",
    select_script_label: "Ssenariylar Kutubxonasidan Tanlash",
    script_library_title: "Ssenariy Kodlar Kutubxonasi (Script Database)",
    script_library_desc: "Kameralarga biriktirish uchun qayta ishlatiladigan ssenariylar bazasi",
    camera_integration_title: "Kamera va Kod Integratsiyasi (Mappings)",
    camera_integration_desc: "Tanlangan kamerani kutubxonadagi maxsus ssenariyga bog'lash va ishga tushirish",
    script_name: "Ssenariy Nomi",
    script_code: "Ssenariy Kodi",
    description: "Tavsif",
    select_camera: "Kamerani Tanlang",
    select_script: "Ssenariyni Tanlang",
    integrate_btn: "Integratsiya qilish (Ulash)",
    add_to_library: "Kutubxonaga Qo'shish"
  },
  ru: {
    dashboard_label: "Панель Управления",
    nav_dashboard: "Панель Управления",
    nav_dashboard_home: "Ежедневная статистика",
    nav_warehouse: "Складской учет",
    nav_rooms: "Состояние комнат",
    nav_rooms_hammom: "Хамам комнаты",
    nav_rooms_sauna: "Сауна комнаты",
    nav_staff: "Сотрудники и явка",
    nav_face_id: "Контроль Face ID",
    nav_customers: "Список клиентов",
    nav_audit_logs: "История действий",
    nav_finance: "Финансовый учет",
    nav_partners: "Партнеры-поставщики",
    nav_settings: "Настройки",
    logout: "Выйти из системы",
    visitor_logs_title: "Новые лица, обнаруженные у кассы / Журнал посетителей",
    visitor_logs_desc: "История снимков новых клиентов, полученных с помощью датчика распознавания у кассы",
    camera_tokens_title: "Активные подключения камер и токены",
    camera_tokens_desc: "Список подключенных к системе камер, их типов связи и токенов безопасности",
    camera_generator_title: "Генератор токенов камер",
    camera_generator_desc: "Создание отдельного подключения и токена API для каждой камеры",
    camera_name_label: "Название камеры (Label)",
    connection_type_label: "Тип связи",
    camera_permissions_label: "Задача камеры",
    connection_address_label: "Адрес подключения (USB-порт / адрес)",
    camera_purpose_label: "Описание (Цель)",
    camera_code_label: "Сценарий / Код алгоритма для камеры (Custom Script / Code)",
    token_create_btn: "Создать токен и подключить",
    select_script_label: "Выбрать из библиотеки сценариев",
    script_library_title: "Библиотека кодов сценариев (База сценариев)",
    script_library_desc: "База многократных кодов/сценариев для привязки к камерам",
    camera_integration_title: "Интеграция камеры и кода (Связи)",
    camera_integration_desc: "Привязка и запуск выбранной камеры с помощью специального сценария из библиотеки",
    script_name: "Название сценария",
    script_code: "Код сценария",
    description: "Описание",
    select_camera: "Выберите камеру",
    select_script: "Выберите сценарий",
    integrate_btn: "Интегрировать (Связать)",
    add_to_library: "Добавить в библиотеку"
  },
  en: {
    dashboard_label: "Control Panel",
    nav_dashboard: "Control Panel",
    nav_dashboard_home: "Daily Statistics",
    nav_warehouse: "Warehouse",
    nav_rooms: "Rooms Status",
    nav_rooms_hammom: "Bathhouse rooms",
    nav_rooms_sauna: "Sauna rooms",
    nav_staff: "Staff & Attendance",
    nav_face_id: "Face ID Control",
    nav_customers: "Customers List",
    nav_audit_logs: "Audit Logs",
    nav_finance: "Financial Accounting",
    nav_partners: "Supplier Partners",
    nav_settings: "Settings",
    logout: "Log out",
    visitor_logs_title: "New Faces Detected at Cash Counter / Visitor Log",
    visitor_logs_desc: "Snapshot history of new customer faces captured by face recognition sensor at register",
    camera_tokens_title: "Active Camera Connections & Tokens",
    camera_tokens_desc: "List of cameras connected to the system, their connection types, and security tokens",
    camera_generator_title: "Camera Token Generator",
    camera_generator_desc: "Generate a separate connection and API token for each camera",
    camera_name_label: "Camera Name (Label)",
    connection_type_label: "Connection Type",
    camera_permissions_label: "Camera Role",
    connection_address_label: "Connection Address (USB Port / Address)",
    camera_purpose_label: "Description (Purpose)",
    camera_code_label: "Camera Scenario Script / Algorithm (Custom Script / Code)",
    token_create_btn: "Generate Token and Connect",
    select_script_label: "Select from Script Library",
    script_library_title: "Scenario Scripts Library (Script Database)",
    script_library_desc: "Database of reusable automation codes/scripts to bind with cameras",
    camera_integration_title: "Camera & Script Integration (Mappings)",
    camera_integration_desc: "Bind and launch selected camera to a custom scenario from script library",
    script_name: "Script Title",
    script_code: "Script Code",
    description: "Description",
    select_camera: "Select Camera",
    select_script: "Select Script",
    integrate_btn: "Integrate (Bind)",
    add_to_library: "Add to Library"
  },
  tr: {
    dashboard_label: "Kontrol Paneli",
    nav_dashboard: "Kontrol Paneli",
    nav_dashboard_home: "Günlük İstatistikler",
    nav_warehouse: "Depo",
    nav_rooms: "Odalar Durumu",
    nav_rooms_hammom: "Hamam odaları",
    nav_rooms_sauna: "Sauna odaları",
    nav_staff: "Personel ve Katılım",
    nav_face_id: "Face ID Kontrolü",
    nav_customers: "Müşteri Listesi",
    nav_finance: "Finansal Hesaplar",
    nav_partners: "Tedarikçi Ortaklar",
    nav_settings: "Ayarlar",
    logout: "Çıkış Yap",
    visitor_logs_title: "Kasa Önünde Tespit Edilen Yeni Yüzler / Ziyaretçi Günlüğü",
    visitor_logs_desc: "Gün boyunca kasadaki yüz tanıma sensörü tarafından çekilen yeni müşteri yüzlerinin görüntü geçmişi",
    camera_tokens_title: "Aktif Kamera Bağlantıları ve Jetonları",
    camera_tokens_desc: "Sisteme bağlı kameraların, bağlantı türlerinin ve güvenlik jetonlarının listesi",
    camera_generator_title: "Kamera Jeton Üreticisi",
    camera_generator_desc: "Her kamera için ayrı bir bağlantı ve API jetonu oluşturun",
    camera_name_label: "Kamera Adı (Etiket)",
    connection_type_label: "Bağlantı Türü",
    camera_permissions_label: "Kamera Rolü",
    connection_address_label: "Bağlantı Adresi (USB Port / Adres)",
    camera_purpose_label: "Açıklama (Amaç)",
    camera_code_label: "Kamera Senaryo Kodu / Algoritma (Custom Script / Code)",
    token_create_btn: "Jeton Üret ve Bağlan",
    select_script_label: "Senaryo Kütüphanesinden Seç",
    script_library_title: "Senaryo Kodları Kütüphanesi (Senaryo Veritabanı)",
    script_library_desc: "Kameralarla eşleştirmek için yeniden kullanılabilir otomasyon kodları/senaryoları veritabanı",
    camera_integration_title: "Kamera ve Kod Entegrasyonu (Eşleştirmeler)",
    camera_integration_desc: "Seçilen kamerayı kütüphaneden özel bir senaryoya bağlayın ve başlatın",
    script_name: "Senaryo Adı",
    script_code: "Senaryo Kodu",
    description: "Açıklama",
    select_camera: "Kamerayı Seç",
    select_script: "Senaryoyu Seç",
    integrate_btn: "Entegre Et (Bağla)",
    add_to_library: "Kütüphaneye Ekle"
  }
};

const currentLang = ref(localStorage.getItem('sauna_lang') || 'uz');
const t = (key) => translations[currentLang.value]?.[key] || translations['uz'][key] || key;

const dashboardSubItems = [
  { id: 'dashboard_home', labelKey: 'nav_dashboard_home', icon: '🏠' },
  { id: 'rooms', labelKey: 'nav_rooms', icon: '🛁', hasChildren: true },
  { id: 'staff', labelKey: 'nav_staff', icon: '👤', hasChildren: true },
  { id: 'customers', labelKey: 'nav_customers', icon: '👥' },
  { id: 'finance', labelKey: 'nav_finance', icon: '💼' },
  { id: 'partners', labelKey: 'nav_partners', icon: '🤝' }
];

const dashboardMenuOpen = ref(true);
const roomsMenuOpen = ref(false);
const staffMenuOpen = ref(false);
const warehouseMenuOpen = ref(false);

const visibleSubItems = computed(() => {
  return dashboardSubItems.filter(sub => hasAccess(sub.id));
});

const getAuthHeaders = () => {
  const token = localStorage.getItem('sauna_token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

const hasAccess = (section) => {
  if (!user.value) return false;
  const role = user.value.role;
  // Menejer (manager) roliga oxirgi amallarni ko'rish taqiqlanadi (faqat super_admin ko'ra oladi)
  if (section === 'audit_logs' && role === 'manager') return false;
  
  if (role === 'super_admin' || role === 'manager') return true;
  
  if (role === 'cashier') {
    const saved = localStorage.getItem('sauna_permissions');
    const perms = saved ? JSON.parse(saved) : {
      cashierViewKpi: false,
      cashierViewFinance: false,
      cashierViewWarehouse: false,
      cashierViewCustomers: true
    };
    
    // Always allowed for cashier:
    if (['rooms', 'rooms_hammom', 'rooms_sauna', 'dashboard_home', 'settings'].includes(section)) return true;
    
    // Configurable:
    if (section === 'staff' && perms.cashierViewKpi) return true;
    if (section === 'finance' && perms.cashierViewFinance) return true;
    if (section === 'warehouse' && perms.cashierViewWarehouse) return true;
    if (section === 'customers' && perms.cashierViewCustomers) return true;
    
    return false;
  }
  
  if (role === 'barman') {
    if (['warehouse', 'warehouse_scan'].includes(section)) return true;
    return false;
  }
  
  return false;
};

// Clock updater
const updateClock = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  formattedDate.value = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

onMounted(() => {
  user.value = JSON.parse(localStorage.getItem('sauna_user') || '{}');
  if (user.value.role === 'cashier') {
    activeTab.value = 'rooms';
  } else {
    activeTab.value = 'dashboard_home';
  }
  updateClock();
  timerId.value = setInterval(updateClock, 1000);

  // Initial staff & partners logs setup
  fetchStaffAndPartners();
  fetchHistory();
  fetchAuditLogs();
  fetchFinanceMetrics();
  fetchDbCameras();
  fetchCameraScripts();

  // Register global barcode scanner listener
  window.addEventListener('keydown', handleGlobalKeypress);
});

// Webcam feed manager
let webcamStream = null;

const startWebcam = async () => {
  if (!isUsbCameraSelected.value) {
    console.log('[Webcam] Bypassing webcam startup for network camera.');
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
    webcamStream = stream;
    setTimeout(() => {
      const videoEl = document.getElementById('webcamVideo');
      if (videoEl) {
        videoEl.srcObject = stream;
      }
    }, 250);
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    cameraLogs.value.unshift(`[${timeString}] [Tizim] ${selectedCameraObj.value ? selectedCameraObj.value.name : selectedCamera.value} ulangan. Video oqimi faol.`);
  } catch (err) {
    console.warn('Webcam initialization failed:', err);
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    cameraLogs.value.unshift(`[${timeString}] [Xatolik] Kamera topilmadi yoki ruxsat berilmadi.`);
  }
};

const stopWebcam = () => {
  if (webcamStream) {
    webcamStream.getTracks().forEach(track => track.stop());
    webcamStream = null;
    console.log('[Webcam] Camera feed stopped.');
  }
};

watch(activeTab, (newTab) => {
  if (newTab === 'customers') {
    fetchHistory();
  } else if (newTab === 'audit_logs') {
    fetchAuditLogs();
  } else if (newTab === 'finance') {
    fetchFinanceMetrics();
  }
  
  if (newTab === 'face_id') {
    fetchDbCameras();
    fetchVisitorLogs();
    startWebcam();
  } else {
    stopWebcam();
  }
});

watch(selectedCamera, async () => {
  if (activeTab.value === 'face_id') {
    if (isUsbCameraSelected.value) {
      startWebcam();
      // Switch COM/Serial Port on backend dynamically
      if (selectedCameraObj.value && selectedCameraObj.value.connectionType === 'USB') {
        try {
          const response = await axios.post('/api/rfid/set-port', {
            port: selectedCameraObj.value.connectionAddress
          }, getAuthHeaders());
          
          if (response.data.success) {
            const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            cameraLogs.value.unshift(`[${timeString}] [Aloqa] RFID datchik porti "${selectedCameraObj.value.connectionAddress}" ga muvaffaqiyatli o'zgartirildi.`);
          }
        } catch (err) {
          console.warn('Failed to switch serial port on backend:', err);
        }
      }
    } else {
      stopWebcam();
    }
  }
});

onUnmounted(() => {
  clearInterval(timerId.value);
  window.removeEventListener('keydown', handleGlobalKeypress);
  stopWebcam();
});

const fetchStaffAndPartners = async () => {
  if (user.value.role === 'super_admin' || user.value.role === 'manager') {
    try {
      const response = await axios.get('/api/employees', getAuthHeaders());
      if (response.data.success) {
        staffList.value = response.data.data.map(emp => {
          const att = emp.attendance?.[0];
          return {
            id: emp.id,
            name: emp.name,
            role: emp.role,
            salary: emp.salary || 3000000,
            pinCode: emp.pinCode,
            attendanceStatus: att?.status || 'present',
            kpi: att?.kpiScore || 100,
            bonus: att?.bonusAmount || 0,
            penalty: att?.penaltyAmount || 0
          };
        });
      }
    } catch (error) {
      console.error('Fetch Employees Error:', error);
    }

    try {
      const response = await axios.get('/api/partners', getAuthHeaders());
      if (response.data.success) {
        partnersList.value = response.data.data;
        
        // Flatten products from all partners
        const allProducts = response.data.data.reduce((acc, partner) => {
          const partnerProducts = (partner.products || []).map(prod => ({
            ...prod,
            partnerName: partner.name
          }));
          return [...acc, ...partnerProducts];
        }, []);

        if (allProducts.length > 0) {
          productsList.value = allProducts;
        } else {
          // fallback if DB is empty of products
          productsList.value = [
            { id: 1, name: 'Coca Cola 0.5L', price: 15000, stockQuantity: 150, barcode: '5449000000996' },
            { id: 2, name: 'Meva Sharbatlari', price: 20000, stockQuantity: 80, barcode: '4607006841234' },
            { id: 3, name: 'Sochiq Ijarasi (Towel)', price: 10000, stockQuantity: 40, barcode: '2000000010668' },
            { id: 4, name: 'Maxsus Sovun (Soap)', price: 5000, stockQuantity: 200, barcode: '2000000010675' }
          ];
        }
      }
    } catch (error) {
      console.error('Fetch Partners Error:', error);
      partnersList.value = [
        { id: 1, name: 'Sifatli Ichimliklar MCHJ', contact: '+998901234567', products: [] },
        { id: 2, name: 'Yuvish Vositalari Hamkori', contact: '+998909876543', products: [] }
      ];
      productsList.value = [
        { id: 1, name: 'Coca Cola 0.5L', price: 15000, stockQuantity: 150, barcode: '5449000000996' },
        { id: 2, name: 'Meva Sharbatlari', price: 20000, stockQuantity: 80, barcode: '4607006841234' },
        { id: 3, name: 'Sochiq Ijarasi (Towel)', price: 10000, stockQuantity: 40, barcode: '2000000010668' },
        { id: 4, name: 'Maxsus Sovun (Soap)', price: 5000, stockQuantity: 200, barcode: '2000000010675' }
      ];
    }
  }
};

const openAddEmployeeModal = () => {
  employeeForm.value = {
    id: null,
    name: '',
    role: 'cleaner',
    salary: 3000000,
    pinCode: '',
    passportNumber: '',
    faceDescriptor: ''
  };
  capturedPhotoData.value = '';
  showAddEmployeeModal.value = true;
  startModalWebcam();
};

const startModalWebcam = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
    modalWebcamStream = stream;
    setTimeout(() => {
      const videoEl = document.getElementById('modalWebcamVideo');
      if (videoEl) {
        videoEl.srcObject = stream;
      }
    }, 250);
  } catch (err) {
    console.warn('Modal webcam access failed:', err);
  }
};

const stopModalWebcam = () => {
  if (modalWebcamStream) {
    modalWebcamStream.getTracks().forEach(track => track.stop());
    modalWebcamStream = null;
  }
};

const captureRealFace = () => {
  const videoEl = document.getElementById('modalWebcamVideo');
  if (!videoEl) {
    alert('Kamera topilmadi.');
    return;
  }

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 225;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoEl, 0, 0, 300, 225);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    capturedPhotoData.value = dataUrl;
    employeeForm.value.faceDescriptor = dataUrl; // Store the captured image dataURL
    playBeep('success');
  } catch (err) {
    console.error('Capture real face error:', err);
    alert('Yuzni rasmga olishda xatolik yuz berdi.');
  }
};

const captureFaceDescriptor = () => {
  captureRealFace();
};

const submitAddEmployee = async () => {
  try {
    const response = await axios.post('/api/employees/add', {
      name: employeeForm.value.name,
      role: employeeForm.value.role,
      salary: Number(employeeForm.value.salary),
      pinCode: employeeForm.value.pinCode,
      passportNumber: employeeForm.value.passportNumber || null,
      faceDescriptor: employeeForm.value.faceDescriptor || null
    }, getAuthHeaders());

    if (response.data.success) {
      stopModalWebcam();
      showAddEmployeeModal.value = false;
      employeeForm.value = { id: null, name: '', role: 'cleaner', salary: 3000000, pinCode: '', passportNumber: '', faceDescriptor: '' };
      capturedPhotoData.value = '';
      await fetchStaffAndPartners();
      alert('Yangi xodim muvaffaqiyatli qo\'shildi.');
    }
  } catch (error) {
    console.error('Submit Add Employee Error:', error);
    alert(error.response?.data?.message || 'Xodim qo\'shishda xatolik.');
  }
};

const openEditEmployeeModal = (emp) => {
  employeeForm.value = {
    id: emp.id,
    name: emp.name,
    role: emp.role,
    salary: emp.salary,
    pinCode: emp.pinCode || ''
  };
  showEditEmployeeModal.value = true;
};

const submitEditEmployee = async () => {
  try {
    const response = await axios.put(`/api/employees/${employeeForm.value.id}`, {
      name: employeeForm.value.name,
      role: employeeForm.value.role,
      salary: Number(employeeForm.value.salary),
      pinCode: employeeForm.value.pinCode
    }, getAuthHeaders());

    if (response.data.success) {
      showEditEmployeeModal.value = false;
      employeeForm.value = { id: null, name: '', role: 'cleaner', salary: 3000000, pinCode: '' };
      await fetchStaffAndPartners();
      alert('Xodim ma\'lumotlari muvaffaqiyatli yangilandi.');
    }
  } catch (error) {
    console.error('Submit Edit Employee Error:', error);
    alert(error.response?.data?.message || 'Xodim ma\'lumotlarini tahrirlashda xatolik.');
  }
};

const confirmDeleteEmployee = async (id) => {
  if (!confirm('Ushbu xodimni tizimdan butunlay o\'chirmoqchimisiz? Undan keyingi barcha davomat ma\'lumotlari ham o\'chib ketadi.')) {
    return;
  }
  try {
    const response = await axios.delete(`/api/employees/${id}`, getAuthHeaders());
    if (response.data.success) {
      await fetchStaffAndPartners();
      alert('Xodim muvaffaqiyatli o\'chirildi.');
    }
  } catch (error) {
    console.error('Delete Employee Error:', error);
    alert(error.response?.data?.message || 'Xodimni o\'chirishda xatolik.');
  }
};

// Partners action handlers
const openAddPartnerModal = () => {
  newPartnerForm.value = { name: '', contact: '' };
  addPartnerModalOpen.value = true;
};

const submitAddPartner = async () => {
  try {
    const response = await axios.post('/api/partners/add', newPartnerForm.value, getAuthHeaders());
    if (response.data.success) {
      addPartnerModalOpen.value = false;
      await fetchStaffAndPartners();
      alert('Yangi hamkor muvaffaqiyatli qo\'shildi.');
    }
  } catch (error) {
    console.error('Create Partner Error:', error);
    alert(error.response?.data?.message || 'Hamkor qo\'shishda xatolik yuz berdi.');
  }
};

const submitPartnerSupply = async () => {
  try {
    const response = await axios.post('/api/partners/supply', {
      partnerId: Number(partnerSupplyForm.value.partnerId),
      productName: partnerSupplyForm.value.productName,
      price: Number(partnerSupplyForm.value.price),
      costPrice: Number(partnerSupplyForm.value.costPrice),
      quantity: Number(partnerSupplyForm.value.quantity),
      type: partnerSupplyForm.value.type
    }, getAuthHeaders());

    if (response.data.success) {
      partnerSupplyForm.value = { partnerId: '', productName: '', price: null, costPrice: null, quantity: null, type: 'sale' };
      await fetchStaffAndPartners();
      alert('Mahsulot yetkazib berilishi saqlandi va ombor qoldig\'i yangilandi.');
    }
  } catch (error) {
    console.error('Submit Supply Error:', error);
    alert(error.response?.data?.message || 'Mahsulot yetkazib berilishini yozishda xatolik yuz berdi.');
  }
};

// Employee Rating KPI action
const rateEmployee = async (id, stars) => {
  // Calls KPI API and updates state locally
  const empIndex = staffList.value.findIndex(e => e.id === id);
  if (empIndex !== -1) {
    if (stars === 5) {
      staffList.value[empIndex].kpi += 5;
      staffList.value[empIndex].bonus += 50000;
    } else {
      staffList.value[empIndex].kpi -= 10;
      staffList.value[empIndex].penalty += 20000;
    }
  }
};

// Face ID check-in action
const triggerFaceIdCheck = async () => {
  // If cashier catcher camera is active, it runs completely independent of selected employees
  if (selectedCameraObj.value && selectedCameraObj.value.permissions === 'cashier_visitor_catcher') {
    let capturedPhoto = 'data:image/jpeg;base64,mockFaceSnapshot';
    
    if (isUsbCameraSelected.value) {
      const videoEl = document.getElementById('webcamVideo');
      if (videoEl) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 150;
          canvas.height = 112;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(videoEl, 0, 0, 150, 112);
          capturedPhoto = canvas.toDataURL('image/jpeg', 0.85);
        } catch (e) {
          console.warn('Failed to capture frame from webcam, using mock face:', e);
        }
      }
    }

    try {
      const headers = getAuthHeaders().headers;
      headers.Authorization = `Bearer ${selectedCameraObj.value.token}`;

      const response = await axios.post('/api/employees/face-id-scan', {
        cameraIp: selectedCameraObj.value.name,
        faceDescriptorHash: capturedPhoto
      }, { headers });

      if (response.data.success) {
        playBeep('success');
        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        cameraLogs.value.unshift(`[${timeString}] ${selectedCameraObj.value.name}: ${response.data.message}`);
        
        await fetchVisitorLogs();
        alert(response.data.message);
      }
      return;
    } catch (error) {
      playBeep('error');
      console.error('Visitor Catcher Scan Error:', error);
      alert(error.response?.data?.message || 'Yuzni rasmga olishda xatolik.');
      return;
    }
  }

  // Employee checking flow (standard / efficiency monitor)
  if (!faceIdEmp.value) {
    alert('Simulyatsiya qilish va yuzni aniqlash uchun xodimni tanlang!');
    return;
  }
  const employee = staffList.value.find(e => e.id === faceIdEmp.value);
  if (!employee) return;

  if (!employee.faceDescriptor) {
    alert('Ushbu xodimda ro\'yxatdan o\'tgan yuz rasmi biometriyasi yo\'q!');
    return;
  }

  let biometricsResult = 'biometrics_stranger_rejected';

  if (!simulateStrangerFace.value) {
    if (!isUsbCameraSelected.value) {
      biometricsResult = 'biometrics_matched_successfully';
    } else {
      const videoEl = document.getElementById('webcamVideo');
      if (!videoEl) {
        alert('Kuzatuv kamerasi oqimi topilmadi.');
        return;
      }
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 75;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoEl, 0, 0, 100, 75);

        const getDHash = (sourceElement) => {
          const hCanvas = document.createElement('canvas');
          hCanvas.width = 9;
          hCanvas.height = 8;
          const hCtx = hCanvas.getContext('2d');
          hCtx.drawImage(sourceElement, 0, 0, 9, 8);
          const imgData = hCtx.getImageData(0, 0, 9, 8).data;
          const gray = [];
          for (let i = 0; i < imgData.length; i += 4) {
            gray.push(0.299 * imgData[i] + 0.587 * imgData[i+1] + 0.114 * imgData[i+2]);
          }
          let hash = '';
          for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
              hash += gray[y * 9 + x] < gray[y * 9 + x + 1] ? '1' : '0';
            }
          }
          return hash;
        };

        const liveHash = getDHash(canvas);

        const regImg = new Image();
        regImg.src = employee.faceDescriptor;
        await new Promise((resolve) => {
          regImg.onload = resolve;
          regImg.onerror = resolve;
        });

        const regHash = getDHash(regImg);

        let hammingDistance = 0;
        for (let i = 0; i < liveHash.length; i++) {
          if (liveHash[i] !== regHash[i]) hammingDistance++;
        }

        console.log(`[Biometrics Match] Hamming Distance Calculated: ${hammingDistance}`);

        if (hammingDistance <= 18) {
          biometricsResult = 'biometrics_matched_successfully';
        }
      } catch (err) {
        console.warn('Local computer vision error, falling back to mock pass:', err);
        biometricsResult = 'biometrics_matched_successfully';
      }
    }
  }

  try {
    const headers = getAuthHeaders().headers;
    if (selectedCameraObj.value) {
      headers.Authorization = `Bearer ${selectedCameraObj.value.token}`;
    }

    const response = await axios.post('/api/employees/face-id-scan', {
      employeeId: Number(faceIdEmp.value),
      cameraIp: selectedCameraObj.value ? selectedCameraObj.value.name : selectedCamera.value,
      faceDescriptorHash: biometricsResult
    }, { headers });

    if (response.data.success) {
      playBeep('success');
      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      cameraLogs.value.unshift(`[${timeString}] ${selectedCameraObj.value ? selectedCameraObj.value.name : selectedCamera.value}: ${response.data.message}`);
      
      if (cameraLogs.value.length > 25) {
        cameraLogs.value.pop();
      }

      await fetchStaffAndPartners();
      alert(response.data.message);
    }
  } catch (error) {
    playBeep('error');
    console.error('Face ID Scan API Error:', error);
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    cameraLogs.value.unshift(`[${timeString}] [RAD ETILDI] ${selectedCameraObj.value ? selectedCameraObj.value.name : selectedCamera.value}: ${error.response?.data?.message || 'Face ID mos kelmadi.'}`);
    alert(error.response?.data?.message || 'Face ID mos kelmadi.');
  }
};

// Camera connections database calls
const fetchDbCameras = async () => {
  try {
    const response = await axios.get('/api/camera-tokens', getAuthHeaders());
    if (response.data.success) {
      dbCameras.value = response.data.data;
    }
  } catch (error) {
    console.error('Fetch DB Cameras Error:', error);
  }
};

const fetchVisitorLogs = async () => {
  try {
    const response = await axios.get('/api/visitors/logs', getAuthHeaders());
    if (response.data.success) {
      visitorLogs.value = response.data.data;
    }
  } catch (error) {
    console.error('Fetch Visitor Logs Error:', error);
  }
};

const fetchCameraScripts = async () => {
  try {
    const response = await axios.get('/api/camera-scripts', getAuthHeaders());
    if (response.data.success) {
      cameraScripts.value = response.data.data;
    }
  } catch (error) {
    console.error('Fetch Camera Scripts Error:', error);
  }
};

const submitAddCameraScript = async () => {
  try {
    const response = await axios.post('/api/camera-scripts/add', newScriptForm.value, getAuthHeaders());
    if (response.data.success) {
      newScriptForm.value = { title: '', description: '', code: '' };
      await fetchCameraScripts();
      alert('Yangi ssenariy kodi kutubxonaga muvaffaqiyatli saqlandi.');
    }
  } catch (error) {
    console.error('Submit Add Script Error:', error);
    alert(error.response?.data?.message || 'Ssenariyni saqlashda xatolik yuz berdi.');
  }
};

const deleteCameraScript = async (id) => {
  if (!confirm('Ushbu ssenariyni o\'chirmoqchimisiz? Barcha unga bog\'langan kameralar aloqasi bekor qilinadi.')) return;
  try {
    const response = await axios.delete(`/api/camera-scripts/${id}`, getAuthHeaders());
    if (response.data.success) {
      await fetchCameraScripts();
      await fetchDbCameras();
      alert('Ssenariy o\'chirildi.');
    }
  } catch (error) {
    console.error('Delete Script Error:', error);
    alert(error.response?.data?.message || 'O\'chirishda xatolik yuz berdi.');
  }
};

const submitScriptIntegration = async () => {
  if (!selectedMappingCamera.value) {
    alert('Integratsiya qilish uchun kamerani tanlang!');
    return;
  }
  try {
    const response = await axios.post('/api/camera-tokens/integrate-script', {
      cameraId: Number(selectedMappingCamera.value),
      scriptId: selectedMappingScript.value ? Number(selectedMappingScript.value) : null
    }, getAuthHeaders());

    if (response.data.success) {
      selectedMappingCamera.value = '';
      selectedMappingScript.value = '';
      await fetchDbCameras();
      await fetchCameraScripts();
      alert(response.data.message);
    }
  } catch (error) {
    console.error('Script Integration Error:', error);
    alert(error.response?.data?.message || 'Integratsiya sozlashda xatolik yuz berdi.');
  }
};

const formatDetectionTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const formatDetectionDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const onFormScriptSelect = () => {
  if (cameraForm.value.scriptId) {
    const selected = cameraScripts.value.find(s => s.id === cameraForm.value.scriptId);
    if (selected) {
      cameraForm.value.customCode = selected.code;
    }
  } else {
    cameraForm.value.customCode = '';
  }
};

const generateCameraConnection = async () => {
  try {
    const payload = {
      name: cameraForm.value.name,
      connectionType: cameraForm.value.connectionType,
      connectionAddress: cameraForm.value.connectionAddress,
      permissions: cameraForm.value.permissions,
      purpose: cameraForm.value.purpose,
      customCode: cameraForm.value.customCode,
      scriptId: cameraForm.value.scriptId ? Number(cameraForm.value.scriptId) : null
    };
    const response = await axios.post('/api/camera-tokens/generate', payload, getAuthHeaders());
    if (response.data.success) {
      alert(`Kamera ulanishi faollashtirildi! Kamera uchun maxsus token yaratildi:\n${response.data.data.token}`);
      cameraForm.value = { name: '', connectionType: 'USB', connectionAddress: 'COM3', permissions: 'full_access', purpose: '', customCode: '', scriptId: null };
      await fetchDbCameras();
    }
  } catch (error) {
    console.error('Generate Camera Connection Error:', error);
    alert(error.response?.data?.message || 'Ulanish tokenini yaratishda xatolik yuz berdi.');
  }
};

const revokeCameraConnection = async (id) => {
  if (!confirm('Haqiqatan ham ushbu kamera ulanishini o\'chirmoqchimisiz? Kalit bekor qilinadi.')) return;
  try {
    const response = await axios.delete(`/api/camera-tokens/${id}`, getAuthHeaders());
    if (response.data.success) {
      alert('Kamera aloqasi va tokeni muvaffaqiyatli bekor qilindi.');
      if (selectedCameraObj.value && selectedCameraObj.value.id === id) {
        selectedCamera.value = 'CAM-01';
      }
      await fetchDbCameras();
    }
  } catch (error) {
    console.error('Revoke Connection Error:', error);
    alert('Bekor qilishda xatolik yuz berdi.');
  }
};

const copyCameraTokenToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  alert('Kamera API Token nusxalandi! Ulanish kaliti:\n' + text);
};

// Barcode Scanner Listener and API sync methods
let barcodeBuffer = '';
let lastKeyTime = 0;
const scannerNotification = ref(null);

const playBeep = (type = 'success') => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === 'success') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.08);
    } else {
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
    }
  } catch (err) {
    console.warn('Audio Context warning:', err);
  }
};

const showScannerNotification = (prod) => {
  scannerNotification.value = prod;
  setTimeout(() => {
    scannerNotification.value = null;
  }, 4000);
};

const processBarcodeScan = async (code) => {
  try {
    const token = localStorage.getItem('sauna_token');
    const response = await axios.post('/api/products/scan', { barcode: code }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      const prod = response.data.product;
      const localProd = productsList.value.find(p => p.barcode === code);
      if (localProd) {
        localProd.stockQuantity = prod.stockQuantity;
      }
      playBeep('success');
      showScannerNotification(prod);
    }
  } catch (error) {
    console.error('Barcode Scan API Error:', error);
    // Fallback to local match in case backend is offline or product isn't seeded
    const localProd = productsList.value.find(p => p.barcode === code);
    if (localProd && localProd.stockQuantity > 0) {
      localProd.stockQuantity -= 1;
      playBeep('success');
      showScannerNotification(localProd);
    } else {
      playBeep('error');
      alert(error.response?.data?.message || 'Shtrix-kod topilmadi yoki ushbu mahsulot zaxirada qolmagan!');
    }
  }
};

const barcodeMode = ref('bind');
const bindForm = ref({ productId: '', barcode: '' });
const newBarcodeProdForm = ref({ name: '', price: '', costPrice: '', stockQuantity: '', type: 'sale', barcode: '' });
const activeCaptureField = ref(null);

const startBarcodeCapture = (field) => {
  activeCaptureField.value = field;
  alert('Iltimos, shtrix-kodni skanerlang. Skanerlangandan so\'ng ma\'lumotlar avtomatik to\'ldiriladi.');
  setTimeout(() => {
    const selector = field === 'bind' ? 'input[placeholder="Masalan: 4860005910020"]' : 'input[placeholder="Masalan: 4860005910037"]';
    const el = document.querySelector(selector);
    if (el) el.focus();
  }, 100);
};

const submitBindBarcode = async () => {
  try {
    const token = localStorage.getItem('sauna_token');
    const response = await axios.post('/api/products/update-barcode', {
      id: bindForm.value.productId,
      barcode: bindForm.value.barcode
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      alert('Shtrix-kod muvaffaqiyatli biriktirildi!');
      const localProd = productsList.value.find(p => p.id === bindForm.value.productId);
      if (localProd) {
        localProd.barcode = bindForm.value.barcode;
      }
      bindForm.value = { productId: '', barcode: '' };
    }
  } catch (error) {
    console.error('Bind Barcode Error:', error);
    alert(error.response?.data?.message || 'Shtrix-kodni biriktirishda xatolik yuz berdi.');
  }
};

const submitCreateBarcodeProduct = async () => {
  try {
    const token = localStorage.getItem('sauna_token');
    const response = await axios.post('/api/products/add-with-barcode', {
      name: newBarcodeProdForm.value.name,
      price: newBarcodeProdForm.value.price,
      costPrice: newBarcodeProdForm.value.costPrice,
      stockQuantity: newBarcodeProdForm.value.stockQuantity,
      type: newBarcodeProdForm.value.type,
      barcode: newBarcodeProdForm.value.barcode
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      alert('Yangi mahsulot shtrix-kod bilan birga muvaffaqiyatli saqlandi!');
      const newProd = response.data.data;
      productsList.value.push(newProd);
      newBarcodeProdForm.value = { name: '', price: '', costPrice: '', stockQuantity: '', type: 'sale', barcode: '' };
    }
  } catch (error) {
    console.error('Create Barcode Product Error:', error);
    alert(error.response?.data?.message || 'Yangi mahsulotni saqlashda xatolik yuz berdi.');
  }
};

const handleGlobalKeypress = (event) => {
  const activeEl = document.activeElement;
  const isCaptureInput = activeEl && activeEl.tagName === 'INPUT' && 
    (activeEl.placeholder === 'Masalan: 4860005910020' || activeEl.placeholder === 'Masalan: 4860005910037');

  if (!isCaptureInput && activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) {
    return;
  }

  const currentTime = Date.now();
  
  if (currentTime - lastKeyTime > 50) {
    barcodeBuffer = '';
  }
  
  lastKeyTime = currentTime;
  
  if (event.key.length === 1) {
    barcodeBuffer += event.key;
  } else if (event.key === 'Enter') {
    if (barcodeBuffer.length >= 8) {
      console.log('Barcode scanned:', barcodeBuffer);
      if (isCaptureInput) {
        if (activeEl.placeholder === 'Masalan: 4860005910020') {
          bindForm.value.barcode = barcodeBuffer;
        } else {
          newBarcodeProdForm.value.barcode = barcodeBuffer;
        }
        playBeep('success');
      } else {
        processBarcodeScan(barcodeBuffer);
      }
    }
    barcodeBuffer = '';
  }
};

// Submits
const submitExpense = async () => {
  try {
    await axios.post('/api/finance/expense', {
      category: expenseForm.value.category,
      amount: expenseForm.value.amount,
      description: expenseForm.value.description
    }, getAuthHeaders());

    alert('Xarajat saqlandi!');
    // Update local stats demo values
    financeMetrics.value.totalExpenses += Number(expenseForm.value.amount);
    financeMetrics.value.netProfit -= Number(expenseForm.value.amount);
    expenseForm.value = { category: 'electricity', amount: '', description: '' };
  } catch (err) {
    alert('Ruxsat yo\'q yoki xatolik yuz berdi');
  }
};

const submitProductReturn = async () => {
  try {
    await axios.post('/api/finance/return', {
      productId: returnForm.value.productId,
      quantity: returnForm.value.quantity,
      reason: returnForm.value.reason
    }, getAuthHeaders());

    alert('Yuk muvaffaqiyatli hamkorga qaytarildi!');
    returnForm.value = { productId: '', quantity: '', reason: '' };
    fetchStaffAndPartners();
  } catch (err) {
    alert('Ombor xatoligi yoki cheklangan ruxsat.');
  }
};

const submitSupply = async () => {
  try {
    const cost = Number(supplyForm.value.costPrice);
    const qty = Number(supplyForm.value.quantity);
    const totalCost = cost * qty;

    await axios.post('/api/partners/supply', {
      partnerId: supplyForm.value.partnerId,
      productName: supplyForm.value.productName,
      price: supplyForm.value.price || (cost * 1.5),
      costPrice: cost,
      quantity: qty,
      type: supplyForm.value.type || 'sale'
    }, getAuthHeaders());

    alert('Yuk muvaffaqiyatli qabul qilindi!');
    
    // Add to daily expenses and net profit
    financeMetrics.value.totalExpenses += totalCost;
    
    supplyForm.value = { partnerId: '', productName: '', price: '', costPrice: '', quantity: '', type: 'sale' };
    fetchStaffAndPartners();
  } catch (err) {
    console.error(err);
    alert('Yuk qabul qilishda xatolik.');
  }
};

// Quick Role Switcher for Demo Variant
const changeRole = (newRole) => {
  if (!user.value) return;
  user.value.role = newRole;
  
  if (newRole === 'super_admin') user.value.name = 'Tizim Super Admini';
  else if (newRole === 'manager') user.value.name = 'Menejer (Operator)';
  else if (newRole === 'cashier') user.value.name = 'Bosh Kassir';
  else if (newRole === 'barman') user.value.name = 'Barman (Kafe)';

  localStorage.setItem('sauna_user', JSON.stringify(user.value));
  
  if (newRole === 'cashier') {
    activeTab.value = 'rooms';
  } else if (newRole === 'barman') {
    activeTab.value = 'warehouse';
  } else {
    activeTab.value = 'dashboard_home';
  }
};

// Logout helper
const logout = () => {
  localStorage.removeItem('sauna_token');
  localStorage.removeItem('sauna_user');
  window.location.href = 'http://localhost:5173';
};
</script>

<style scoped>
.bg-scanline {
  background: linear-gradient(
    rgba(18, 16, 16, 0) 50%, 
    rgba(0, 0, 0, 0.2) 50%
  );
  background-size: 100% 4px;
}
</style>
