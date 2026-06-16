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
// pnpm cria DOIS diretórios físicos no .pnpm para cada pacote com peer deps
// diferentes. Metro trata cada caminho como módulo distinto → instâncias
// duplicadas de react, expo-router/Route.js, etc.
//
// Problema em duas camadas:
// 1. Bare imports (require('expo-router')) → interceptado por SINGLETONS
// 2. Subpath imports (require('expo-router/_ctx')) → resolvem para
//    apps/mobile/node_modules/expo-router (junction .pnpm) em vez da cópia
//    hoisted em node_modules/ → CurrentRouteContext diferente → "No filename found"
//
// Fix: interceptar tanto bare imports quanto subpath imports, redirecionando
// todos para o diretório canônico (raiz do workspace).

const EXTS = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js']

function tryResolveFile(base, entry) {
  for (const ext of EXTS) {
    const p = path.resolve(base, entry + ext)
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p
  }
  return null
}

// Extrai o nome do pacote de uma entrada do .pnpm
// @scope+pkg@ver... → @scope/pkg | pkg@ver... → pkg
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

// Divide 'pkg/sub' ou '@scope/pkg/sub' em { pkgName, subpath }
function splitModuleName(moduleName) {
  if (moduleName.startsWith('@')) {
    const first = moduleName.indexOf('/')
    if (first < 0) return { pkgName: moduleName, subpath: null }
    const second = moduleName.indexOf('/', first + 1)
    if (second < 0) return { pkgName: moduleName, subpath: null }
    return { pkgName: moduleName.slice(0, second), subpath: moduleName.slice(second + 1) }
  }
  const slash = moduleName.indexOf('/')
  if (slash < 0) return { pkgName: moduleName, subpath: null }
  return { pkgName: moduleName.slice(0, slash), subpath: moduleName.slice(slash + 1) }
}

// Resolve o entry point que o METRO usa (campo "react-native" > "main")
// Retorna { file, dir } onde dir é o diretório raiz do pacote (contém package.json)
function resolveMetroEntry(pkg) {
  // projectRoot primeiro: babel-preset-expo (expo-router-plugin.js) usa
  // resolve-from(projectRoot, 'expo-router/entry') para calcular EXPO_ROUTER_APP_ROOT
  // como caminho RELATIVO a essa resolução. Se nosso singleton apontar para uma
  // cópia física diferente (ex: hoisted na raiz), a matemática relativa do
  // require.context() em _ctx.js quebra e nenhuma rota é encontrada (tela
  // "Welcome to Expo"). Priorizar projectRoot mantém consistência com essa
  // resolução Node.js feita fora do nosso resolver.
  const bases = [projectRoot, workspaceRoot].map(r => path.join(r, 'node_modules'))

  // Tentativa 1: via require.resolve (respeita exports map)
  for (const base of bases) {
    try {
      const pkgJsonPath = require.resolve(pkg + '/package.json', { paths: [base] })
      const pkgDir = path.dirname(pkgJsonPath)
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'))
      const entry = pkgJson['react-native'] || pkgJson['main'] || 'index.js'
      const file = tryResolveFile(pkgDir, entry)
      if (file) return { file, dir: pkgDir }
    } catch (_) {}
  }
  // Tentativa 2: leitura direta (pacotes com exports map que bloqueiam /package.json)
  for (const base of bases) {
    try {
      const pkgDir = path.join(base, pkg)
      const pkgJson = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'))
      const entry = pkgJson['react-native'] || pkgJson['main'] || 'index.js'
      const file = tryResolveFile(pkgDir, entry)
      if (file) return { file, dir: pkgDir }
    } catch (_) {}
  }
  return null
}

// Auto-detecta todos os pacotes duplicados no .pnpm e cria singletons
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
    return { singletons: {}, pkgDirs: {} }
  }

  const singletons = {}  // pkg → canonical entry file path
  const pkgDirs = {}     // pkg → canonical package root directory
  const skipped = []

  for (const [pkg, count] of pkgCounts) {
    if (count <= 1) continue
    const result = resolveMetroEntry(pkg)
    if (result) {
      singletons[pkg] = result.file
      pkgDirs[pkg] = result.dir
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

  return { singletons, pkgDirs }
}

const { singletons: SINGLETONS, pkgDirs: PKG_DIRS } = buildSingletons()

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Bare import: require('expo-router') → canonical entry file
  const singleton = SINGLETONS[moduleName]
  if (singleton) return { filePath: singleton, type: 'sourceFile' }

  // Subpath import: require('expo-router/_ctx') → canonical pkg dir + subpath
  // Sem isso, apps/mobile/node_modules/expo-router (junction .pnpm) tem prioridade
  // sobre node_modules/expo-router (cópia hoisted), gerando dois CurrentRouteContext
  const { pkgName, subpath } = splitModuleName(moduleName)
  if (subpath !== null) {
    const pkgDir = PKG_DIRS[pkgName]
    if (pkgDir) {
      const resolved = tryResolveFile(pkgDir, subpath)
      if (resolved) return { filePath: resolved, type: 'sourceFile' }
    }
  }

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
