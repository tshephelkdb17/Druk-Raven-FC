import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests/browser',use:{baseURL:'http://127.0.0.1:3000',headless:true},workers:1,webServer:{command:'npm run start -- --hostname 127.0.0.1 --port 3000',url:'http://127.0.0.1:3000',reuseExistingServer:true,timeout:120000}});
