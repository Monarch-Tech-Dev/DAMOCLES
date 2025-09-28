#!/usr/bin/env node

const { LokaliseApi } = require('@lokalise/node-api');
const fs = require('fs').promises;
const path = require('path');

// Lokalise configuration - provided by user
const LOKALISE_API_TOKEN = process.env.LOKALISE_API_TOKEN || 'e7ef0f2f2c50bfbb2504450e0fb96cf1448f4859';
const PROJECT_ID = '6660133068d80e8f372e83.69311825';

const lokaliseApi = new LokaliseApi({ apiToken: LOKALISE_API_TOKEN });

async function downloadTranslations() {
  try {
    console.log('🌍 Downloading translations from Lokalise...');

    // Download files from Lokalise
    const response = await lokaliseApi.files().download(PROJECT_ID, {
      format: 'json',
      original_filenames: false,
      bundle_structure: '%LANG_ISO%.json',
      directory_prefix: '',
      indentation: '2sp',
    });

    console.log('✅ Translations downloaded successfully!');
    console.log('Bundle URL:', response.bundle_url);

    // TODO: Extract and place files in public/locales directory
    console.log('📁 Place translation files in: apps/web/public/locales/');

  } catch (error) {
    console.error('❌ Error downloading translations:', error);
    process.exit(1);
  }
}

async function uploadKeys() {
  try {
    console.log('📤 Uploading keys to Lokalise...');

    // Read existing translation files
    const localesDir = path.join(__dirname, '../public/locales');
    const languages = ['no', 'en'];

    for (const lang of languages) {
      const filePath = path.join(localesDir, lang, 'common.json');

      try {
        const content = await fs.readFile(filePath, 'utf8');
        const keys = JSON.parse(content);

        // Upload to Lokalise
        const keysToUpload = Object.entries(keys).map(([key, value]) => ({
          key_name: key,
          platforms: ['web'],
          translations: [{
            language_iso: lang,
            translation: value
          }]
        }));

        await lokaliseApi.keys().create(keysToUpload, { project_id: PROJECT_ID });
        console.log(`✅ Uploaded ${lang} translations`);

      } catch (err) {
        console.log(`⚠️  No existing ${lang}/common.json file found`);
      }
    }

  } catch (error) {
    console.error('❌ Error uploading keys:', error);
    process.exit(1);
  }
}

// Check command line arguments
const command = process.argv[2];

switch (command) {
  case 'download':
    downloadTranslations();
    break;
  case 'upload':
    uploadKeys();
    break;
  default:
    console.log(`
Lokalise Sync Tool for DAMOCLES

Usage:
  node scripts/lokalise-sync.js download  - Download translations from Lokalise
  node scripts/lokalise-sync.js upload    - Upload keys to Lokalise
    `);
}