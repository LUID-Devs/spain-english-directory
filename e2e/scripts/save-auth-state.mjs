import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Save authentication state for reuse in tests
 * Run: node e2e/scripts/save-auth-state.mjs
 */
async function saveAuthState() {
  console.log('🚀 Starting browser for auth capture...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000/login');
    
    console.log('\n📋 Instructions:');
    console.log('1. Login manually in the browser window');
    console.log('2. Once logged in, return to this terminal');
    console.log('3. Press ENTER to save auth state\n');
    
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });
    
    // Ensure .auth directory exists
    const authDir = path.join(process.cwd(), 'e2e', '.auth');
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }
    
    // Save storage state
    await context.storageState({ 
      path: path.join(authDir, 'user.json') 
    });
    
    console.log('✅ Auth state saved to e2e/.auth/user.json');
    console.log('🧪 Tests can now use: test.use({ storageState: "e2e/.auth/user.json" })');
    
  } catch (error) {
    console.error('❌ Error saving auth state:', error.message);
  } finally {
    await browser.close();
    process.exit(0);
  }
}

saveAuthState();
