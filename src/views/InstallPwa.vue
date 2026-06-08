<script setup>
import { ref, onMounted } from 'vue';

// 是否顯示懸浮氣泡提示安裝app
const showBubble = ref(false);
// 是否顯示IOS安裝教學
const showModal = ref(false);
// 儲存 beforeinstallprompt 事件
const deferredPrompt = ref(null);
// 偵測裝置系統 'android' or 'ios'
const platform = ref('');

// 偵測是否已經在 PWA 模式中
const isStandalone = () => {
  return window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
};

// 偵測裝置系統
const detectPlatform = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  if (/android/.test(userAgent)) return 'android';
  return 'desktop';
};

onMounted(() => {
  if (isStandalone()) return;

  platform.value = detectPlatform();
  showBubble.value = true;
});

const handleBubbleClick = async () => {
  if (platform.value === 'ios') {
    // iOS 顯示教學視窗
    showModal.value = true;
    showBubble.value = false;
  } else if (deferredPrompt.value) {
    // Android 觸發原生的安裝對話框
    deferredPrompt.value.prompt();
    const { outcome } = await deferredPrompt.value.userChoice;
    if (outcome === 'accepted') {
      showBubble.value = false;
    }
    deferredPrompt.value = null;
  } else {
    // 其他情況（如桌面版 Chrome 但未觸發事件）
    showModal.value = true;
  }
};
// 關閉IOS安裝教學
const closeModal = () => {
  showModal.value = false;
};
</script>

<template>
  <div>
    <!-- 右下角懸浮氣泡 -->
    <Transition name="fade-up">
      <div v-if="showBubble" @click="handleBubbleClick" class="pwa-bubble shadow-xl">
        <v-icon color="white" size="28">mdi-arrow-down-bold-circle</v-icon>
        <span class="bubble-text">安裝 App</span>
        <div class="bubble-close" @click.stop="showBubble = false">
          <v-icon size="14">mdi-close</v-icon>
        </div>
      </div>
    </Transition>

    <!-- 安裝教學視窗 (iOS 專用或通用教學) -->
    <v-dialog v-model="showModal" max-width="340px" transition="dialog-bottom-transition">
      <div class="pwa-modal p-6">
        <div class="text-right">
          <v-btn icon="mdi-close" variant="text" @click="closeModal"></v-btn>
        </div>

        <div class="text-center px-4">
          <v-icon color="#bababa" size="64" class="mb-4">mdi-cellphone-arrow-down</v-icon>
          <h3 class="text-xl font-bold mb-2">安裝 IGC 工具到桌面</h3>
          <p class="text-gray-600 text-sm mb-6">
            安裝後即可像一般 App 同時擁有離線操作與更流暢的組圖體驗。
          </p>
        </div>

        <!-- iOS 教學步驟 -->
        <div v-if="platform === 'ios'" class="ios-steps">
          <div class="step-item">
            <div class="step-num">1</div>
            <div class="step-content">
              點擊瀏覽器底部的<strong>「分享」</strong>按鈕 <v-icon size="14" color="#007AFF">mdi-export-variant</v-icon>
            </div>
          </div>
          <div class="step-divider"></div>
          <div class="step-item">
            <div class="step-num">2</div>
            <div class="step-content">
              向下滑動並選擇<strong>「加入主畫面」</strong> <v-icon size="14">mdi-plus-box-outline</v-icon>
            </div>
          </div>
        </div>

        <!-- Android / 其他教學 -->
        <div v-else class="text-center pb-4">
          <v-btn color="#bababa" size="large" class="text-white w-fit" rounded="xl" @click="handleBubbleClick">
            立即安裝
          </v-btn>
        </div>

        <div class="mt-6 text-center">
          <span class="text-xs text-gray-400">安裝不佔用手機空間</span>
        </div>
      </div>
    </v-dialog>
  </div>
</template>

<style scoped>
.pwa-bubble {
  position: fixed;
  bottom: 30px;
  right: 20px;
  background: linear-gradient(135deg, #bababa 0%, #888888 100%);
  border-radius: 50px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  z-index: 1000;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(186, 186, 186, 0.4);
  }

  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 15px rgba(186, 186, 186, 0);
  }

  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(186, 186, 186, 0);
  }
}

.bubble-text {
  font-weight: 600;
  font-size: 14px;
}

.bubble-close {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 5px;
}

.pwa-modal {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.ios-steps {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 20px;
  padding: 20px 10px;
  width: 90%;
  margin: auto;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.step-num {
  background: #bababa;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  flex-shrink: 0;
}

.step-content {
  font-size: 15px;
  line-height: 1.6;
  color: #333;
}

.step-divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.05);
  margin: 15px 0 15px 40px;
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.5s ease;
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

.fade-up-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}
</style>
