#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Path to the photos directory
const photosDir = path.join(__dirname, '../frontend/public/photos')
const manifestPath = path.join(photosDir, 'photos.json')

// Image file extensions to include
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.JPG', '.JPEG', '.PNG', '.GIF', '.WEBP', '.BMP', '.SVG']

function generatePhotosManifest() {
  try {
    console.log('🌼 Generating photos manifest...')
    console.log(`📁 Scanning directory: ${photosDir}`)
    
    // Check if photos directory exists
    if (!fs.existsSync(photosDir)) {
      console.error(`❌ Photos directory not found: ${photosDir}`)
      process.exit(1)
    }
    
    // Read all files in the photos directory
    const files = fs.readdirSync(photosDir)
    console.log(`📄 Found ${files.length} files in directory`)
    
    // Filter for image files only
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase()
      const isImage = imageExtensions.includes(ext)
      if (isImage) {
        console.log(`📸 Found image: ${file}`)
      }
      return isImage
    })
    
    // Sort the files alphabetically
    imageFiles.sort()
    
    console.log(`✅ Found ${imageFiles.length} image files`)
    
    // Write the manifest file
    fs.writeFileSync(manifestPath, JSON.stringify(imageFiles, null, 2))
    console.log(`📝 Manifest written to: ${manifestPath}`)
    console.log(`📸 Images included:`)
    imageFiles.forEach(file => console.log(`   - ${file}`))
    
  } catch (error) {
    console.error('❌ Error generating photos manifest:', error)
    process.exit(1)
  }
}

// Run the script
generatePhotosManifest()
