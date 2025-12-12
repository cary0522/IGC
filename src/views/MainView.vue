<script setup>
import { ref, watch, nextTick, computed } from 'vue';
import { VueCropper } from "vue-cropper";
import "vue-cropper/dist/index.css";
import html2canvas from 'html2canvas';
import 'animate.css';
import LoadingPage from './LoadingPage.vue'
const Loading = ref(false);

const PictureSize = ref('4x5');
const PictureToggle = ref("2");

const cropper = ref([]);
const videoRefs = ref([]);


// 使用 web api 內建的影片播放器
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const videoSourceMap = new WeakMap();

// 上傳的素材資料
const fileInput = ref([]);
// 暫存素材，主要渲染來源
const TempImg = ref([]);
// 判斷素材是否包含影片
const hasVideo = computed(() => TempImg.value.some(f => f.type === 'video'));
// 預覽的素材資料
const imgData = ref('');

// 上傳素材，可以包含圖片跟影片
function fileUpload(event) {
  if (PictureToggle.value == '2' && event.target.files.length > '2') {
    alert('只能上傳兩張照片');
    return;
  } else if (PictureToggle.value == '3' && event.target.files.length > '3') {
    alert('只能上傳三張照片');
    return;
  } else if (PictureToggle.value == '4' && event.target.files.length > '4') {
    alert('只能上傳四張照片');
    return;
  } else if (fileInput.value.length + event.target.files.length <= PictureToggle.value) {
    // 照片不滿選擇張數
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          fileInput.value.push({ type: 'image', content: e.target.result });
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        fileInput.value.push({ type: 'video', content: url });
      }
    }
    TempImg.value = fileInput.value;
  } else {
    // 照片剛好符合選擇張數
    // 清空原本儲存的圖片資料
    fileInput.value = [];
    TempImg.value = [];
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          fileInput.value.push({ type: 'image', content: e.target.result });
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        fileInput.value.push({ type: 'video', content: url });
      }
    }
    TempImg.value = fileInput.value;
  }
}

// 預覽-純圖片
function ReviewImg() {
  if (hasVideo.value) {
    GetFinalVideo(false);
  } else {
    Loading.value = true;
    const container = document.querySelector('#imagePreview');
    html2canvas(container, {
      useCORS: true,
      allowTaint: true,
      scale: 3,
      backgroundColor: '#ffffff',
      dpi: 300,
      width: container.offsetWidth,
      height: container.offsetHeight,
      onclone: (clonedDoc) => {
        const clonedVideos = clonedDoc.querySelectorAll('video');
        const originalVideos = container.querySelectorAll('video');

        clonedVideos.forEach((video, index) => {
          const originalVideo = originalVideos[index];
          const canvas = clonedDoc.createElement('canvas');

          // Match the displayed size
          const width = originalVideo.offsetWidth;
          const height = originalVideo.offsetHeight;

          canvas.width = width;
          canvas.height = height;

          // Copy styles
          canvas.style.width = '100%';
          canvas.style.height = '100%';
          canvas.style.objectFit = 'cover'; // Canvas doesn't support this but we draw it manually

          const ctx = canvas.getContext('2d');
          drawImageProp(ctx, originalVideo, 0, 0, width, height);

          video.parentNode.replaceChild(canvas, video);
        });
      }
    }).then((canvas) => {
      imgData.value = canvas.toDataURL('image/jpeg', 1.0);
      const target = document.querySelector('#finalPreview');
      if (target) {
        target.innerHTML = '';
        target.appendChild(canvas);
        // Make sure the canvas fits the container if needed, or let CSS handle it
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
      }
      Loading.value = false;
    });
  }
}

// 下載-純圖片檔案
function GetFinialImg() {
  const container = document.querySelector('#imagePreview');
  html2canvas(container, {
    useCORS: true,
    allowTaint: true,
    scale: 3,
    backgroundColor: '#ffffff',
    dpi: 300,
    width: container.offsetWidth,
    height: container.offsetHeight
  }).then((canvas) => {
    imgData.value = canvas.toDataURL('image/jpeg', 1.0);
    const link = document.createElement('a');
    link.href = imgData.value;
    link.download = `final-image-${Date.now()}.jpg`;
    link.click();
  });
}

