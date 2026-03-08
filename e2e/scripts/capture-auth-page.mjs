const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

/**
 * Capture screenshots of authenticated pages for audit
 * Run: node e2e/scripts/capture-auth-page.mjs
 */
async function captureAuthPages() {
  console.log('📸 Capturing authenticated pages...');
  
  const browser = await chromium.launch();
  
  try {
    const context = await browser.newContext({
      storageState: 'e2e/.auth/user.json'
    });
    
    const page = await context.newPage();
    
    // Ensure audit directory exists
    const auditDir = path.join(process.cwd(), 'e2e', 'audit');
    if (!fs.existsSync(auditDir)) {
      fs.mkdirSync(auditDir, { recursive: true });
    }
    
    const routes = [
      { path: '/dashboard', name: 'dashboard' },
      { path: '/profile', name: 'profile' },
      { path: '/settings', name: 'settings' },
      { path: '/businesses', name: 'businesses-list' },
      { path: '/businesses/new', name: 'businesses-new' },
    ];
    
    for (const route of routes) {
      console.log(`  Capturing ${route.path}...`);
      await page.goto(`http://localhost:3000${route.path}`);
      await page.waitForLoadState('networkidle');
      
      // Full page screenshot
      await page.screenshot({ 
        path: path.join(auditDir, `${route.name}.png`),
        fullPage: true 
      });
      
      // Viewport screenshot
      await page.screenshot({ 
        path: path.join(auditDir, `${route.name}-viewport.png`)
      });
    }
    
    console.log(`✅ Captured ${routes.length} pages to e2e/audit/`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('💡 Make sure you have run: node e2e/scripts/save-auth-state.mjs');
  } finally {
    await browser.close();
  }
}

captureAuthPages();
