import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// Auto-copy the user logo from the brain directory to the client assets and public folders
try {
  const sourcePath = 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\bdbdd157-06a0-49c8-b5cd-6ee4b83a50c5\\media__1784100654035.png'
  
  // Copy to src/assets
  const destDir = path.resolve('src/assets')
  if (!fs.existsSync(destDir)){
    fs.mkdirSync(destDir, { recursive: true })
  }
  const destPath = path.join(destDir, 'logo.png')
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath)
    console.log('[Vite Config] Logo successfully copied to assets.')
  }

  // Copy to public for index.html favicon
  const publicDir = path.resolve('public')
  if (!fs.existsSync(publicDir)){
    fs.mkdirSync(publicDir, { recursive: true })
  }
  const publicLogoPath = path.join(publicDir, 'logo.png')
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, publicLogoPath)
    console.log('[Vite Config] Logo successfully copied to public.')
  }
} catch (err) {
  console.warn('[Vite Config] Dynamic logo copying failed:', err.message)
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
