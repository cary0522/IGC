<script setup>
import { ref } from 'vue';
import { VueCropper } from "vue-cropper";
import "vue-cropper/dist/index.css";
import html2canvas from 'html2canvas';
import 'animate.css';

const cropper = ref([]);

// 重置裁切區域
const ResetCrop = () => {
  console.log(cropper.value)
  // for (let i = 0; i < cropper.value.length; i++) {
  //   cropper[i].refresh();
  // }
  // cropper.forEach((crop) => {
  //   crop.refresh();
  // })
};

const fileInput = ref([]);

function fileUpload(event) {
  for (let i = 0; i < event.target.files.length; i++) {
    const file = event.target.files[i];
    const reader = new FileReader();
    reader.onload = (e) => {
      fileInput.value.push(e.target.result);
    };
    reader.readAsDataURL(file);
  }
}

function GetFinialImg() {
  const container = document.querySelector('#imagePreview');
  html2canvas(container, {
    useCORS: true,
    allowTaint: true,
    scale: 1,
    backgroundColor: '#ffffff',
    dpi: window.devicePixelRatio * 4
  }).then((canvas) => {
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const link = document.createElement('a');
    link.href = imgData;
    link.download = `final-image-${Date.now()}.jpg`;
    link.click();
  });
}

</script>

<template>
  <div>
    <v-file-input label="上傳照片" :hide-input="true" placeholder="上傳照片" prepend-icon="mdi-image" type="file"
      accept="image/*" @change="fileUpload" multiple class="mx-auto w-1/2 my-4" />
    <div id="imgContainer" class="mx-auto">
      <div id="imagePreview" class="w-full flex flex-wrap">
        <template v-for="file, index in fileInput" :key="index">
          <VueCropper style="width: 50%; height: 50%" :img="file" :outputSize="1" outputType="jpeg" :autoCrop="false"
            :autoCropWidth="540" :autoCropHeight="675" :canMoveBox="true" :canMove="true" :fixedBox="false"
            :centerBox="false" :ref="cropper[index]" :info="false" mode="cover" />
        </template>
      </div>
    </div>
    <div class="my-2 flex justify-center w-full">
      <v-btn @click="GetFinialImg" class="mx-2">下載</v-btn>
      <!-- <v-btn @click="ResetCrop" class="mx-2">重置</v-btn> -->
    </div>
  </div>
</template>

<style>
#imgContainer {
  border: 1px solid #000000;
  max-width: 1080px;
  max-height: 1350px;
}

#imagePreview {
  max-width: 1080px;
  max-height: 1350px;
  aspect-ratio: 4 / 5;
  justify-content: start;
  align-items: start;
}
</style>
