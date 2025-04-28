import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Thêm tùy chọn 'base' ở đây
  base: '/ict-contact-app/', // <<< THAY <TEN_REPOSITORY> bằng tên repo của bạn
})