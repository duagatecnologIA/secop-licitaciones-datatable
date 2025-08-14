/** @type {import('next').NextConfig} */
const nextConfig = {
  // Aquí pueden estar tus otras configuraciones
  // ...

  // Añade esta línea para solucionar el problema
  output: 'standalone',
};

module.exports = nextConfig;
