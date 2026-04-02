#!/usr/bin/env node

/**
 * Pre-Deployment Verification Script
 * Run this before deploying to Vercel/Render to catch issues early
 */

const fs = require('fs');
const path = require('path');

const checks = [];
const rootPath = path.join(__dirname, '..');

function check(name, condition, severity = 'error') {
  checks.push({ name, passed: condition, severity });
}

console.log('🔍 SMATQ Store - Pre-Deployment Verification\n');

// ===== FRONTEND CHECKS =====
console.log('📱 Frontend Checks:');

// Check frontend package.json
const frontendPkg = path.join(rootPath, 'package.json');
check('Frontend package.json exists', fs.existsSync(frontendPkg));

// Check vite config
const viteConfig = path.join(rootPath, 'vite.config.ts');
check('vite.config.ts exists', fs.existsSync(viteConfig));

// Check vercel.json
const vercelJson = path.join(rootPath, 'vercel.json');
check('vercel.json exists (Vercel config)', fs.existsSync(vercelJson), 'warning');

// Check .env.local.example
const envLocalExample = path.join(rootPath, '.env.local.example');
check(''.env.local.example exists', fs.existsSync(envLocalExample), 'warning');

// ===== BACKEND CHECKS =====
console.log('\n🖥️  Backend Checks:');

const backendPath = path.join(rootPath, 'backend');
const backendPkg = path.join(backendPath, 'package.json');
check('Backend package.json exists', fs.existsSync(backendPkg));

const backendAppJs = path.join(backendPath, 'src', 'app.js');
check('Backend app.js exists', fs.existsSync(backendAppJs));

const backendConfig = path.join(backendPath, 'src', 'config.js');
check('Backend config.js exists', fs.existsSync(backendConfig));

const envExample = path.join(backendPath, '.env.example');
check('Backend .env.example exists', fs.existsSync(envExample));

const renderYaml = path.join(rootPath, 'render.yaml');
check('render.yaml exists (Render config)', fs.existsSync(renderYaml), 'warning');

// Check .env file (shouldn't be tracked)
const envFile = path.join(backendPath, '.env');
const shouldNotExist = !fs.existsSync(envFile) || fs.existsSync(path.join(rootPath, '.gitignore'));
check('Backend .env should NOT be in git', shouldNotExist, 'warning');

// ===== API ENDPOINTS VERIFICATION =====
console.log('\n🔌 Backend Routes Verification:');

const routesPath = path.join(backendPath, 'src', 'routes');
check('Products routes exist', fs.existsSync(path.join(routesPath, 'products.js')));
check('Payments routes exist', fs.existsSync(path.join(routesPath, 'payments.js')));
check('Orders routes exist', fs.existsSync(path.join(routesPath, 'orders.js')));
check('Webhooks routes exist', fs.existsSync(path.join(routesPath, 'webhooks.js')));

// ===== PAYMENT SERVICE VERIFICATION =====
console.log('\n💳 Payment Service Verification:');

const paymentService = path.join(rootPath, 'src', 'services', 'paymentService.ts');
const paymentServiceContent = fs.readFileSync(paymentService, 'utf-8');
check('paymentService uses API_BASE_URL', paymentServiceContent.includes('${API_BASE_URL}'));
check('paymentService defines VITE_API_URL', paymentServiceContent.includes('VITE_API_URL'));

const snippeService = path.join(backendPath, 'src', 'services', 'snippeService.js');
check('snippeService.js exists', fs.existsSync(snippeService));

// ===== ENVIRONMENT VARIABLES =====
console.log('\n🔐 Environment Configuration:');

if (fs.existsSync(envExample)) {
  const envContent = fs.readFileSync(envExample, 'utf-8');
  check('SNIPPE_API_KEY in template', envContent.includes('SNIPPE_API_KEY'));
  check('SNIPPE_WEBHOOK_SECRET in template', envContent.includes('SNIPPE_WEBHOOK_SECRET'));
  check('FRONTEND_URL in template', envContent.includes('FRONTEND_URL'));
  check('WEBHOOK_URL in template', envContent.includes('WEBHOOK_URL'));
}

// ===== BUILD CONFIGURATION =====
console.log('\n🔨 Build Configuration:');

if (fs.existsSync(frontendPkg)) {
  const pkg = JSON.parse(fs.readFileSync(frontendPkg, 'utf-8'));
  check('Frontend has build script', pkg.scripts && pkg.scripts.build);
  check('Frontend uses React', pkg.dependencies && pkg.dependencies.react);
}

if (fs.existsSync(backendPkg)) {
  const pkg = JSON.parse(fs.readFileSync(backendPkg, 'utf-8'));
  check('Backend has start script', pkg.scripts && pkg.scripts.start);
  check('Backend has express', pkg.dependencies && pkg.dependencies.express);
}

// ===== FINAL REPORT =====
console.log('\n' + '='.repeat(50));

const errors = checks.filter(c => !c.passed && c.severity === 'error');
const warnings = checks.filter(c => !c.passed && c.severity === 'warning');
const passed = checks.filter(c => c.passed);

console.log(`
✅ Passed:   ${passed.length}
⚠️  Warnings: ${warnings.length}
❌ Errors:   ${errors.length}
`);

if (warnings.length > 0) {
  console.log('⚠️  Warnings (non-blocking):');
  warnings.forEach(w => console.log(`   - ${w.name}`));
}

if (errors.length > 0) {
  console.log('❌ Errors (fix before deploy):');
  errors.forEach(e => console.log(`   - ${e.name}`));
  process.exit(1);
} else {
  console.log('✅ All critical checks passed! Ready to deploy.');
  console.log('\n📖 Next steps:');
  console.log('   1. Read DEPLOYMENT_GUIDE.md (in project root)');
  console.log('   2. Get Snippe API credentials from dashboard');
  console.log('   3. Create backend/.env with credentials');
  console.log('   4. Test locally (npm run dev in both folders)');
  console.log('   5. Push to GitHub');
  console.log('   6. Deploy to Vercel & Render\n');
}
