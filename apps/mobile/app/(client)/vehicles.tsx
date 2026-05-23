import { useState } from 'react'
import { View, Text, TouchableOpacity, FlatList, Alert, TextInput, Modal, ActivityIndicator, ScrollView, StatusBar } from 'react-native'
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

const CARD_SHADOW = {
  shadowColor: '#1C1C1E', shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07, shadowRadius: 12, elevation: 3,
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFD' }} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFD" />

      {/* Header */}
      <View style={{
        backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 16,
        flexDirection: 'row', alignItems: 'center', gap: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}
        >
          <ArrowLeft size={18} color="#374151" />
        </TouchableOpacity>
        <Text style={{ flex: 1, fontWeight: '800', color: '#111827', fontSize: 18 }}>Meus veículos</Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#0EA5E9', paddingHorizontal: 16, paddingVertical: 9,
            borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 6,
            shadowColor: '#0EA5E9', shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
          }}
          onPress={() => setShowModal(true)}
        >
          <Plus size={16} color="white" />
          <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>Novo</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#0EA5E9" />
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={v => v.id}
          contentContainerStyle={{ padding: 20, gap: 12 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 64 }}>
              <View style={{
                width: 80, height: 80, borderRadius: 40,
                backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
              }}>
                <Car size={36} color="#93C5FD" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#374151' }}>Nenhum veículo cadastrado</Text>
              <Text style={{ fontSize: 13, color: '#9CA3AF', marginTop: 6 }}>Adicione seu veículo para agendar serviços</Text>
              <TouchableOpacity
                style={{
                  marginTop: 20, backgroundColor: '#0EA5E9',
                  paddingHorizontal: 24, paddingVertical: 13, borderRadius: 16,
                }}
                onPress={() => setShowModal(true)}
              >
                <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>Adicionar veículo</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item: v }) => (
            <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, ...CARD_SHADOW }}>
              <View style={{ width: 52, height: 52, backgroundColor: '#EFF6FF', borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
                <Car size={24} color="#0EA5E9" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', color: '#111827', fontSize: 15 }}>{v.brand} {v.model}</Text>
                <Text style={{ color: '#6B7280', fontSize: 13, marginTop: 2 }}>{v.plate} • {v.color} • {v.year}</Text>
                <View style={{
                  alignSelf: 'flex-start', marginTop: 6,
                  backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8,
                }}>
                  <Text style={{ fontSize: 11, color: '#0369A1', fontWeight: '600' }}>
                    {VEHICLE_TYPES.find(t => t.value === v.type)?.label ?? v.type}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={{ width: 38, height: 38, backgroundColor: '#FEF2F2', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
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
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
          <View style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: 20, paddingVertical: 16,
            borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
          }}>
            <Text style={{ fontWeight: '800', color: '#111827', fontSize: 18 }}>Novo veículo</Text>
            <TouchableOpacity
              style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}
              onPress={() => { setShowModal(false); resetForm() }}
            >
              <X size={18} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }} showsVerticalScrollIndicator={false}>

            {/* Placa */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Placa</Text>
              <TextInput
                style={{
                  borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14,
                  paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: '#111827',
                  backgroundColor: '#FAFAFA',
                }}
                placeholder="ABC-1234 ou BRA2E19"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
                value={form.plate}
                onChangeText={v => setForm(f => ({ ...f, plate: v.toUpperCase() }))}
              />
            </View>

            {/* Marca */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Marca</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {BRANDS.map(b => (
                  <TouchableOpacity
                    key={b}
                    onPress={() => setForm(f => ({ ...f, brand: b }))}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: form.brand === b ? '#0EA5E9' : '#E5E7EB',
                      backgroundColor: form.brand === b ? '#EFF6FF' : 'white',
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: form.brand === b ? '#0369A1' : '#6B7280' }}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Modelo */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Modelo</Text>
              <TextInput
                style={{
                  borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14,
                  paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: '#111827',
                  backgroundColor: '#FAFAFA',
                }}
                placeholder="Ex: Corolla, Gol, HB20..."
                placeholderTextColor="#9CA3AF"
                value={form.model}
                onChangeText={v => setForm(f => ({ ...f, model: v }))}
              />
            </View>

            {/* Ano */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Ano</Text>
              <TextInput
                style={{
                  borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14,
                  paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: '#111827',
                  backgroundColor: '#FAFAFA',
                }}
                placeholder="Ex: 2022"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={4}
                value={form.year}
                onChangeText={v => setForm(f => ({ ...f, year: v }))}
              />
            </View>

            {/* Cor */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Cor</Text>
              <TextInput
                style={{
                  borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14,
                  paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: '#111827',
                  backgroundColor: '#FAFAFA',
                }}
                placeholder="Ex: Prata, Preto, Branco..."
                placeholderTextColor="#9CA3AF"
                value={form.color}
                onChangeText={v => setForm(f => ({ ...f, color: v }))}
              />
            </View>

            {/* Tipo */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Tipo de veículo</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {VEHICLE_TYPES.map(t => (
                  <TouchableOpacity
                    key={t.value}
                    onPress={() => setForm(f => ({ ...f, type: t.value }))}
                    style={{
                      paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14,
                      borderWidth: 1.5,
                      borderColor: form.type === t.value ? '#0EA5E9' : '#E5E7EB',
                      backgroundColor: form.type === t.value ? '#EFF6FF' : 'white',
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: form.type === t.value ? '#0369A1' : '#6B7280' }}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ height: 8 }} />
          </ScrollView>

          <View style={{
            paddingHorizontal: 20, paddingBottom: 32, paddingTop: 16,
            borderTopWidth: 1, borderTopColor: '#F3F4F6',
          }}>
            <TouchableOpacity
              style={{
                borderRadius: 20, paddingVertical: 16,
                alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
                backgroundColor: add.isPending ? '#D1D5DB' : '#0EA5E9',
                shadowColor: add.isPending ? 'transparent' : '#0EA5E9',
                shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 5,
              }}
              onPress={handleAdd}
              disabled={add.isPending}
            >
              {add.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Check size={18} color="white" />
                  <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>Salvar veículo</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}