// 讓圖片、影片符合容器寬高(來源圖片, 裁切起點(cx, cy), 裁切尺寸(cw, ch), 畫到 canvas 的位置(x, y), 以及大小(w, h))
function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {
  if (arguments.length === 2) {
    // 如果沒有提供 x, y, w, h，則使用 canvas 的寬高
    x = y = 0;
    w = ctx.canvas.width;
    h = ctx.canvas.height;
  }

  // 預設 offset 是中心
  offsetX = typeof offsetX === "number" ? offsetX : 0.5;
  offsetY = typeof offsetY === "number" ? offsetY : 0.5;

  // 限制 offset 在 [0.0, 1.0]
  if (offsetX < 0) offsetX = 0;
  if (offsetY < 0) offsetY = 0;
  if (offsetX > 1) offsetX = 1;
  if (offsetY > 1) offsetY = 1;

  // 計算素材的寬高
  var iw = img.videoWidth || img.width,
    ih = img.videoHeight || img.height,
    // 計算縮放比例
    r = Math.min(w / iw, h / ih),
    nw = iw * r,   // 新寬度
    nh = ih * r,   // 新高度
    cx, cy, cw, ch, ar = 1;

  // 檢查是否有填滿，如果有空白，則以容器寬高為基準填滿
  // 如果新的高度比容器高度小，計算縮放比例(ar)
  if (nw < w) ar = w / nw;
  if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;
  nw *= ar;
  nh *= ar;

  // 計算裁切部分
  cw = iw / (nw / w);
  ch = ih / (nh / h);

  cx = (iw - cw) * offsetX;
  cy = (ih - ch) * offsetY;

  // 確保 source rectangle 是有效的
  if (cx < 0) cx = 0;
  if (cy < 0) cy = 0;
  if (cw > iw) cw = iw;
  if (ch > ih) ch = ih;

  // 把裁切後的素材畫到 canvas 上
  ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}
