<script setup>
import { ref } from 'vue';
import { VueCropper } from "vue-cropper";
import "vue-cropper/dist/index.css";
import html2canvas from 'html2canvas';
import 'animate.css';
import LoadingImg from '/Loading.gif'
const Loading = ref(false);

const PictureToggle = ref('two');

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
  fileInput.value = [];
  if (PictureToggle.value == 'two' && event.target.files.length > 2) {
    alert('只能上傳兩張照片');
    return;
  } else if (PictureToggle.value == 'four' && event.target.files.length > 4) {
    alert('只能上傳四張照片');
    return;
  } else {
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      const reader = new FileReader();
      reader.onload = (e) => {
        fileInput.value.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }
}
const imgData = ref('');
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
</script>

<template>
  <div>
    <v-btn-toggle v-model="PictureToggle" class="mx-auto my-4 w-full justify-center" mandatory>
      <v-btn value="two">兩張照片</v-btn>
      <v-btn value="four">四張照片</v-btn>
    </v-btn-toggle>
    <v-file-input label="上傳照片" :hide-input="true" placeholder="上傳照片" prepend-icon="mdi-image" type="file"
      accept="image/*" @change="fileUpload" multiple class="mx-auto w-1/2 my-4" />
  </div>
  <div class="w-full lg:flex justify-center items-start">
    <div class="w-full lg:w-1/3 mx-auto my-4">
      <div v-if="PictureToggle == 'two'">
        <div class="imgContainer mx-auto">
          <div id="imagePreview" class="w-full flex flex-wrap">
            <template v-for="file, index in fileInput" :key="index">
              <VueCropper style="width: 50%; height: 100%" :img="file" :outputSize="1" outputType="jpeg"
                :autoCrop="false" :autoCropWidth="540" :autoCropHeight="max" :canMoveBox="true" :canMove="true"
                :fixedBox="false" :centerBox="false" :ref="cropper[index]" :info="false" mode="cover" />
            </template>
          </div>
        </div>
      </div>
      <div v-if="PictureToggle == 'four'">
        <div class="imgContainer mx-auto">
          <div id="imagePreview" class="w-full flex flex-wrap">
            <template v-for="file, index in fileInput" :key="index">
              <VueCropper style="width: 50%; height: 50%" :img="file" :outputSize="1" outputType="jpeg"
                :autoCrop="false" :autoCropWidth="540" :autoCropHeight="675" :canMoveBox="true" :canMove="true"
                :fixedBox="false" :centerBox="false" :ref="cropper[index]" :info="false" mode="cover" />
            </template>
          </div>
        </div>
      </div>
    </div>
    <div class="my-2 flex justify-center w-full lg:w-[200px] mx-auto">
      <v-btn @click="GetFinialImg" class="mx-2">下載</v-btn>
      <v-btn @click="ReviewImg" class="mx-2">預覽</v-btn>
    </div>
    <img :src="imgData" alt="" class="my-4 w-full lg:w-1/3  max-w-[1080px] mx-auto" />
  </div>
</template>

<style>
.imgContainer {
  border: 1px solid #000000;
  max-width: 1082px;
  max-height: 1352px;
}

#imagePreview {
  max-width: 1080px;
  max-height: 1350px;
  aspect-ratio: 4 / 5;
  justify-content: start;
  align-items: start;
}
</style>
