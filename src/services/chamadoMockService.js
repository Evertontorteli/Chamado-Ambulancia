/**
 * Serviço mock para simulação de dados e operações de chamados
 * Todas as operações são simuladas localmente
 */

// Simula geocoding - retorna coordenadas baseadas no endereço
export const mockGeocode = (address) => {
  // Simula lat/lng baseado em hash simples do endereço
  const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const lat = -20.2689 + (hash % 100) / 1000 // Jales, SP base
  const lng = -50.5458 + (hash % 100) / 1000
  return { lat, lng }
}

// Dados iniciais de chamados para demonstração
export const initialChamados = [
  {
    id: 1,
    paciente: 'João Silva',
    telefone: '(17) 98765-4321',
    endereco: 'Rua São Paulo, 123 - Centro, Jales - SP',
    destino: 'Hospital Regional de Jales',
    prioridade: 'urgente',
    status: 'pendente',
    observacoes: 'Paciente com dificuldade respiratória',
    tempoEspera: 5,
    coordenadas: { lat: -20.2689, lng: -50.5458 },
    criadoEm: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 2,
    paciente: 'Maria Santos',
    telefone: '(17) 91234-5678',
    endereco: 'Av. Francisco Jalles, 456 - Vila Cardia, Jales - SP',
    destino: 'Hospital São Francisco',
    prioridade: 'alta',
    status: 'alocado',
    observacoes: 'Transporte de rotina',
    tempoEspera: 15,
    coordenadas: { lat: -20.2750, lng: -50.5500 },
    criadoEm: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 3,
    paciente: 'Pedro Costa',
    telefone: '(17) 99876-5432',
    endereco: 'Rua Prudente de Moraes, 789 - Jardim São Paulo, Jales - SP',
    destino: 'Clínica Santa Maria',
    prioridade: 'media',
    status: 'em_deslocamento',
    observacoes: '',
    tempoEspera: 8,
    coordenadas: { lat: -20.2600, lng: -50.5400 },
    criadoEm: new Date(Date.now() - 8 * 60000).toISOString(),
  },
]

// Status disponíveis
export const STATUS_OPTIONS = [
  { value: 'todos', label: 'Todos os Status' },
  { value: 'pendente', label: 'Triagem' },
  { value: 'alocado', label: 'Alocado' },
  { value: 'em_deslocamento', label: 'Em Deslocamento' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' },
]

// Prioridades disponíveis
export const PRIORIDADE_OPTIONS = [
  { value: 'todos', label: 'Todas as Prioridades' },
  { value: 'urgente', label: 'Urgente' },
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Média' },
  { value: 'baixa', label: 'Baixa' },
]

// Função para obter cor da prioridade
export const getPrioridadeColor = (prioridade) => {
  const colors = {
    urgente: 'bg-red-600 text-white',
    alta: 'bg-orange-500 text-white',
    media: 'bg-yellow-500 text-white',
    baixa: 'bg-green-500 text-white',
  }
  return colors[prioridade] || 'bg-gray-500 text-white'
}

// Função para obter cor do status
export const getStatusColor = (status) => {
  const colors = {
    pendente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    alocado: 'bg-blue-100 text-blue-800 border-blue-300',
    em_deslocamento: 'bg-purple-100 text-purple-800 border-purple-300',
    concluido: 'bg-green-100 text-green-800 border-green-300',
    cancelado: 'bg-gray-100 text-gray-800 border-gray-300',
  }
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300'
}

// Função para obter label do status
export const getStatusLabel = (status) => {
  const labels = {
    pendente: 'Triagem',
    alocado: 'Alocado',
    em_deslocamento: 'Em Deslocamento',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
  }
  return labels[status] || status
}

// Função para obter cor do pin no mapa baseado na prioridade
export const getPinColor = (prioridade) => {
  const colors = {
    urgente: 'red',
    alta: 'orange',
    media: 'yellow',
    baixa: 'green',
  }
  return colors[prioridade] || 'gray'
}
