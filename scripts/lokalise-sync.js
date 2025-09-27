#!/usr/bin/env node

const { LokaliseApi } = require('@lokalise/node-api');
const fs = require('fs').promises;
const path = require('path');

// Configure with your Lokalise credentials
const LOKALISE_API_TOKEN = process.env.LOKALISE_API_TOKEN;
const PROJECT_ID = process.env.LOKALISE_PROJECT_ID;

console.log('Debug - API Token exists:', !!LOKALISE_API_TOKEN);
console.log('Debug - Project ID exists:', !!PROJECT_ID);
console.log('Debug - API Token length:', LOKALISE_API_TOKEN?.length);

if (!LOKALISE_API_TOKEN || !PROJECT_ID) {
  console.error('❌ Please set LOKALISE_API_TOKEN and LOKALISE_PROJECT_ID environment variables');
  console.error('API Token:', LOKALISE_API_TOKEN ? 'Set' : 'Missing');
  console.error('Project ID:', PROJECT_ID ? 'Set' : 'Missing');
  process.exit(1);
}

const lokalise = new LokaliseApi({ apiToken: LOKALISE_API_TOKEN });
const localesDir = path.join(__dirname, '..', 'apps', 'web', 'public', 'locales');

async function uploadTranslations() {
  console.log('📤 Uploading translations to Lokalise...');

  const languages = ['en', 'no'];

  for (const lang of languages) {
    const filePath = path.join(localesDir, lang, 'common.json');
    const content = await fs.readFile(filePath, 'utf8');
    const base64Content = Buffer.from(content).toString('base64');

    try {
      await lokalise.files().upload(PROJECT_ID, {
        data: base64Content,
        filename: `common.json`,
        lang_iso: lang,
        replace_modified: true,
        apply_tm: true
      });
      console.log(`✅ Uploaded ${lang}/common.json`);
    } catch (error) {
      console.error(`❌ Failed to upload ${lang}:`, error.message);
    }
  }
}

async function downloadTranslations() {
  console.log('📥 Downloading translations from Lokalise...');

  try {
    const response = await lokalise.files().download(PROJECT_ID, {
      format: 'json',
      original_filenames: true,
      directory_prefix: '',
      indentation: '2sp',
      json_unescaped_slashes: true,
      export_empty_as: 'base'
    });

    console.log('✅ Download initiated:', response.bundle_url);
    console.log('📝 Extract the downloaded files to public/locales/');
  } catch (error) {
    console.error('❌ Failed to download:', error.message);
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'upload':
    uploadTranslations();
    break;
  case 'download':
    downloadTranslations();
    break;
  default:
    console.log(`
    📚 Lokalise Sync Tool

    Usage:
      node lokalise-sync.js upload    - Upload local translations to Lokalise
      node lokalise-sync.js download  - Download translations from Lokalise

    Environment variables required:
      LOKALISE_API_TOKEN - Your Lokalise API token
      LOKALISE_PROJECT_ID - Your project ID
    `);
}