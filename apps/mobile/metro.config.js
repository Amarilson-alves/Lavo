const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

// Faz o Metro enxergar todos os pacotes do monorepo
config.watchFolders = [workspaceRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]

// Exclui pastas que não pertencem ao app mobile (evita crash ao iniciar Next.js em paralelo)
config.resolver.blockList = [
  /apps\/web\/.next\/.*/,
  /apps\/web\/node_modules\/.*/,
  /\.next\/.*/,
]

// Corrige URLs com backslash (%5C) geradas pelo Metro no Windows
const originalEnhance = config.server?.enhanceMiddleware
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware, server) => {
    const base = originalEnhance ? originalEnhance(middleware, server) : middleware
    return (req, res, next) => {
      if (req.url) {
        req.url = req.url.replace(/%5[Cc]/g, '/')
      }
      return base(req, res, next)
    }
  },
}

module.exports = withNativeWind(config, { input: './global.css' })
