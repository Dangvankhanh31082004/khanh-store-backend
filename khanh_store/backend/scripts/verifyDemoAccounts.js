// verifyDemoAccounts.js
// This script checks for the existence of default demo accounts, creates any missing ones,
// verifies that each can log in, and appends the results to REPORT.md.

require('dotenv').config();
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const User = require('../models/userModel');
const authService = require('../services/authService');

// Path to the report file (artifact location)
const REPORT_PATH = path.join(__dirname, '..', '..', 'REPORT.md');

const demoAccounts = [
  { role: 'owner', email: 'owner@khanhstore.com', password: '123456', fullName: 'Owner Demo' },
  { role: 'admin', email: 'admin@khanhstore.com', password: '123456', fullName: 'Admin Demo' },
  { role: 'manager', email: 'manager@khanhstore.com', password: '123456', fullName: 'Manager Demo' },
  { role: 'staff', email: 'staff@khanhstore.com', password: '123456', fullName: 'Staff Demo' },
  { role: 'customer', email: 'user@khanhstore.com', password: '123456', fullName: 'Customer Demo' }
];

async function ensureAccount(account) {
  const existing = await User.findByEmail(account.email);
  if (existing) {
    return { created: false, user: existing };
  }
  const roleRec = await User.getRoleByName(account.role);
  if (!roleRec) {
    throw new Error(`Role ${account.role} not found in database`);
  }
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(account.password, salt);
  const userId = await User.create({
    username: account.email.split('@')[0],
    email: account.email,
    password_hash: hash,
    role_id: roleRec.id
  });
  if (account.role.toLowerCase() === 'customer' || account.role.toLowerCase() === 'user') {
    await User.createCustomerProfile(userId, account.fullName);
  }
  const createdUser = await User.findById(userId);
  return { created: true, user: createdUser };
}

async function testLogin(account) {
  try {
    const result = await authService.login({ email: account.email, password: account.password });
    return { success: true, accessToken: result.accessToken };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function main() {
  let reportLines = ['# Demo Accounts Verification Report', '', '## Summary', ''];
  for (const acc of demoAccounts) {
    try {
      const { created, user } = await ensureAccount(acc);
      const loginResult = await testLogin(acc);
      reportLines.push(`### ${acc.role.charAt(0).toUpperCase() + acc.role.slice(1)} Account`);
      reportLines.push(`- Email: ${acc.email}`);
      reportLines.push(`- Password: ${acc.password}`);
      reportLines.push(`- Role: ${user.role_name}`);
      reportLines.push(`- Created: ${created ? 'Yes (new)' : 'Already existed'}`);
      reportLines.push(`- Login Test: ${loginResult.success ? '✅ Success' : `❌ Failed (${loginResult.error})`}`);
      reportLines.push('');
    } catch (e) {
      reportLines.push(`### ${acc.role} Account - Error`);
      reportLines.push(`- ${e.message}`);
      reportLines.push('');
    }
  }
  reportLines.push('## Role Permissions', '');
  reportLines.push('- **Owner**: Full system access.');
  reportLines.push('- **Admin**: Manage users, products, categories, orders.');
  reportLines.push('- **Manager**: Manage products, warehouse, orders and reports.');
  reportLines.push('- **Staff**: Manage warehouse and orders only.');
  reportLines.push('- **Customer**: Shop, cart, checkout and profile only.');
  reportLines.push('');
  fs.appendFileSync(REPORT_PATH, reportLines.join('\n') + '\n');
  console.log('Demo accounts verification completed. See REPORT.md for details.');
}

main().catch(err => {
  console.error('Unexpected error during demo accounts verification:', err);
  process.exit(1);
});
