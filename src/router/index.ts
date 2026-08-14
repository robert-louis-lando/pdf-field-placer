import FilePreviewer from '@/component/filePreviewer/filePreviewer.vue'
import FileUploader from '@/component/fileUploader/fileUploader.vue'
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
  },
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
