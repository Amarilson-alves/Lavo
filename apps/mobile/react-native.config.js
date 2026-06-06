module.exports = {
  dependencies: {
    // Evita duplo registro nativo: react-native-worklets é um alias pnpm para
    // react-native-worklets-core, que já é carregado internamente pelo reanimated.
    // O autolinking encontraria os dois diretórios e tentaria registrar o mesmo
    // módulo JSI duas vezes, causando crash no Android.
    'react-native-worklets': {
      platforms: { android: null, ios: null },
    },
  },
}
