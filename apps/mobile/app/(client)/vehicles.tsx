import { useState } from 'react'
import { View, Text, TouchableOpacity, FlatList, Alert, TextInput, Modal, ActivityIndicator, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { ArrowLeft, Car, Plus, Trash2, X, Check } from 'lucide-react-native'
import { useVehicles, Vehicle } from '@/hooks/useVehicles'

const VEHICLE_TYPES = [
  { value: 'hatch', label: 'Hatch' },
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'van', label: 'Van/Furgão' },
  { value: 'motorcycle', label: 'Moto' },
]

const BRANDS = ['Chevrolet', 'Fiat', 'Ford', 'Honda', 'Hyundai', 'Jeep', 'Nissan', 'Peugeot', 'Renault', 'Toyota', 'Volkswagen', 'Outro']

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <Text className="text-sm font-medium text-gray-700 mb-1.5">{label}</Text>
      {children}
    </View>
  )
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      {...props}
      className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 bg-white"
    />
  )
}

export default function VehiclesScreen() {
  const { vehicles, isLoading, add, remove } = useVehicles()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    plate: '', brand: '', model: '', year: '', color: '', type: 'hatch',
  })

  function resetForm() {
    setForm({ plate: '', brand: '', model: '', year: '', color: '', type: 'hatch' })
  }

  async function handleAdd() {
    const { plate, brand, model, year, color, type } = form
    if (!plate || !brand || !model || !year || !color) {
      Alert.alert('Atenção', 'Preencha todos os campos.')
      return
    }
    const yearNum = parseInt(year)
    if (isNaN(yearNum) || yearNum < 1980 || yearNum > new Date().getFullYear() + 1) {
      Alert.alert('Atenção', 'Ano inválido.')
      return
    }

    await add.mutateAsync({ plate, brand, model, year: yearNum, color, type: type as Vehicle['type'] })
      .then(() => { setShowModal(false); resetForm() })
      .catch(err => Alert.alert('Erro', err.message))
  }

  function handleDelete(v: Vehicle) {
    Alert.alert('Remover veículo', `Remover ${v.brand} ${v.model}?`, [
      { text: 'Não', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => remove.mutate(v.id) },
    ])
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 py-4 flex-row items-center gap-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={22} color="#374151" />
        </TouchableOpacity>
        <Text className="flex-1 font-bold text-gray-900 text-lg">Meus veículos</Text>
        <TouchableOpacity
          className="bg-primary-500 px-4 py-2 rounded-xl flex-row items-center gap-1.5"
          onPress={() => setShowModal(true)}
        >
          <Plus size={16} color="white" />
          <Text className="text-white font-semibold text-sm">Novo</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0EA5E9" />
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={v => v.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-5xl mb-3">🚗</Text>
              <Text className="text-gray-500 font-medium">Nenhum veículo cadastrado</Text>
              <TouchableOpacity
                className="mt-4 bg-primary-500 px-6 py-3 rounded-2xl"
                onPress={() => setShowModal(true)}
              >
                <Text className="text-white font-semibold">Adicionar veículo</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item: v }) => (
            <View className="bg-white rounded-2xl p-4 shadow-sm flex-row items-center gap-3">
              <View className="w-12 h-12 bg-primary-100 rounded-xl items-center justify-center">
                <Car size={22} color="#0EA5E9" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-gray-900">{v.brand} {v.model}</Text>
                <Text className="text-gray-500 text-sm">{v.plate} • {v.color} • {v.year}</Text>
                <View className="mt-1">
                  <Text className="text-xs text-primary-500 font-medium capitalize">
                    {VEHICLE_TYPES.find(t => t.value === v.type)?.label ?? v.type}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                className="w-9 h-9 bg-red-50 rounded-xl items-center justify-center"
                onPress={() => handleDelete(v)}
              >
                <Trash2 size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Modal Novo Veículo */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
            <Text className="font-bold text-gray-900 text-lg">Novo veículo</Text>
            <TouchableOpacity onPress={() => { setShowModal(false); resetForm() }}>
              <X size={22} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
            <Field label="Placa">
              <Input
                placeholder="ABC-1234 ou BRA2E19"
                autoCapitalize="characters"
                value={form.plate}
                onChangeText={v => setForm(f => ({ ...f, plate: v.toUpperCase() }))}
              />
            </Field>

            <Field label="Marca">
              <View className="flex-row flex-wrap gap-2">
                {BRANDS.map(b => (
                  <TouchableOpacity
                    key={b}
                    onPress={() => setForm(f => ({ ...f, brand: b }))}
                    className={`px-3 py-2 rounded-xl border ${form.brand === b ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white'}`}
                  >
                    <Text className={`text-sm font-medium ${form.brand === b ? 'text-primary-600' : 'text-gray-600'}`}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>

            <Field label="Modelo">
              <Input
                placeholder="Ex: Corolla, Gol, HB20..."
                value={form.model}
                onChangeText={v => setForm(f => ({ ...f, model: v }))}
              />
            </Field>

            <Field label="Ano">
              <Input
                placeholder="Ex: 2022"
                keyboardType="numeric"
                maxLength={4}
                value={form.year}
                onChangeText={v => setForm(f => ({ ...f, year: v }))}
              />
            </Field>

            <Field label="Cor">
              <Input
                placeholder="Ex: Prata, Preto, Branco..."
                value={form.color}
                onChangeText={v => setForm(f => ({ ...f, color: v }))}
              />
            </Field>

            <Field label="Tipo de veículo">
              <View className="flex-row flex-wrap gap-2">
                {VEHICLE_TYPES.map(t => (
                  <TouchableOpacity
                    key={t.value}
                    onPress={() => setForm(f => ({ ...f, type: t.value }))}
                    className={`px-4 py-2.5 rounded-xl border ${form.type === t.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white'}`}
                  >
                    <Text className={`text-sm font-medium ${form.type === t.value ? 'text-primary-600' : 'text-gray-600'}`}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>

            <View className="h-4" />
          </ScrollView>

          <View className="px-5 pb-8 pt-4 border-t border-gray-100">
            <TouchableOpacity
              className={`rounded-2xl py-4 items-center flex-row justify-center gap-2 ${add.isPending ? 'bg-gray-300' : 'bg-primary-500'}`}
              onPress={handleAdd}
              disabled={add.isPending}
            >
              {add.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Check size={18} color="white" />
                  <Text className="text-white font-bold text-base">Salvar veículo</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}
