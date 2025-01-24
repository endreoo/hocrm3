module.exports = {
  apps: [{
    name: 'hocrm3',
    script: 'npm',
    args: 'run dev',
    env: {
      NODE_ENV: 'development',
      VITE_CRM_API_URL: 'http://37.27.142.148:3000',
      VITE_CRM_EMAIL: 'endre@hotelonline.co',
      VITE_CRM_PASSWORD: 'S@ccess900'
    },
    watch: true,
    ignore_watch: ['node_modules', 'dist']
  }]
} 