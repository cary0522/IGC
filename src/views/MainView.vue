<script setup>
import { ref, watch, nextTick } from 'vue';
import { VueCropper } from "vue-cropper";
import "vue-cropper/dist/index.css";
import html2canvas from 'html2canvas';
import 'animate.css';
import LoadingImg from '/Loading.gif'
const Loading = ref(false);

const PictureSize = ref('4x5');
const PictureToggle = ref("2");

const cropper = ref([]);

// 重置裁切區域
const ResetCrop = () => {
  cropper.value.forEach((item) => {
    if (item) {
      item.refresh()
    } else {
      return
    }
  })
};
// 上傳的圖片資料
const fileInput = ref([]);
// 暫存圖片，主要渲染來源
const TempImg = ref([]);
// 預覽的圖片資料
const imgData = ref('');

// 上傳圖片
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
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      const reader = new FileReader();
      reader.onload = (e) => {
        fileInput.value.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }
    TempImg.value = fileInput.value;
  } else {
    // 清空原本儲存的圖片資料
    fileInput.value = [];
    TempImg.value = [];
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      const reader = new FileReader();
      reader.onload = (e) => {
        fileInput.value.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }
    TempImg.value = fileInput.value;
  }
}
// 下載圖片到檔案
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
// 產生預覽圖片
function ReviewImg() {
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
  });
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
      accept="image/*" @change="fileUpload" multiple class="mx-auto w-1/2 my-4" />
  </div>
  <div class="w-full lg:flex justify-center items-start">
    <div class="w-11/12 lg:w-1/3 mx-auto my-4">
      <h2 class="text-center text-lg font-bold">４、組合圖片</h2>
      <div v-if="PictureToggle == '2'">
        <div
          :class="['imgContainer mx-auto', { 'squareOutside': PictureSize == '1x1', 'defaultOutside': PictureSize == '4x5', 'horizontalOutside': PictureSize == '16x9' }]">
          <div id="imagePreview"
            :class="['w-full flex flex-wrap justify-start items-start', { 'square': PictureSize == '1x1', 'default': PictureSize == '4x5', 'horizontal': PictureSize == '16x9' }]">
            <VueCropper v-for="file, index in TempImg" :key="index" style="width: 50%; height: 100%" :img="file"
              :outputSize="1" outputType="jpeg" :autoCrop="false" :autoCropWidth="540" :autoCropHeight="1350"
              :canMoveBox="true" :canMove="true" :fixedBox="false" :centerBox="false" :ref="el => cropper[index] = el"
              :info="false" mode="cover" />
          </div>
        </div>
      </div>
      <div v-if="PictureToggle == '3'">
        <div
          :class="['imgContainer mx-auto', { 'squareOutside': PictureSize == '1x1', 'defaultOutside': PictureSize == '4x5', 'horizontalOutside': PictureSize == '16x9' }]">
          <div id="imagePreview"
            :class="['w-full flex flex-wrap justify-start items-start', { 'square': PictureSize == '1x1', 'default': PictureSize == '4x5', 'horizontal': PictureSize == '16x9' }]">
            <VueCropper v-for="file, index in TempImg" :key="index" style="width: 33.33%; height: 100%" :img="file"
              :outputSize="1" outputType="jpeg" :autoCrop="false" :autoCropWidth="360" :autoCropHeight="606"
              :canMoveBox="true" :canMove="true" :fixedBox="false" :centerBox="false" :ref="el => cropper[index] = el"
              :info="false" mode="cover" />
          </div>
        </div>
      </div>
      <div v-if="PictureToggle == '4'">
        <div
          :class="['imgContainer mx-auto', { 'squareOutside': PictureSize == '1x1', 'defaultOutside': PictureSize == '4x5', 'horizontalOutside': PictureSize == '16x9' }]">
          <div id="imagePreview"
            :class="['w-full flex flex-wrap justify-start items-start', { 'square': PictureSize == '1x1', 'default': PictureSize == '4x5', 'horizontal': PictureSize == '16x9' }]">
            <VueCropper v-for="file, index in TempImg" :key="index" style="width: 50%; height: 50%" :img="file"
              :outputSize="1" outputType="jpeg" :autoCrop="false" :autoCropWidth="540" :autoCropHeight="675"
              :canMoveBox="true" :canMove="true" :fixedBox="false" :centerBox="false" :ref="el => cropper[index] = el"
              :info="false" mode="cover" />
          </div>
        </div>
      </div>
    </div>
    <div class="my-2 flex flex-wrap justify-center w-full lg:w-[300px] mx-auto">
      <h2 class="my-2 text-center text-lg font-bold w-full">５、點擊「下載」可儲存至「檔案」<br> 點擊「預覽」可以查看組合好的圖片</h2>
      <v-btn @click="GetFinialImg" class="mx-2">下載</v-btn>
      <v-btn @click="ReviewImg" class="mx-2">預覽</v-btn>
      <v-btn @click="ResetCrop" class="mx-2">重置</v-btn>
    </div>
    <div class="my-4 w-11/12 lg:w-1/3 max-w-[1080px] mx-auto">
      <h2 class="text-center text-lg font-bold">長按下方圖片可以儲存到相簿</h2>
      <img :src="imgData" alt="" />
    </div>
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