// 包含影片的預覽跟下載
async function GetFinalVideo(isDownload = true) {
  Loading.value = true;
  try {
    // Set high resolution based on PictureSize
    let width = 1080;
    let height = 1080;

    if (PictureSize.value === '1x1') {
      height = 1080;
    } else if (PictureSize.value === '4x5') {
      height = 1350;
    } else if (PictureSize.value === '16x9') {
      height = Math.round(1080 * 9 / 16);
    }

    const container = document.querySelector('#imagePreview');
    // 使用 html2canvas 去抓取靜態圖片，品質跟單傳的圖片預覽相同
    const staticCanvas = await html2canvas(container, {
      useCORS: true,
      allowTaint: true,
      scale: 3,
      backgroundColor: '#ffffff',
      dpi: 300
    });

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 處理影片元素
    const videoItems = TempImg.value.map((file, index) => {
      if (file.type === 'video') {
        return { type: 'video', el: videoRefs.value[index], index };
      }
      return null;
    }).filter(item => item !== null);

    const stream = canvas.captureStream(60); // 增加 FPS 以使影片更流暢

    // 確保 AudioContext 正在運行
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    // 處理音訊相關
    const dest = audioCtx.createMediaStreamDestination();
    let hasAudio = false;
    const connectedSources = [];

    // 逐一把影片連接到 AudioContext
    videoItems.forEach(item => {
      if (item.el) {
        try {
          let source;
          if (videoSourceMap.has(item.el)) {
            source = videoSourceMap.get(item.el);
          } else {
            source = audioCtx.createMediaElementSource(item.el);
            videoSourceMap.set(item.el, source);
          }
          // 把影片的音訊放入 dest
          source.connect(dest);
          connectedSources.push(source);
          hasAudio = true;
        } catch (e) {
          console.warn('Audio context error', e);
        }
      }
    });

    // dest 已經包含所有音訊，如果 dest 有音訊，將音訊連接到播放工具
    if (hasAudio) {
      const audioTracks = dest.stream.getAudioTracks();
      audioTracks.forEach(track => stream.addTrack(track));
    }

    // 嘗試尋找支援的格式，優先使用 MP4 (H.264) 以支援手機相簿
    const mimeTypes = [
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2', // H.264 + AAC (Most compatible)
      'video/mp4',
      'video/webm;codecs=h264',
      'video/webm;codecs=vp9',
      'video/webm'
    ];

    let selectedMimeType = '';
    for (const type of mimeTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        selectedMimeType = type;
        break;
      }
    }

    if (!selectedMimeType) {
      console.warn('No supported mime type found, falling back to default');
      selectedMimeType = 'video/webm';
    }

    console.log('Using MIME type:', selectedMimeType);

    // 建立影片錄製機，來源包含影片 + 音訊(stream)
    const recorder = new MediaRecorder(stream, {
      mimeType: selectedMimeType,
      videoBitsPerSecond: 8000000
    });

    // 建立暫存資料的陣列
    const chunks = [];
    // 影片錄製機的暫存處理邏輯
    recorder.ondataavailable = e => chunks.push(e.data);
    // 影片錄製機的暫停處理邏輯
    recorder.onstop = () => {
      // 清理: 斷開音訊來源
      connectedSources.forEach(source => {
        try {
          source.disconnect(dest);
        } catch (e) {
          console.warn('Failed to disconnect source', e);
        }
      });

      // Determine extension based on mime type
      const ext = selectedMimeType.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(chunks, { type: selectedMimeType });
      const url = URL.createObjectURL(blob);

      if (isDownload) {
        // 下載模式
        const link = document.createElement('a');
        link.href = url;
        link.download = `final-video-${Date.now()}.${ext}`;
        link.click();
      } else {
        // 預覽模式
        const target = document.querySelector('#finalPreview');
        if (target) {
          target.innerHTML = '';
          const video = document.createElement('video');
          video.src = url;
          video.controls = true;
          video.autoplay = true;
          video.loop = true;
          video.style.width = '100%';
          video.style.height = 'auto';
          target.appendChild(video);
        }
      }
      Loading.value = false;
    };

    recorder.start();

    // 動畫迴圈
    const duration = 15000; // 15 seconds
    const startTime = performance.now();

    const backgroundCanvas = document.createElement('canvas');
    backgroundCanvas.width = width;
    backgroundCanvas.height = height;
    const bgCtx = backgroundCanvas.getContext('2d');
    bgCtx.drawImage(staticCanvas, 0, 0, width, height);

    // 畫面渲染邏輯，15秒後停止
    function draw() {
      if (performance.now() - startTime > duration) {
        recorder.stop();
        return;
      }

      // 畫靜態背景 (圖片)
      ctx.drawImage(backgroundCanvas, 0, 0);

      // 畫影片在上面
      videoItems.forEach((item) => {
        const i = item.index;
        // 根據索引和 PictureToggle 計算位置
        let x = 0, y = 0, w = 0, h = 0;

        if (PictureToggle.value == '2') {
          w = width / 2;
          h = height;
          x = i * w;
          y = 0;
        } else if (PictureToggle.value == '3') {
          w = width / 3;
          h = height;
          x = i * w;
          y = 0;
        } else if (PictureToggle.value == '4') {
          w = width / 2;
          h = height / 2;
          x = (i % 2) * w;
          y = Math.floor(i / 2) * h;
        }

        // 畫影片
        drawImageProp(ctx, item.el, x, y, w, h);
      });

      // 以瀏覽器的更新頻率進行呼叫
      requestAnimationFrame(draw);
    }

    draw();

  } catch (e) {
    console.error(e);
    alert('Export failed: ' + e.message);
    Loading.value = false;
  }
}

// 點擊下載
function Download() {
  if (hasVideo.value) {
    // 影片+圖片
    GetFinalVideo(true);
  } else {
    // 純圖片
    GetFinialImg();
  }
}

// 偵測圖片數量、尺寸改變
watch(PictureToggle, async () => {
  await nextTick().then(() => {
    if (fileInput.value.length > PictureToggle.value) {
      TempImg.value = fileInput.value.slice(0, PictureToggle.value);
    } else {
      TempImg.value = fileInput.value;
    }
    ResetCrop()
  })
})
watch(PictureSize, async () => {
  await nextTick().then(() => {
    PictureToggle.value = "2"
    ResetCrop()
  })
})

// 模式-直
const ImgMode = ref('straight');
</script>

