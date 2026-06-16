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

// ─── SINGLETON RESOLVER (pnpm Windows fix) ────────────────────────────────────
//
// pnpm cria múltiplos diretórios físicos no .pnpm para pacotes com peer deps
// diferentes (ex: react@18.2.0 vs react@18.3.1). Metro carrega TODOS os
// diretórios e trata cada caminho como módulo distinto → instâncias duplicadas
// de react, react-native-screens, etc. → "View config getter undefined", hook
// violations, etc.
//
// Fix: interceptar require() por NOME de módulo e forçar UM único caminho
// canônico. Cobrimos todos os pacotes duplicados detectados automaticamente.

const realpathCache = new Map()
function realpath(p) {
  if (realpathCache.has(p)) return realpathCache.get(p)
  try {
    const r = fs.realpathSync.native(p)
    realpathCache.set(p, r)
    return r
  } catch (_) {
    realpathCache.set(p, p)
    return p
  }
}

// Extrai o nome do pacote de uma entrada do .pnpm (ex: @scope+pkg@ver... → @scope/pkg)
function extractPkgName(entry) {
  if (entry.startsWith('@')) {
    const plusIdx = entry.indexOf('+')
    if (plusIdx < 0) return null
    const atIdx = entry.indexOf('@', plusIdx)
    if (atIdx < 0) return null
    return entry.slice(0, atIdx).replace('+', '/')
  }
  const atIdx = entry.indexOf('@')
  return atIdx > 0 ? entry.slice(0, atIdx) : null
}

// Resolve o entry point que o METRO usa (campo "react-native" > "main")
// require.resolve usa "main" (CJS) – errado para Metro.
// Alguns pacotes omitem extensão no campo react-native (ex: "src/index" em vez
// de "src/index.ts") — testamos múltiplas extensões via tryResolveFile.
const EXTS = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js']

function tryResolveFile(base, entry) {
  for (const ext of EXTS) {
    const p = path.resolve(base, entry + ext)
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p
  }
  return null
}

function resolveMetroEntry(pkg) {
  const bases = [workspaceRoot, projectRoot].map(r => path.join(r, 'node_modules'))

  // Tentativa 1: via require.resolve (respeita exports map)
  for (const base of bases) {
    try {
      const pkgJsonPath = require.resolve(pkg + '/package.json', { paths: [base] })
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'))
      const entry = pkgJson['react-native'] || pkgJson['main'] || 'index.js'
      const resolved = tryResolveFile(path.dirname(pkgJsonPath), entry)
      if (resolved) return resolved
    } catch (_) {}
  }
  // Tentativa 2: leitura direta (pacotes com exports map que bloqueiam /package.json)
  for (const base of bases) {
    try {
      const pkgDir = path.join(base, pkg)
      const pkgJson = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'))
      const entry = pkgJson['react-native'] || pkgJson['main'] || 'index.js'
      const resolved = tryResolveFile(pkgDir, entry)
      if (resolved) return resolved
    } catch (_) {}
  }
  return null
}

// Auto-detecta todos os pacotes duplicados no .pnpm e cria singletons
// Cobre TODOS de uma vez em vez de adicionar um por um (whack-a-mole)
function buildSingletons() {
  const pnpmDir = path.resolve(workspaceRoot, 'node_modules/.pnpm')
  const pkgCounts = new Map()

  try {
    for (const entry of fs.readdirSync(pnpmDir)) {
      const name = extractPkgName(entry)
      if (name) pkgCounts.set(name, (pkgCounts.get(name) || 0) + 1)
    }
  } catch (e) {
    console.warn('[metro] Falha ao ler .pnpm:', e.message)
    return {}
  }

  const singletons = {}
  const skipped = []
  for (const [pkg, count] of pkgCounts) {
    if (count <= 1) continue
    const resolved = resolveMetroEntry(pkg)
    if (resolved) {
      singletons[pkg] = resolved
    } else {
      skipped.push(pkg)
    }
  }

  console.log(
    '[metro] Singletons ativos: ' + Object.keys(singletons).length +
    ' pacotes (de ' + [...pkgCounts.values()].filter(c => c > 1).length + ' duplicados)'
  )
  if (skipped.length > 0) {
    console.log('[metro] Sem resolução (ignorados): ' + skipped.slice(0, 5).join(', ') +
      (skipped.length > 5 ? '... +' + (skipped.length - 5) : ''))
  }

  return singletons
}

const SINGLETONS = buildSingletons()

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const singleton = SINGLETONS[moduleName]
  if (singleton) return { filePath: singleton, type: 'sourceFile' }
  return context.resolveRequest(context, moduleName, platform)
}
// ──────────────────────────────────────────────────────────────────────────────

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
      if (req.url) req.url = req.url.replace(/%5[Cc]/g, '/')
      return base(req, res, next)
    }
  },
}

module.exports = withNativeWind(config, { input: './global.css' })
