import FilePreviewer from '@/component/filePreviewer/filePreviewer.vue'
import FileUploader from '@/component/fileUploader/fileUploader.vue'
import { excelData, pdfData } from '@/component/fileUploader/fileUploader'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'fileUploader',
    component: FileUploader,
  },
  {
    path: '/pdf-preview',
    name: 'pdf-previw',
    component: FilePreviewer,
    beforeEnter: () => {
      // A browser refresh clears in-memory uploads, so preview is valid only with both parsed files.
      return excelData.value && pdfData.value ? true : '/'
    },
  },
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