<template>
  <div class="my-2">
    <h2 class="text-center text-lg font-bold">１、請選擇發文尺寸</h2>
    <v-btn-toggle v-model="PictureSize" class="mx-auto my-4 w-full justify-center" mandatory>
      <v-btn value="1x1">正方形</v-btn>
      <v-btn value="4x5">直式</v-btn>
      <v-btn value="16x9">橫式</v-btn>
    </v-btn-toggle>
  </div>
  <div class="my-2">
    <h2 class="text-center text-lg font-bold">２、請選擇要組合幾張照片</h2>
    <v-btn-toggle v-model="PictureToggle" class="mx-auto my-4 w-full justify-center" mandatory>
      <v-btn value="2" key="PictureToggle2">兩張照片</v-btn>
      <v-btn value="3" key="PictureToggle3" v-show="PictureSize == '16x9'">三張照片</v-btn>
      <v-btn value="4" key="PictureToggle4" v-show="PictureSize != '16x9'">四張照片</v-btn>
    </v-btn-toggle>
    <h2 class="text-center text-lg font-bold">３、上傳圖片</h2>
    <v-file-input label="上傳照片" :hide-input="true" placeholder="上傳照片" prepend-icon="mdi-image" type="file"
      accept="image/*,video/*" @change="fileUpload" multiple class="mx-auto w-1/2 my-4" />
  </div>
  <div class="w-full lg:flex justify-center items-start">
    <div class="w-11/12 lg:w-1/3 mx-auto my-4">
      <h2 class="text-center text-lg font-bold">４、組合圖片</h2>
      <div v-if="PictureToggle == '2'">
        <v-btn-toggle v-model="ImgMode" class="mx-auto my-4 w-full justify-center" mandatory>
          <v-btn value="straight">直</v-btn>
          <v-btn value="horizontal">橫</v-btn>
        </v-btn-toggle>
        <div
          :class="['imgContainer mx-auto', { 'squareOutside': PictureSize == '1x1', 'defaultOutside': PictureSize == '4x5', 'horizontalOutside': PictureSize == '16x9' }]">
          <div id="imagePreview"
            :class="['w-full flex flex-wrap justify-start items-start', { 'square': PictureSize == '1x1', 'default': PictureSize == '4x5', 'horizontal': PictureSize == '16x9' }]">
            <template v-for="(file, index) in TempImg" :key="index">
              <div style="width: 50%; height: 100%; position: relative; overflow: hidden;" v-if="ImgMode == 'straight'">
                <VueCropper v-if="file.type === 'image'" :img="file.content" :outputSize="1" outputType="jpeg"
                  :autoCrop="false" :autoCropWidth="540" :autoCropHeight="1350" :canMoveBox="true" :canMove="true"
                  :fixedBox="false" :centerBox="false" :ref="el => cropper[index] = el" :info="false" mode="cover"
                  :fillColor="'black'" />
                <video v-else-if="file.type === 'video'" :src="file.content" :ref="el => videoRefs[index] = el"
                  style="width: 100%; height: 100%; object-fit: cover;" muted autoplay loop playsinline></video>
              </div>
              <div style="width: 100%; height: 50%; position: relative; overflow: hidden;"
                v-else-if="ImgMode == 'horizontal'">
                <VueCropper v-if="file.type === 'image'" :img="file.content" :outputSize="1" outputType="jpeg"
                  :autoCrop="false" :autoCropWidth="540" :autoCropHeight="1350" :canMoveBox="true" :canMove="true"
                  :fixedBox="false" :centerBox="false" :ref="el => cropper[index] = el" :info="false" mode="cover"
                  :fillColor="'black'" />
                <video v-else-if="file.type === 'video'" :src="file.content" :ref="el => videoRefs[index] = el"
                  style="width: 100%; height: 100%; object-fit: cover;" muted autoplay loop playsinline></video>
              </div>
            </template>
          </div>
        </div>
      </div>
      <div v-if="PictureToggle == '3'">
        <v-btn-toggle v-model="ImgMode" class="mx-auto my-4 w-full justify-center" mandatory>
          <v-btn value="straight">直</v-btn>
          <v-btn value="horizontal">橫</v-btn>
        </v-btn-toggle>
        <div
          :class="['imgContainer mx-auto', { 'squareOutside': PictureSize == '1x1', 'defaultOutside': PictureSize == '4x5', 'horizontalOutside': PictureSize == '16x9' }]">
          <div id="imagePreview"
            :class="['w-full flex flex-wrap justify-start items-start', { 'square': PictureSize == '1x1', 'default': PictureSize == '4x5', 'horizontal': PictureSize == '16x9' }]">
            <template v-for="(file, index) in TempImg" :key="index">
              <div style="width: 33.33%; height: 100%; position: relative; overflow: hidden;"
                v-if="ImgMode == 'straight'">
                <VueCropper v-if="file.type === 'image'" :img="file.content" :outputSize="1" outputType="jpeg"
                  :autoCrop="false" :autoCropWidth="360" :autoCropHeight="606" :canMoveBox="true" :canMove="true"
                  :fixedBox="false" :centerBox="false" :ref="el => cropper[index] = el" :info="false" mode="cover" />
                <video v-else-if="file.type === 'video'" :src="file.content" :ref="el => videoRefs[index] = el"
                  style="width: 100%; height: 100%; object-fit: cover;" muted autoplay loop playsinline></video>
              </div>
              <div style="width: 100%; height: 33.33%; position: relative; overflow: hidden;"
                v-else-if="ImgMode == 'horizontal'">
                <VueCropper v-if="file.type === 'image'" :img="file.content" :outputSize="1" outputType="jpeg"
                  :autoCrop="false" :autoCropWidth="360" :autoCropHeight="606" :canMoveBox="true" :canMove="true"
                  :fixedBox="false" :centerBox="false" :ref="el => cropper[index] = el" :info="false" mode="cover" />
                <video v-else-if="file.type === 'video'" :src="file.content" :ref="el => videoRefs[index] = el"
                  style="width: 100%; height: 100%; object-fit: cover;" muted autoplay loop playsinline></video>
              </div>
            </template>
          </div>
        </div>
      </div>
      <div v-if="PictureToggle == '4'">
        <div
          :class="['imgContainer mx-auto', { 'squareOutside': PictureSize == '1x1', 'defaultOutside': PictureSize == '4x5', 'horizontalOutside': PictureSize == '16x9' }]">
          <div id="imagePreview"
            :class="['w-full flex flex-wrap justify-start items-start', { 'square': PictureSize == '1x1', 'default': PictureSize == '4x5', 'horizontal': PictureSize == '16x9' }]">
            <template v-for="(file, index) in TempImg" :key="index">
              <div style="width: 50%; height: 50%; position: relative; overflow: hidden;">
                <VueCropper v-if="file.type === 'image'" :img="file.content" :outputSize="1" outputType="jpeg"
                  :autoCrop="false" :autoCropWidth="540" :autoCropHeight="675" :canMoveBox="true" :canMove="true"
                  :fixedBox="false" :centerBox="false" :ref="el => cropper[index] = el" :info="false" mode="cover" />
                <video v-else-if="file.type === 'video'" :src="file.content" :ref="el => videoRefs[index] = el"
                  style="width: 100%; height: 100%; object-fit: cover;" muted autoplay loop playsinline></video>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
    <div class="my-2 flex flex-wrap justify-center w-full lg:w-[300px] mx-auto">
      <h2 class="my-2 text-center text-lg font-bold w-full">５、點擊「下載」可儲存至「檔案」<br> 點擊「預覽」可以查看組合好的圖片</h2>
      <v-btn @click="Download" class="mx-2">下載</v-btn>
      <v-btn @click="ReviewImg" class="mx-2">預覽</v-btn>
      <!-- <v-btn @click="ResetCrop" class="mx-2">重置</v-btn> -->
    </div>
    <div class="my-4 w-11/12 lg:w-1/3 max-w-[1080px] mx-auto">
      <h2 class="text-center text-lg font-bold">長按下方圖片可以儲存到相簿</h2>
      <div id="finalPreview"></div>
      <!-- <img :src="imgData" alt="" /> -->
    </div>
    <LoadingPage :loadingValue="Loading" />
  </div>
</template>

<style>
.imgContainer {
  border: 1px solid #000000;
}

.squareOutside {
  max-width: 1082px;
  max-height: 1082px;
}

.square {
  max-width: 1080px;
  max-height: 1080px;
  aspect-ratio: 1 / 1;
}

.horizontalOutside {
  max-width: 1082px;
  max-height: 608px;
}

.horizontal {
  max-width: 1080px;
  max-height: 606px;
  aspect-ratio: 16 / 9;
}

.defaultOutside {
  max-width: 1082px;
  max-height: 1352px;
}

.default {
  max-width: 1080px;
  max-height: 1350px;
  aspect-ratio: 4 / 5;
}
</style>
