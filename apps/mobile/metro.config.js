const path = require('path')
const fs = require('fs')
const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

config.watchFolders = [workspaceRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]

// ─── CORREÇÃO PARA PNPM NO WINDOWS ────────────────────────────────────────────
// No Windows, pnpm cria junction points em vez de symlinks reais.
// Metro não dereferencia junctions → o mesmo arquivo físico aparece com dois IDs
// de módulo diferentes → instâncias duplicadas de pacotes críticos.
//
// EFEITOS da duplicação:
//   • react duplicado → ReactCurrentDispatcher nulo → "Invalid hook call"
//   • @react-navigation/core duplicado → contextos de navegação incompatíveis
//     → "Couldn't register the navigator"
//
// FIX: interceptar require() dos pacotes críticos e forçar retorno do caminho
// físico real (único). Outros pacotes vão pelo resolver padrão sem alteração,
// preservando o sistema Haste do react-native (HMRClient, etc.).
//
// NÃO usar realpath global — isso quebra o Haste module system do react-native.

const realpathCache = new Map()
function realpath(p) {
  if (realpathCache.has(p)) return realpathCache.get(p)
  try {
    const real = fs.realpathSync.native(p)
    realpathCache.set(p, real)
    return real
  } catch (_) {
    realpathCache.set(p, p)
    return p
  }
}

function resolveSingletonPath(pkg) {
  try {
    return realpath(require.resolve(pkg, { paths: [path.resolve(projectRoot, 'node_modules')] }))
  } catch (_) {
    return null
  }
}

// Resolve o entry point correto que o METRO usaria para um pacote:
// Metro prefere o campo "react-native" > "main" do package.json.
// require.resolve() do Node.js retornaria o campo "main" (build CJS) — ERRADO.
function resolveMetroEntry(pkg) {
  try {
    const pkgJsonPath = require.resolve(pkg + '/package.json', {
      paths: [path.resolve(workspaceRoot, 'node_modules')],
    })
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'))
    const entry = pkgJson['react-native'] || pkgJson['main'] || 'index.js'
    return path.resolve(path.dirname(pkgJsonPath), entry)
  } catch (_) {
    return null
  }
}

// Pacotes confirmados como DUPLICADOS no .pnpm (dois diretórios físicos distintos:
// uma variante para react@18.2.0, outra para react@18.3.1).
// Metro carrega AMBAS → dois IDs de módulo → efeitos:
//   react           → ReactCurrentDispatcher nulo → "Invalid hook call"
//   @react-navigation/core → contextos de nav duplicados → "Couldn't register the navigator"
const SINGLETONS = {
  'react': resolveSingletonPath('react'),
  '@react-navigation/core': resolveMetroEntry('@react-navigation/core'),
}

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const singleton = SINGLETONS[moduleName]
  if (singleton) {
    return { filePath: singleton, type: 'sourceFile' }
  }
  return context.resolveRequest(context, moduleName, platform)
}
// ──────────────────────────────────────────────────────────────────────────────

// Força expo-linking para a versão correta (6.3.1) — sem isso n=0 (ExpoLinking
// native module not found)
config.resolver.extraNodeModules = {
  'expo-linking': path.resolve(workspaceRoot, 'node_modules', 'expo-linking'),
}

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
