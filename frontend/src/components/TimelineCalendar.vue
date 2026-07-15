<template>
  <div class="space-y-6">
    <!-- Header Controls -->
    <div class="flex justify-between items-center bg-white p-4 border border-zinc-100 rounded-2xl shadow-sm">
      <div>
        <h2 class="text-xl font-bold tracking-tight text-zinc-950">{{ t('rooms_title') }}</h2>
        <p class="text-sm text-zinc-500">{{ t('rooms_desc') }}</p>
      </div>
      <div class="flex space-x-2">
        <button 
          v-if="userRole === 'super_admin' || userRole === 'manager'"
          @click="openAddRoomModal" 
          type="button"
          class="bg-[#c5a059] hover:bg-[#b08d4a] text-white text-xs font-bold px-4 py-2 rounded-xl transition active:scale-95 flex items-center"
        >
          ➕ Yangi xona qo'shish
        </button>
        <button 
          @click="fetchActiveData" 
          type="button"
          class="bg-zinc-900 text-white text-sm px-4 py-2 rounded-xl flex items-center hover:bg-zinc-800 transition active:scale-95"
        >
          <span class="mr-1.5">&#8635;</span> {{ t('refresh') }}
        </button>
      </div>
    </div>

    <!-- Room Type Segment Selector, View Mode & Status Legend -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 border border-zinc-100 rounded-2xl shadow-sm">
      <!-- Left side: Type toggles -->
      <div class="flex space-x-1 bg-zinc-100 p-1 rounded-xl">
        <button 
          v-for="tType in ['all', 'hamom', 'sauna', 'locker']" 
          :key="tType"
          @click="selectedRoomType = tType"
          :class="[
            'px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 active:scale-95',
            selectedRoomType === tType 
              ? 'bg-white text-zinc-950 shadow-sm' 
              : 'text-zinc-500 hover:text-zinc-800'
          ]"
        >
          {{ tType === 'all' ? 'Barcha xonalar' : tType === 'hamom' ? 'Hammom' : tType === 'sauna' ? 'Sauna' : 'Kiyim almashtirish' }}
        </button>
      </div>

      <!-- Middle: View mode toggles -->
      <div class="flex space-x-1 bg-zinc-100 p-1 rounded-xl">
        <button 
          @click="viewMode = 'map'"
          :class="[
            'px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-150 active:scale-95',
            viewMode === 'map' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
          ]"
        >
          📍 Bino Xaritasi (Map)
        </button>
        <button 
          @click="viewMode = 'grid'"
          :class="[
            'px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-150 active:scale-95',
            viewMode === 'grid' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
          ]"
        >
          📋 Ro'yxat ko'rinishi
        </button>
      </div>

      <!-- Right side: Legend -->
      <div class="flex flex-wrap gap-4 text-xs font-medium text-zinc-600">
        <div class="flex items-center"><span class="w-3.5 h-3.5 rounded-full bg-emerald-500 mr-2"></span> {{ t('status_free') }}</div>
        <div class="flex items-center"><span class="w-3.5 h-3.5 rounded-full bg-red-500 mr-2"></span> {{ t('status_active') }}</div>
        <div class="flex items-center"><span class="w-3.5 h-3.5 rounded-full bg-amber-500 mr-2"></span> {{ t('status_warning') }}</div>
        <div class="flex items-center"><span class="w-3.5 h-3.5 rounded-full bg-blue-500 mr-2"></span> {{ t('status_cleaning') }}</div>
      </div>
    </div>

    <!-- VIEW MODE 1: ARCHITECTURE MAP (BLUEPRINT) -->
    <div v-if="viewMode === 'map'" class="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-3xl p-6 border-2 border-zinc-200/80 dark:border-[#c5a059] shadow-sm dark:shadow-xl relative overflow-hidden">
      <!-- Blueprint grid background pattern -->
      <div class="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div class="relative z-10 space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-sm font-bold uppercase tracking-wider text-[#c5a059]">{{ t('rooms_title') }}</h3>
            <p class="text-[11px] text-zinc-500 dark:text-zinc-400">Xonalarni to'g'ridan-to'g'ri xarita orqali boshqarish. Bandlik holatini ranglar ko'rsatib turadi.</p>
          </div>
          <span class="text-[10px] font-bold bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/30 px-2.5 py-1 rounded-lg">BINO 1-QAVAT</span>
        </div>

        <!-- 3x3 Blueprint Layout Grid -->
        <div class="grid grid-cols-3 gap-6 h-96 max-w-4xl mx-auto border-2 border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/40">
             <!-- LEFT WING: HAMMOM ZONE -->
          <div 
            :class="[
              'col-span-1 flex flex-col h-full border-r border-zinc-200 dark:border-zinc-800/80 pr-4 transition-all duration-300',
              selectedRoomType === 'sauna' ? 'opacity-20 pointer-events-none scale-95' : ''
            ]"
          >
            <span class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">🚿 HAMMOM ZONASI</span>
            
            <div class="flex-1 flex flex-col justify-start space-y-3 overflow-y-auto pr-1 max-h-[300px]">
              <button 
                v-for="room in roomsList.filter(r => r.type === 'hamom')"
                :key="room.id"
                @click="handleMapRoomClick(room)"
                type="button"
                :class="[
                  'flex-shrink-0 flex flex-col justify-between p-3 rounded-xl border transition-all duration-200 text-left hover:scale-[1.02] shadow-sm min-h-[115px]',
                  getRoomMapClass(room)
                ]"
              >
                <div>
                  <div class="flex justify-between items-start">
                    <span class="text-xs font-bold text-zinc-800 dark:text-zinc-100">{{ room.name }}</span>
                    <span class="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-zinc-200/50 dark:bg-black/45 text-zinc-700 dark:text-zinc-300">{{ room.status }}</span>
                  </div>
                  <div class="mt-1 flex justify-between items-center text-[9px] text-zinc-400">
                    <span>{{ room.pricePerHour.toLocaleString() }} UZS</span>
                    <span v-if="getRoomReservations(room.id).length > 0" class="text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/20 px-1 py-0.5 rounded">
                      📅 {{ getRoomReservations(room.id).length }}
                    </span>
                  </div>
                  <div v-if="room.activeSession" class="text-[9px] text-rose-600 font-bold mt-1 animate-pulse">
                    ⏱️ {{ room.activeSession.elapsedMinutes }} daq band
                  </div>
                </div>

                <!-- Map Action Buttons -->
                <div class="mt-2 pt-2 border-t border-zinc-200/40 dark:border-zinc-800/40 flex space-x-1.5 w-full">
                  <span 
                    @click.stop="openReservationModal(room)"
                    class="flex-1 bg-white hover:bg-zinc-50 border border-zinc-200 text-[8px] font-bold py-1 px-1.5 rounded-lg text-center cursor-pointer transition text-zinc-700"
                  >
                    📅 Band qilish
                  </span>
                  <span 
                    v-if="getRoomReservations(room.id).length > 0"
                    @click.stop="openQueueListModal(room)"
                    class="bg-amber-50 hover:bg-amber-100 border border-amber-250 text-[8px] font-bold py-1 px-1.5 rounded-lg text-center cursor-pointer transition text-amber-800"
                  >
                    📋 Navbat
                  </span>
                </div>
              </button>
            </div>
          </div>

          <!-- MIDDLE WING: LOBBY, CORRIDOR & LOCKERS -->
          <div 
            :class="[
              'col-span-1 flex flex-col h-full transition-all duration-300 px-2 space-y-3',
              (selectedRoomType === 'sauna' || selectedRoomType === 'hamom') ? 'opacity-20 pointer-events-none scale-95' : ''
            ]"
          >
            <span class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3 text-center">👕 KIYIM ALMASHTIRISH</span>
            
            <div class="flex-1 flex flex-col justify-start space-y-3 overflow-y-auto max-h-[300px] pr-1">
              <button 
                v-for="room in roomsList.filter(r => r.type === 'locker')"
                :key="room.id"
                @click="handleMapRoomClick(room)"
                type="button"
                :class="[
                  'flex-shrink-0 flex flex-col justify-between p-3 rounded-xl border transition-all duration-200 text-left hover:scale-[1.02] shadow-sm min-h-[115px]',
                  getRoomMapClass(room)
                ]"
              >
                <div>
                  <div class="flex justify-between items-start">
                    <span class="text-xs font-bold text-zinc-800 dark:text-zinc-100">{{ room.name }}</span>
                    <span class="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-zinc-200/50 dark:bg-black/45 text-zinc-700 dark:text-zinc-300">{{ room.status }}</span>
                  </div>
                  <div class="mt-1 flex justify-between items-center text-[9px] text-zinc-400">
                    <span>{{ room.pricePerHour.toLocaleString() }} UZS</span>
                  </div>
                  <div v-if="room.activeSession" class="text-[9px] text-rose-600 font-bold mt-1 animate-pulse">
                    ⏱️ {{ room.activeSession.elapsedMinutes }} daq band
                  </div>
                </div>

                <!-- Map Action Buttons -->
                <div class="mt-2 pt-2 border-t border-zinc-200/40 dark:border-zinc-800/40 flex w-full">
                  <span class="w-full text-center text-[8px] text-zinc-400 font-bold py-1 bg-zinc-50 rounded-lg">Kiyim almashtirish</span>
                </div>
              </button>

              <!-- Reception / Lobby Fallback Info -->
              <div v-if="roomsList.filter(r => r.type === 'locker').length === 0" class="bg-zinc-100/50 dark:bg-zinc-800/20 border border-zinc-200 dark:border-zinc-800/60 rounded-xl p-4 text-center space-y-2 flex flex-col justify-center items-center py-8 shadow-sm">
                <span class="text-xl">🛋️</span>
                <span class="text-xs font-bold tracking-tight text-zinc-700 dark:text-zinc-400">Kutish Zali & Resepsiyon</span>
                <span class="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-wider font-semibold">RFID Tizimi</span>
              </div>
            </div>
          </div>

          <!-- RIGHT WING: SAUNA ZONE -->
          <div 
            :class="[
              'col-span-1 flex flex-col h-full border-l border-zinc-200 dark:border-zinc-800/80 pl-4 transition-all duration-300',
              selectedRoomType === 'hamom' ? 'opacity-20 pointer-events-none scale-95' : ''
            ]"
          >
            <span class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3 text-right">🔥 SAUNA ZONASI</span>
            
            <div class="flex-1 flex flex-col justify-start space-y-3 overflow-y-auto pl-1 max-h-[300px]">
              <button 
                v-for="room in roomsList.filter(r => r.type === 'sauna')"
                :key="room.id"
                @click="handleMapRoomClick(room)"
                type="button"
                :class="[
                  'flex-shrink-0 flex flex-col justify-between p-3 rounded-xl border transition-all duration-200 text-left hover:scale-[1.02] shadow-sm min-h-[115px]',
                  getRoomMapClass(room)
                ]"
              >
                <div>
                  <div class="flex justify-between items-start">
                    <span class="text-xs font-bold text-zinc-800 dark:text-zinc-100">{{ room.name }}</span>
                    <span class="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-zinc-200/50 dark:bg-black/45 text-zinc-700 dark:text-zinc-300">{{ room.status }}</span>
                  </div>
                  <div class="mt-1 flex justify-between items-center text-[9px] text-zinc-400">
                    <span>{{ room.pricePerHour.toLocaleString() }} UZS</span>
                    <span v-if="getRoomReservations(room.id).length > 0" class="text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/20 px-1 py-0.5 rounded">
                      📅 {{ getRoomReservations(room.id).length }}
                    </span>
                  </div>
                  <div v-if="room.activeSession" class="text-[9px] text-rose-600 font-bold mt-1 animate-pulse">
                    ⏱️ {{ room.activeSession.elapsedMinutes }} daq band
                  </div>
                </div>

                <!-- Map Action Buttons -->
                <div class="mt-2 pt-2 border-t border-zinc-200/40 dark:border-zinc-800/40 flex space-x-1.5 w-full">
                  <span 
                    @click.stop="openReservationModal(room)"
                    class="flex-1 bg-white hover:bg-zinc-50 border border-zinc-200 text-[8px] font-bold py-1 px-1.5 rounded-lg text-center cursor-pointer transition text-zinc-700"
                  >
                    📅 Band qilish
                  </span>
                  <span 
                    v-if="getRoomReservations(room.id).length > 0"
                    @click.stop="openQueueListModal(room)"
                    class="bg-amber-50 hover:bg-amber-100 border border-amber-250 text-[8px] font-bold py-1 px-1.5 rounded-lg text-center cursor-pointer transition text-amber-800"
                  >
                    📋 Navbat
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- VIEW MODE 2: RO'YXAT (GRID OF CARDS) -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div 
        v-for="room in filteredRooms" 
        :key="room.id"
        class="bg-white border border-zinc-200/60 shadow-sm rounded-2xl p-6 transition hover:shadow-md relative overflow-hidden flex flex-col justify-between"
      >
        <!-- Status indicator bar -->
        <div :class="[
          'absolute top-0 left-0 right-0 h-1.5',
          room.status === 'free' ? 'bg-emerald-500' : '',
          room.status === 'active' ? 'bg-red-500' : '',
          room.status === 'warning' ? 'bg-amber-500' : '',
          room.status === 'cleaning' ? 'bg-blue-500' : ''
        ]"></div>

        <div>
          <!-- Type Badge -->
          <div class="flex justify-between items-center mb-3 mt-1">
            <span class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{{ room.type }}</span>
            <span :class="[
              'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
              room.status === 'free' ? 'bg-emerald-50 text-emerald-700' : '',
              room.status === 'active' ? 'bg-red-50 text-red-700' : '',
              room.status === 'warning' ? 'bg-amber-50 text-amber-700' : '',
              room.status === 'cleaning' ? 'bg-blue-50 text-blue-700' : ''
            ]">
              {{ t(`status_${room.status}`) }}
            </span>
          </div>

          <h3 class="text-lg font-bold text-zinc-900 mb-1">{{ room.name }}</h3>
          <p class="text-xs text-zinc-400 mb-4">{{ room.pricePerHour.toLocaleString() }} UZS / {{ t('hour') }}</p>

          <!-- Active Session Info -->
          <div v-if="room.activeSession" class="bg-zinc-50 border border-zinc-100 rounded-xl p-3 mb-6 text-xs space-y-1.5 text-zinc-600">
            <div class="flex justify-between">
              <span class="text-zinc-400">{{ t('wristband') }}:</span>
              <span class="font-medium text-zinc-800">{{ room.activeSession.wristband.nfcUid.split('-').pop() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-zinc-400">{{ t('start_time') }}:</span>
              <span>{{ formatTime(room.activeSession.startTime) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-zinc-400">{{ t('elapsed') }}:</span>
              <span class="font-medium">{{ room.activeSession.elapsedMinutes }} {{ t('minutes') }}</span>
            </div>
            <div class="flex justify-between border-t border-zinc-200/60 pt-1.5 mt-1 text-sm font-semibold text-zinc-800">
              <span>{{ t('current_sum') }}:</span>
              <span>{{ room.activeSession.totalDue.toLocaleString() }} UZS</span>
            </div>
          </div>

          <!-- Active Future Reservations List -->
          <div v-if="getRoomReservations(room.id).length > 0" class="mt-3 bg-amber-50/40 border border-amber-100 rounded-xl p-2.5 text-[10px] space-y-1.5">
            <span class="font-bold text-amber-800 uppercase tracking-wider block">📅 Kelgusi Brondlar (Navbat):</span>
            <div 
              v-for="res in getRoomReservations(room.id)" 
              :key="res.id"
              class="flex justify-between items-center text-zinc-700 bg-white border border-amber-100 p-1.5 rounded-lg"
            >
              <div>
                <span class="font-bold text-zinc-950">{{ res.customerName }}</span>
                <span class="text-zinc-400 block">{{ res.phoneNumber }}</span>
              </div>
              <div class="text-right">
                <span class="font-semibold block text-zinc-800">{{ formatResTime(res.startTime) }} - {{ formatResTime(res.endTime) }} ({{ formatResDate(res.startTime) }})</span>
                <button 
                  @click="cancelReservation(res.id)" 
                  class="text-[8px] text-red-500 font-bold hover:underline"
                  title="Bekor qilish"
                >
                  Bekor qilish
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Room Actions Button -->
        <div class="mt-4 pt-4 border-t border-zinc-100 space-y-2">
          <!-- Check In -->
          <div v-if="room.status === 'free'">
            <button 
              @click="openCheckinModal(room)"
              class="w-full bg-zinc-950 text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-zinc-900 transition active:scale-95"
            >
              {{ t('checkin_btn') }}
            </button>
          </div>

          <!-- Complete Cleaning -->
          <button 
            v-else-if="room.status === 'cleaning'"
            @click="completeCleaningAction(room.id)"
            class="w-full bg-blue-50 text-blue-700 text-xs font-semibold py-2.5 rounded-xl hover:bg-blue-100 transition active:scale-95 border border-blue-200"
          >
            {{ t('cleaning_done_btn') }}
          </button>

          <!-- Active Session Actions -->
          <div v-else class="flex space-x-2">
            <button 
              @click="openCheckoutModal(room.activeSession)"
              class="flex-1 bg-zinc-950 text-white text-[11px] font-semibold py-2.5 rounded-xl hover:bg-zinc-900 transition active:scale-95 text-center"
            >
              {{ t('checkout_btn') }}
            </button>
            <button 
              @click="openTransferModal(room.activeSession)"
              class="bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold py-2.5 px-2.5 rounded-xl hover:bg-amber-100 transition active:scale-95 flex items-center space-x-1"
              title="Mijozni boshqa xonaga ko'chirish"
            >
              <span>🔄</span> <span>Ko'chirish</span>
            </button>
            <button 
              @click="openOrderModal(room.activeSession)"
              class="bg-zinc-100 text-zinc-800 border border-zinc-200 text-[11px] font-semibold py-2.5 px-3 rounded-xl hover:bg-zinc-200 transition active:scale-95"
            >
              + Bar
            </button>
          </div>

          <!-- Advance Booking Action (Always Available, except for lockers) -->
          <button 
            v-if="room.type !== 'locker'"
            @click="openReservationModal(room)"
            class="w-full bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200 text-[10px] font-semibold py-2 rounded-xl transition active:scale-95 flex items-center justify-center space-x-1"
          >
            <span>📅</span>
            <span>Navbat / Oldindan Band qilish</span>
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL: ADVANCE RESERVATION (QUEUE) -->
    <div v-if="reservationModalOpen" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200/80">
        <h3 class="text-xl font-bold text-zinc-950 mb-2">Oldindan Band Qilish: {{ selectedRoom?.name }}</h3>
        <p class="text-sm text-zinc-500 mb-6">Mijoz ma'lumotlarini va u keladigan soatli vaqt oralig'ini kiriting.</p>

        <!-- Existing Bookings for this room in modal -->
        <div v-if="getRoomReservations(selectedRoom?.id).length > 0" class="mb-4 bg-amber-50/70 border border-amber-100 rounded-2xl p-3 text-xs space-y-1.5 text-zinc-700">
          <span class="font-bold text-amber-800 uppercase tracking-wider block text-[10px] mb-1">⚠️ Ushbu xonada band qilingan vaqtlar:</span>
          <div 
            v-for="res in getRoomReservations(selectedRoom?.id)" 
            :key="res.id"
            class="flex justify-between items-center bg-white border border-amber-100/50 p-2 rounded-xl text-left"
          >
            <div>
              <span class="font-bold text-zinc-900 block text-xs">{{ res.customerName }}</span>
              <span class="text-[9px] text-zinc-400 block">{{ res.phoneNumber }}</span>
            </div>
            <span class="font-bold text-zinc-800 text-[10px]">{{ formatResTime(res.startTime) }} - {{ formatResTime(res.endTime) }} ({{ formatResDate(res.startTime) }})</span>
          </div>
        </div>

        <form @submit.prevent="submitReservation" class="space-y-4">
          <!-- Customer Name -->
          <div>
            <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Mijoz Ismi</label>
            <input 
              v-model="reservationForm.customerName" 
              type="text" 
              required
              placeholder="Masalan: Rustam Valiyev"
              class="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
          </div>

          <!-- Phone Number -->
          <div>
            <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Telefon Raqami</label>
            <input 
              v-model="reservationForm.phoneNumber" 
              type="text" 
              required
              placeholder="Masalan: +998901234567"
              class="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
          </div>

          <!-- Date Selection -->
          <div>
            <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Sana (Kun)</label>
            <input 
              v-model="reservationForm.date" 
              type="date" 
              required
              class="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black bg-white"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- Start Time -->
            <div>
              <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Kirish soati</label>
              <input 
                v-model="reservationForm.startTime" 
                type="time" 
                required
                class="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black bg-white"
              />
            </div>

            <!-- End Time -->
            <div>
              <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Chiqish soati</label>
              <input 
                v-model="reservationForm.endTime" 
                type="time" 
                required
                class="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black bg-white"
              />
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex space-x-3 pt-4">
            <button 
              type="button" 
              @click="reservationModalOpen = false"
              class="flex-1 bg-zinc-100 text-zinc-600 font-semibold py-3 rounded-xl hover:bg-zinc-200 transition text-sm active:scale-95"
            >
              {{ t('cancel') }}
            </button>
            <button 
              type="submit"
              class="flex-1 bg-[#c5a059] text-white font-semibold py-3 rounded-xl hover:bg-[#b08d4a] transition text-sm active:scale-95"
            >
              Band Qilish
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL: QUEUE LIST (RESERVATIONS DETAILED) -->
    <div v-if="queueListModalOpen" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200/80">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-zinc-950">📋 Navbatlar ro'yxati</h3>
          <span class="text-xs font-bold bg-[#c5a059]/10 text-[#c5a059] px-2.5 py-1 rounded-lg">{{ selectedRoom?.name }}</span>
        </div>
        <p class="text-xs text-zinc-400 mb-4">Ushbu xonaga kelgusi brondlar va navbatdagi mijozlar ro'yxati</p>

        <div class="space-y-3 max-h-80 overflow-y-auto mb-6 pr-1">
          <div 
            v-for="res in getRoomReservations(selectedRoom?.id)" 
            :key="res.id"
            class="flex justify-between items-center p-3 rounded-xl border border-zinc-200/80 bg-zinc-50/30"
          >
            <div>
              <span class="font-bold text-xs text-zinc-950 block text-left">{{ res.customerName }}</span>
              <span class="text-[10px] text-zinc-400 block text-left">{{ res.phoneNumber }}</span>
              <span class="text-[10px] text-zinc-500 font-semibold mt-1 block text-left">📅 {{ formatResTime(res.startTime) }} - {{ formatResTime(res.endTime) }} ({{ formatResDate(res.startTime) }})</span>
            </div>
            <button 
              @click="cancelReservation(res.id); if (getRoomReservations(selectedRoom?.id).length === 0) queueListModalOpen = false;" 
              class="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-[10px] font-bold px-3 py-1.5 rounded-lg transition active:scale-95"
            >
              Bekor qilish
            </button>
          </div>
        </div>

        <button 
          @click="queueListModalOpen = false"
          class="w-full bg-zinc-950 text-white font-semibold py-3 rounded-xl hover:bg-zinc-900 transition text-sm active:scale-95"
        >
          Yopish
        </button>
      </div>
    </div>
    <!-- MODAL: CHECK-IN CUSTOMER -->
    <div v-if="checkinModalOpen" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200/80">
        <h3 class="text-xl font-bold text-zinc-950 mb-2">{{ t('checkin_title') }}: {{ selectedRoom?.name }}</h3>
        <p class="text-sm text-zinc-500 mb-6">{{ t('checkin_desc') }}</p>

        <form @submit.prevent="submitCheckin" class="space-y-4">
          <!-- RFID Wristband Selection -->
          <div>
            <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">{{ t('select_wristband') }}</label>
            <select 
              v-model="checkinForm.wristbandId" 
              required
              class="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-black"
            >
              <option value="" disabled>{{ t('select_wristband_placeholder') }}</option>
              <option v-for="band in availableWristbands" :key="band.id" :value="band.id">
                {{ band.nfcUid.split('-').pop() }} ({{ band.status }})
              </option>
            </select>
          </div>

          <!-- Customer Name -->
          <div>
            <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Mijoz Ismi</label>
            <input 
              v-model="checkinForm.customerName" 
              type="text" 
              placeholder="Masalan: Rustam Valiyev"
              class="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black bg-white"
            />
          </div>

          <!-- Phone Number -->
          <div>
            <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Telefon Raqami</label>
            <input 
              v-model="checkinForm.phoneNumber" 
              type="text" 
              placeholder="Masalan: +998901234567"
              class="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black bg-white"
            />
          </div>

          <!-- Initial Payment (Deposit) -->
          <div>
            <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">{{ t('initial_payment_label') }} (UZS)</label>
            <input 
              v-model="checkinForm.initialPayment" 
              type="number" 
              required
              min="0"
              class="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
          </div>

          <!-- Booked Hours -->
          <div>
            <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">{{ t('booked_hours_label') }}</label>
            <input 
              v-model="checkinForm.bookedHours" 
              type="number" 
              required
              min="1"
              max="24"
              class="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
          </div>

          <!-- Buttons -->
          <div class="flex space-x-3 pt-4">
            <button 
              type="button" 
              @click="checkinModalOpen = false"
              class="flex-1 bg-zinc-100 text-zinc-600 font-semibold py-3 rounded-xl hover:bg-zinc-200 transition text-sm active:scale-95"
            >
              {{ t('cancel') }}
            </button>
            <button 
              type="submit"
              class="flex-1 bg-black text-white font-semibold py-3 rounded-xl hover:bg-zinc-800 transition text-sm active:scale-95"
            >
              {{ t('submit') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL: ADD BAR ORDER (NFC wristband simulation) -->
    <div v-if="orderModalOpen" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200/80">
        <h3 class="text-xl font-bold text-zinc-950 mb-2">Bar & Buyurtmalar</h3>
        <p class="text-sm text-zinc-500 mb-6">Mijoz bilaguzugiga (RFID: {{ selectedSession?.wristband.nfcUid.split('-').pop() }}) mahsulot yozish</p>

        <form @submit.prevent="submitOrder" class="space-y-4">
          <!-- Product selection -->
          <div>
            <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Mahsulot / Sochiq ijarasi</label>
            <select 
              v-model="orderForm.productId" 
              required
              class="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-black"
            >
              <option value="" disabled>Mahsulotni tanlang</option>
              <option v-for="prod in productsList" :key="prod.id" :value="prod.id">
                {{ prod.name }} ({{ prod.price.toLocaleString() }} UZS) - Zaxira: {{ prod.stockQuantity }} ta
              </option>
            </select>
          </div>

          <!-- Quantity -->
          <div>
            <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Miqdori</label>
            <input 
              v-model="orderForm.quantity" 
              type="number" 
              required
              min="1"
              class="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
          </div>

          <!-- Buttons -->
          <div class="flex space-x-3 pt-4">
            <button 
              type="button" 
              @click="orderModalOpen = false"
              class="flex-1 bg-zinc-100 text-zinc-600 font-semibold py-3 rounded-xl hover:bg-zinc-200 transition text-sm active:scale-95"
            >
              Bekor qilish
            </button>
            <button 
              type="submit"
              class="flex-1 bg-black text-white font-semibold py-3 rounded-xl hover:bg-zinc-800 transition text-sm active:scale-95"
            >
              Buyurtma qo'shish
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL: CHECKOUT & MIXED PAYMENT -->
    <div v-if="checkoutModalOpen" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200/80">
        <h3 class="text-xl font-bold text-zinc-950 mb-2">{{ t('checkout_title') }}</h3>
        <p class="text-sm text-zinc-500 mb-6">{{ t('checkout_desc') }}</p>

        <!-- Final invoice breakdown -->
        <div class="bg-zinc-50 rounded-2xl p-4 mb-6 text-sm space-y-2 border border-zinc-100">
          <div class="flex justify-between text-zinc-600">
            <span>{{ t('room_charge') }}:</span>
            <span class="font-medium text-zinc-950">{{ selectedSession?.roomCharge.toLocaleString() }} UZS</span>
          </div>
          <div class="flex justify-between text-zinc-600">
            <span>{{ t('bar_orders') }}:</span>
            <span class="font-medium text-zinc-950">{{ selectedSession?.ordersTotal.toLocaleString() }} UZS</span>
          </div>
          <div class="flex justify-between border-t border-zinc-200/60 pt-2 text-base font-bold text-zinc-950">
            <span>{{ t('total_charge') }}:</span>
            <span>{{ selectedSession?.totalDue.toLocaleString() }} UZS</span>
          </div>
        </div>

        <!-- Mixed Payment form -->
        <form @submit.prevent="submitCheckout" class="space-y-4">
          <!-- Cash Payment -->
          <div>
            <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">{{ t('cash_payment') }} (UZS)</label>
            <input 
              v-model="checkoutForm.cashAmount" 
              type="number" 
              required
              min="0"
              class="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
          </div>

          <!-- Card Payment -->
          <div>
            <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">{{ t('card_payment') }} (UZS)</label>
            <input 
              v-model="checkoutForm.cardAmount" 
              type="number" 
              required
              min="0"
              class="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
          </div>

          <!-- Payment Difference helper -->
          <div class="text-xs text-center font-medium mt-2">
            <span :class="paymentDiffClass">
              {{ t('payment_input') }}: {{ (Number(checkoutForm.cashAmount) + Number(checkoutForm.cardAmount)).toLocaleString() }} UZS
              ({{ paymentDiffMessage }})
            </span>
          </div>

          <!-- Buttons -->
          <div class="flex space-x-3 pt-4">
            <button 
              type="button" 
              @click="checkoutModalOpen = false"
              class="flex-1 bg-zinc-100 text-zinc-600 font-semibold py-3 rounded-xl hover:bg-zinc-200 transition text-sm active:scale-95"
            >
              {{ t('cancel') }}
            </button>
            <button 
              type="submit"
              :disabled="!isPaymentValid"
              :class="[
                'flex-1 font-semibold py-3 rounded-xl transition text-sm active:scale-95',
                isPaymentValid ? 'bg-black text-white hover:bg-zinc-800' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
              ]"
            >
              {{ t('complete_payment') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL: TRANSFER ROOM -->
    <div v-if="transferModalOpen" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200/80 text-left">
        <h3 class="text-xl font-bold text-zinc-950 mb-2">🔄 Xonani O'zgartirish</h3>
        <p class="text-sm text-zinc-500 mb-6">Mijozni boshqa bo'sh xonaga ko'chiring. Soatlik narx va vaqt avtomatik ravishda yangilanadi va hisoblanadi.</p>

        <form @submit.prevent="submitTransfer" class="space-y-4">
          <!-- Target Room Selection -->
          <div>
            <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Bo'sh xonalardan birini tanlang</label>
            <select 
              v-model="transferForm.targetRoomId" 
              required
              class="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-black font-semibold"
            >
              <option value="" disabled>Xonani tanlang</option>
              <option v-for="r in freeRooms" :key="r.id" :value="r.id">
                {{ r.name }} ({{ r.type === 'hamom' ? 'Hammom' : 'Sauna' }} - {{ r.pricePerHour.toLocaleString() }} UZS/soat)
              </option>
            </select>
          </div>

          <!-- Buttons -->
          <div class="flex space-x-3 pt-4">
            <button 
              type="button" 
              @click="transferModalOpen = false"
              class="flex-1 bg-zinc-100 text-zinc-600 font-semibold py-3 rounded-xl hover:bg-zinc-200 transition text-sm active:scale-95"
            >
              Bekor qilish
            </button>
            <button 
              type="submit"
              class="flex-1 bg-[#c5a059] text-white font-semibold py-3 rounded-xl hover:bg-[#b08e4f] transition text-sm active:scale-95"
            >
              Ko'chirishni Tasdiqlash
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL: ADD NEW ROOM -->
    <div v-if="addRoomModalOpen" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200/80">
        <h3 class="text-xl font-bold text-zinc-950 mb-2">Yangi xona qo'shish</h3>
        <p class="text-sm text-zinc-500 mb-6">Tizimga yangi Hammom xonasi yoki Sauna xonasi/kabinasi qo'shish</p>

        <form @submit.prevent="submitAddRoom" class="space-y-4">
          <!-- Room Name -->
          <div>
            <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Xona nomi</label>
            <input 
              v-model="addRoomForm.name" 
              type="text" 
              required
              placeholder="Masalan: VIP Sauna #5"
              class="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
          </div>

          <!-- Room Type -->
          <div>
            <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Xona turi</label>
            <select 
              v-model="addRoomForm.type" 
              required
              class="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-black"
            >
              <option value="hamom">Hammom</option>
              <option value="sauna">Sauna</option>
              <option value="locker">Kiyim almashtirish xonasi</option>
            </select>
          </div>

          <!-- Price per hour -->
          <div>
            <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Soatlik narxi (UZS)</label>
            <input 
              v-model="addRoomForm.pricePerHour" 
              type="number" 
              required
              min="1000"
              placeholder="Masalan: 100000"
              class="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
          </div>

          <!-- Buttons -->
          <div class="flex space-x-3 pt-4">
            <button 
              type="button" 
              @click="addRoomModalOpen = false"
              class="flex-1 bg-zinc-100 text-zinc-600 font-semibold py-3 rounded-xl hover:bg-zinc-200 transition text-sm active:scale-95"
            >
              Bekor qilish
            </button>
            <button 
              type="submit"
              class="flex-1 bg-black text-white font-semibold py-3 rounded-xl hover:bg-zinc-800 transition text-sm active:scale-95"
            >
              Qo'shish
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';

const currentLang = ref(localStorage.getItem('sauna_lang') || 'uz');

// Localizations
const translations = {
  uz: {
    rooms_title: "Xonalar holati va Bandlik",
    rooms_desc: "Xonalar bandligi, turlari va vaqtini rejalashtirish jadvali",
    refresh: "Yangilash",
    status_free: "Bo'sh (Yashil)",
    status_active: "Band (Qizil)",
    status_warning: "Vaqt yakunlanmoqda (Sariq)",
    status_cleaning: "Tozalanyapti (Ko'k)",
    hour: "soat",
    minutes: "daq",
    wristband: "RFID bilaguzuk",
    start_time: "Kirgan vaqti",
    elapsed: "O'tgan vaqt",
    current_sum: "Joriy summa",
    checkin_btn: "Mijozni kiritish",
    cleaning_done_btn: "Tozalashni yakunlash",
    checkout_btn: "Chiqish / To'lov",
    checkin_title: "Mijozni ro'yxatga olish",
    checkin_desc: "Mijozga yangi RFID bilaguzuk, kirish depoziti va rejalashtirilgan vaqtni kiriting.",
    select_wristband: "RFID Bilaguzuk tanlang",
    select_wristband_placeholder: "Faol bilaguzukni tanlang",
    initial_payment_label: "Boshlang'ich To'lov / Depozit",
    booked_hours_label: "Rejalashtirilgan band qilish vaqti (soatda)",
    room_charge: "Xona ijarasi hisobi",
    bar_orders: "Bar va boshqa buyurtmalar",
    total_charge: "Jami to'lov",
    cash_payment: "Naqd pul to'lovi",
    card_payment: "Karta / Elektron to'lov",
    payment_input: "Kiritilgan summa",
    complete_payment: "To'lovni tasdiqlash",
    checkout_desc: "Chiqish to'lovini naqd va karta aralash shaklda amalga oshirishingiz mumkin.",
    checkout_title: "Hisobni yopish va To'lash",
    cancel: "Bekor qilish",
    submit: "Saqlash",
    status_completed: "To'lov tasdiqlandi"
  },
  ru: {
    rooms_title: "Состояние и занятость комнат",
    rooms_desc: "Таблица планирования занятости, типов и времени комнат",
    refresh: "Обновить",
    status_free: "Свободно (Зеленый)",
    status_active: "Занято (Красный)",
    status_warning: "Время истекает (Желтый)",
    status_cleaning: "Уборка (Синий)",
    hour: "час",
    minutes: "мин",
    wristband: "RFID браслет",
    start_time: "Время входа",
    elapsed: "Прошло времени",
    current_sum: "Текущая сумма",
    checkin_btn: "Регистрация гостя",
    cleaning_done_btn: "Уборка завершена",
    checkout_btn: "Выезд / Оплата",
    checkin_title: "Регистрация нового гостя",
    checkin_desc: "Назначьте новый RFID браслет, укажите начальный депозит и планируемое время пребывания.",
    select_wristband: "Выберите RFID браслет",
    select_wristband_placeholder: "Выберите свободный браслет",
    initial_payment_label: "Начальный платеж / Депозит",
    booked_hours_label: "Запланированное время аренды (в часах)",
    room_charge: "Стоимость аренды комнаты",
    bar_orders: "Бар и другие заказы",
    total_charge: "Итого к оплате",
    cash_payment: "Оплата наличными",
    card_payment: "Оплата картой",
    payment_input: "Введенная сумма",
    complete_payment: "Подтвердить оплату",
    checkout_desc: "Вы можете закрыть счет наличными и картой в смешанном виде.",
    checkout_title: "Закрытие счета и оплата",
    cancel: "Отмена",
    submit: "Сохранить",
    status_completed: "Оплата подтверждена"
  },
  en: {
    rooms_title: "Rooms Status & Booking",
    rooms_desc: "Rooms booking status, types and timeline scheduler",
    refresh: "Refresh",
    status_free: "Vacant (Green)",
    status_active: "Occupied (Red)",
    status_warning: "Time ending (Yellow)",
    status_cleaning: "Cleaning (Blue)",
    hour: "hour",
    minutes: "min",
    wristband: "RFID Wristband",
    start_time: "Check-in Time",
    elapsed: "Elapsed Time",
    current_sum: "Current Total",
    checkin_btn: "Check In Guest",
    cleaning_done_btn: "Complete Cleaning",
    checkout_btn: "Check out / Pay",
    checkin_title: "Guest Registration",
    checkin_desc: "Assign a new RFID wristband, enter initial deposit and planned duration.",
    select_wristband: "Select RFID Wristband",
    select_wristband_placeholder: "Choose an active wristband",
    initial_payment_label: "Initial Payment / Deposit",
    booked_hours_label: "Planned duration (in hours)",
    room_charge: "Room charge",
    bar_orders: "Bar & other orders",
    total_charge: "Total charge",
    cash_payment: "Cash payment",
    card_payment: "Card / Electronic payment",
    payment_input: "Amount entered",
    complete_payment: "Confirm Payment",
    checkout_desc: "You can close the bill with a mix of cash and card payments.",
    checkout_title: "Close Account & Pay",
    cancel: "Cancel",
    submit: "Save",
    status_completed: "Payment confirmed"
  },
  tr: {
    rooms_title: "Odalar Durumu ve Rezervasyon",
    rooms_desc: "Odaların rezervasyon durumu, tipleri ve zaman çizelgesi planlayıcısı",
    refresh: "Yenile",
    status_free: "Boş (Yeşil)",
    status_active: "Dolu (Kırmızı)",
    status_warning: "Süre bitiyor (Sarı)",
    status_cleaning: "Temizleniyor (Mavi)",
    hour: "saat",
    minutes: "dk",
    wristband: "RFID Bileklik",
    start_time: "Giriş Saati",
    elapsed: "Geçen Süre",
    current_sum: "Güncel Tutar",
    checkin_btn: "Müşteri Girişi",
    cleaning_done_btn: "Temizliği Tamamla",
    checkout_btn: "Çıkış / Ödeme",
    checkin_title: "Müşteri Kaydı",
    checkin_desc: "Yeni bir RFID bileklik atayın, giriş depozitosunu ve planlanan süreyi girin.",
    select_wristband: "RFID Bileklik Seçin",
    select_wristband_placeholder: "Aktif bir bileklik seçin",
    initial_payment_label: "Başlangıç Ödemesi / Depozito",
    booked_hours_label: "Planlanan kalış süresi (saat olarak)",
    room_charge: "Oda ücreti",
    bar_orders: "Bar ve diğer siparişler",
    total_charge: "Toplam borç",
    cash_payment: "Nakit ödeme",
    card_payment: "Kart / Elektronik ödeme",
    payment_input: "Girilen tutar",
    complete_payment: "Ödemeyi Onayla",
    checkout_desc: "Hesabı nakit ve kart karışık ödeme şeklinde kapatabilirsiniz.",
    checkout_title: "Hesap Kapatma ve Ödeme",
    cancel: "İptal",
    submit: "Kaydet",
    status_completed: "Ödeme onaylandı"
  }
};

const t = (key) => {
  return translations[currentLang.value]?.[key] || translations['uz'][key] || key;
};

// Props
const props = defineProps({
  type: {
    type: String,
    default: 'all'
  }
});

// Data States
const roomsList = ref([]);
const availableWristbands = ref([]);
const productsList = ref([]);

const selectedRoomType = ref(props.type || 'all');
const viewMode = ref('map');

watch(() => props.type, (newVal) => {
  selectedRoomType.value = newVal || 'all';
});

const filteredRooms = computed(() => {
  if (selectedRoomType.value === 'all') return roomsList.value;
  return roomsList.value.filter(room => room.type === selectedRoomType.value);
});

const getRoomById = (id) => {
  return roomsList.value.find(r => r.id === id);
};

const getRoomMapClass = (room) => {
  if (!room) return 'bg-zinc-50 dark:bg-zinc-850 text-zinc-400 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-700/50';
  if (room.status === 'free') {
    return 'bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:border-emerald-350 dark:hover:border-emerald-500/50';
  }
  if (room.status === 'active') {
    return 'bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-250 dark:border-rose-500/30 hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:border-rose-350 dark:hover:border-rose-500/50';
  }
  if (room.status === 'warning') {
    return 'bg-amber-50/70 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-250 dark:border-amber-500/30 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:border-amber-350 dark:hover:border-amber-500/50';
  }
  if (room.status === 'cleaning') {
    return 'bg-blue-50/70 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-250 dark:border-blue-500/30 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-350 dark:hover:border-blue-500/50';
  }
  return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700';
};

const handleMapRoomClick = (room) => {
  if (!room) return;
  if (room.status === 'free') {
    openCheckinModal(room);
  } else if (room.status === 'cleaning') {
    completeCleaningAction(room.id);
  } else {
    openCheckoutModal(room.activeSession);
  }
};

// Modals toggles
const checkinModalOpen = ref(false);
const orderModalOpen = ref(false);
const checkoutModalOpen = ref(false);
const addRoomModalOpen = ref(false);
const transferModalOpen = ref(false);

const transferForm = ref({
  sessionId: null,
  targetRoomId: ''
});

const freeRooms = computed(() => {
  return roomsList.value.filter(r => r.status === 'free');
});

const openTransferModal = (session) => {
  transferForm.value = {
    sessionId: session.id,
    targetRoomId: ''
  };
  transferModalOpen.value = true;
};

const submitTransfer = async () => {
  try {
    const response = await axios.post('/api/sessions/transfer', {
      sessionId: Number(transferForm.value.sessionId),
      targetRoomId: Number(transferForm.value.targetRoomId)
    }, getAuthHeaders());
    
    if (response.data.success) {
      alert('Mijoz yangi xonaga muvaffaqiyatli ko\'chirildi!');
      transferModalOpen.value = false;
      await fetchActiveData();
    }
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || 'Xonani ko\'chirishda xatolik yuz berdi.');
  }
};

const selectedRoom = ref(null);
const selectedSession = ref(null);

const addRoomForm = ref({
  name: '',
  type: 'hamom',
  pricePerHour: ''
});

const openAddRoomModal = () => {
  addRoomForm.value = { name: '', type: 'hamom', pricePerHour: '' };
  addRoomModalOpen.value = true;
};

const submitAddRoom = async () => {
  try {
    await axios.post('/api/rooms/add', {
      name: addRoomForm.value.name,
      type: addRoomForm.value.type,
      pricePerHour: Number(addRoomForm.value.pricePerHour)
    }, getAuthHeaders());

    alert('Yangi xona muvaffaqiyatli qo\'shildi!');
    addRoomModalOpen.value = false;
    await fetchActiveData();
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || 'Xonani qo\'shishda xatolik yuz berdi. Ruxsatingiz borligini tekshiring.');
  }
};

// Forms
const checkinForm = ref({
  wristbandId: '',
  initialPayment: 0,
  bookedHours: 2
});

const orderForm = ref({
  productId: '',
  quantity: 1
});

const checkoutForm = ref({
  cashAmount: 0,
  cardAmount: 0
});

// Setup auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('sauna_token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

const fetchActiveData = async () => {
  try {
    // 1. Fetch Rooms setup
    const roomsRes = await axios.get('/api/sessions/active', getAuthHeaders());
    const activeSessions = roomsRes.data.data;

    // Fetch all rooms from DB
    let dbRooms = [];
    try {
      const roomsListRes = await axios.get('/api/rooms', getAuthHeaders());
      dbRooms = roomsListRes.data.data || [];
    } catch (e) {
      console.warn("Could not fetch rooms from DB, using mock fallback", e);
    }

    if (dbRooms.length === 0) {
      dbRooms = [
        { id: 1, name: 'Oddiy Hammom #1', type: 'hamom', pricePerHour: 50000, status: 'free' },
        { id: 2, name: 'VIP Hammom #2', type: 'hamom', pricePerHour: 80000, status: 'free' },
        { id: 3, name: 'Fin Saunasi #3', type: 'sauna', pricePerHour: 100000, status: 'free' },
        { id: 4, name: 'Turk Saunasi #4', type: 'sauna', pricePerHour: 120000, status: 'free' },
        { id: 5, name: 'Kiyim almashtirish xonasi #1', type: 'locker', pricePerHour: 10000, status: 'free' }
      ];
    }

    roomsList.value = dbRooms.map(room => {
      const activeSession = activeSessions.find(s => s.roomId === room.id);
      let status = room.status || 'free';
      if (activeSession) {
        status = activeSession.warningActive ? 'warning' : 'active';
      }
      return {
        ...room,
        status: activeSession ? status : room.status || 'free',
        activeSession: activeSession || null
      };
    });

    // 2. Fetch free Wristbands
    // For simplicity, generate mockup or fetch DB
    availableWristbands.value = [
      { id: 1, nfcUid: 'RFID-RC522-BAND-001', status: 'free' },
      { id: 2, nfcUid: 'RFID-RC522-BAND-002', status: 'free' },
      { id: 3, nfcUid: 'RFID-RC522-BAND-003', status: 'free' }
    ].filter(w => !activeSessions.some(s => s.wristbandId === w.id));

    // 3. Fetch products list
    productsList.value = [
      { id: 1, name: 'Coca Cola 0.5L', price: 15000, stockQuantity: 150, type: 'sale' },
      { id: 2, name: 'Meva Sharbatlari', price: 20000, stockQuantity: 80, type: 'sale' },
      { id: 3, name: 'Sochiq Ijarasi (Towel)', price: 10000, stockQuantity: 40, type: 'rent' },
      { id: 4, name: 'Maxsus Sovun (Soap)', price: 5000, stockQuantity: 200, type: 'sale' }
    ];

    // 4. Fetch Reservations list
    fetchReservations();

  } catch (err) {
    console.error('Fetch error:', err);
  }
};

const userRole = ref('');

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('sauna_user') || '{}');
  userRole.value = user.role || '';
  fetchActiveData();
  // Poll data every 30 seconds
  setInterval(fetchActiveData, 30000);
});

// Modals methods
const openCheckinModal = (room) => {
  selectedRoom.value = room;
  checkinForm.value = { 
    wristbandId: '', 
    initialPayment: 0, 
    bookedHours: 2,
    customerName: '',
    phoneNumber: ''
  };
  checkinModalOpen.value = true;
};

const openOrderModal = (session) => {
  selectedSession.value = session;
  orderForm.value = { productId: '', quantity: 1 };
  orderModalOpen.value = true;
};

const openCheckoutModal = (session) => {
  selectedSession.value = session;
  checkoutForm.value = { cashAmount: session.totalDue, cardAmount: 0 };
  checkoutModalOpen.value = true;
};

// Reservations (Queue) Booking States and API calls
const reservationsList = ref([]);
const reservationModalOpen = ref(false);
const queueListModalOpen = ref(false);
const reservationForm = ref({ customerName: '', phoneNumber: '', startTime: '', endTime: '' });

const openQueueListModal = (room) => {
  selectedRoom.value = room;
  queueListModalOpen.value = true;
};

const fetchReservations = async () => {
  try {
    const response = await axios.get('/api/reservations', getAuthHeaders());
    if (response.data.success) {
      reservationsList.value = response.data.data;
    }
  } catch (error) {
    console.error('Fetch Reservations Error:', error);
  }
};

const getRoomReservations = (roomId) => {
  return reservationsList.value.filter(res => res.roomId === roomId && res.status === 'pending');
};

const formatResTime = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatResDate = (dateStr) => {
  const d = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  
  if (d.toDateString() === today.toDateString()) {
    return 'Bugun';
  } else if (d.toDateString() === tomorrow.toDateString()) {
    return 'Ertaga';
  } else {
    const monthStr = d.toLocaleDateString([], { month: 'short' });
    const dayVal = d.getDate();
    return `${dayVal}-${monthStr}`;
  }
};

const openReservationModal = (room) => {
  selectedRoom.value = room;
  const now = new Date();
  
  // Date in YYYY-MM-DD
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  
  // Times
  const startHour = String((now.getHours() + 1) % 24).padStart(2, '0');
  const endHour = String((now.getHours() + 3) % 24).padStart(2, '0');
  
  reservationForm.value = { 
    customerName: '', 
    phoneNumber: '', 
    date: dateStr,
    startTime: `${startHour}:00`, 
    endTime: `${endHour}:00` 
  };
  reservationModalOpen.value = true;
};

const submitReservation = async () => {
  try {
    const datePart = reservationForm.value.date;
    const startPart = reservationForm.value.startTime;
    const endPart = reservationForm.value.endTime;

    const start = new Date(`${datePart}T${startPart}:00`);
    let end = new Date(`${datePart}T${endPart}:00`);
    
    // Handle overnight bookings
    if (endPart < startPart) {
      end.setDate(end.getDate() + 1);
    }

    const response = await axios.post('/api/reservations', {
      roomId: selectedRoom.value.id,
      customerName: reservationForm.value.customerName,
      phoneNumber: reservationForm.value.phoneNumber,
      startTime: start.toISOString(),
      endTime: end.toISOString()
    }, getAuthHeaders());
    
    if (response.data.success) {
      alert('Navbat (bron) muvaffaqiyatli saqlandi!');
      reservationModalOpen.value = false;
      fetchReservations();
    }
  } catch (error) {
    console.error('Create Reservation Error:', error);
    alert(error.response?.data?.message || 'Navbat kiritishda xatolik yuz berdi.');
  }
};

const cancelReservation = async (id) => {
  if (!confirm('Ushbu band qilish navbatini bekor qilmoqchimisiz?')) return;
  try {
    const response = await axios.post(`/api/reservations/${id}/status`, {
      status: 'cancelled'
    }, getAuthHeaders());
    if (response.data.success) {
      alert('Bron bekor qilindi.');
      fetchReservations();
    }
  } catch (error) {
    console.error('Cancel Reservation Error:', error);
    alert('Bron bekor qilishda xatolik yuz berdi.');
  }
};

// Submits
const submitCheckin = async () => {
  try {
    await axios.post('/api/sessions', {
      roomId: selectedRoom.value.id,
      wristbandId: checkinForm.value.wristbandId,
      initialPayment: checkinForm.value.initialPayment,
      bookedHours: checkinForm.value.bookedHours,
      customerName: checkinForm.value.customerName,
      phoneNumber: checkinForm.value.phoneNumber
    }, getAuthHeaders());

    checkinModalOpen.value = false;
    fetchActiveData();
  } catch (err) {
    alert(err.response?.data?.message || 'Checkin error');
  }
};

const submitOrder = async () => {
  try {
    await axios.post('/api/sessions/bar-order', {
      nfcUid: selectedSession.value.wristband.nfcUid,
      productId: orderForm.value.productId,
      quantity: orderForm.value.quantity
    }, getAuthHeaders());

    orderModalOpen.value = false;
    fetchActiveData();
  } catch (err) {
    alert(err.response?.data?.message || 'Order error');
  }
};

const submitCheckout = async () => {
  try {
    await axios.post('/api/sessions/checkout', {
      sessionId: selectedSession.value.id,
      cashAmount: checkoutForm.value.cashAmount,
      cardAmount: checkoutForm.value.cardAmount
    }, getAuthHeaders());

    checkoutModalOpen.value = false;
    fetchActiveData();
  } catch (err) {
    alert(err.response?.data?.message || 'Checkout error');
  }
};

const completeCleaningAction = async (roomId) => {
  try {
    await axios.post('/api/sessions/cleaning/complete', { roomId }, getAuthHeaders());
    fetchActiveData();
  } catch (err) {
    alert('Cleaning status change failed');
  }
};

// Helpers & Computeds
const formatTime = (isoString) => {
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const totalPaidInput = computed(() => {
  return Number(checkoutForm.value.cashAmount) + Number(checkoutForm.value.cardAmount);
});

const isPaymentValid = computed(() => {
  if (!selectedSession.value) return false;
  return Math.abs(totalPaidInput.value - selectedSession.value.totalDue) <= 100;
});

const paymentDiffMessage = computed(() => {
  if (!selectedSession.value) return '';
  const diff = totalPaidInput.value - selectedSession.value.totalDue;
  if (diff === 0) return 'Mos keldi';
  return diff > 0 ? `Kamomad yo'q, ortiqcha: +${diff.toLocaleString()}` : `Yetarli emas: ${diff.toLocaleString()}`;
});

const paymentDiffClass = computed(() => {
  return isPaymentValid.value ? 'text-emerald-600' : 'text-rose-600';
});
</script>
