import { useState, useEffect, useRef } from 'react'
import { useChamados } from './hooks/useChamados'
import ChamadoForm from './components/ChamadoForm'
import ChamadoList from './components/ChamadoList'
import KanbanBoard from './components/KanbanBoard'
import Login from './components/Login'
import GoogleMapsModal from './components/GoogleMapsModal'
import { IconKanban, IconList, IconLogout, IconChevronDown, IconPlus, IconCheck } from './components/Icons'
import { STATUS_OPTIONS, PRIORIDADE_OPTIONS } from './services/chamadoMockService'

// Error Boundary simples
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false)
  
  useEffect(() => {
    const handleError = (error) => {
      console.error('Erro capturado:', error)
      setHasError(true)
    }
    
    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])
  
  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Erro ao carregar aplicação</h2>
          <p className="text-gray-600 mb-4">Verifique o console do navegador para mais detalhes.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Recarregar Página
          </button>
        </div>
      </div>
    )
  }
  
  return children
}

/**
 * App principal - Tela única com 2 áreas:
 * 1. Formulário de criação (modal)
 * 2. Lista de chamados (centro)
 */
function App() {
  const { chamados, createChamado, updateChamado, markAsUrgent, cancelChamado } = useChamados()
  
  // Tratamento de erro básico
  if (!chamados) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Carregando...</p>
      </div>
    )
  }
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'todos',
    prioridade: 'todos',
  })
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Verifica se já está autenticado (salvo no localStorage)
    try {
      return localStorage.getItem('isAuthenticated') === 'true'
    } catch {
      return false
    }
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [chamadoEdicao, setChamadoEdicao] = useState(null)
  const [isMapsModalOpen, setIsMapsModalOpen] = useState(false)
  const [mapsEndereco, setMapsEndereco] = useState(null)
  const [viewMode, setViewMode] = useState('kanban') // 'kanban' ou 'lista'
  const [showViewMenu, setShowViewMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const viewMenuRef = useRef(null)
  const userMenuRef = useRef(null)

  // Fecha o menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (viewMenuRef.current && !viewMenuRef.current.contains(event.target)) {
        setShowViewMenu(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }
    if (showViewMenu || showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showViewMenu, showUserMenu])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleSearchChange = (value) => {
    setFilters((prev) => ({ ...prev, search: value }))
  }

  const handleCreateChamado = (chamadoData) => {
    createChamado(chamadoData)
    // Feedback visual - scroll suave para o novo chamado
    setTimeout(() => {
      document.getElementById('chamado-list')?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      })
    }, 100)
  }

  const handleOpenModal = () => {
    setChamadoEdicao(null) // Limpa edição ao criar novo
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setChamadoEdicao(null) // Limpa edição ao fechar
  }

  const handleEditChamado = (chamado) => {
    setChamadoEdicao(chamado)
    setIsModalOpen(true)
  }

  const handleOpenMaps = (endereco) => {
    setMapsEndereco(endereco)
    setIsMapsModalOpen(true)
  }

  const handleCloseMaps = () => {
    setIsMapsModalOpen(false)
    setMapsEndereco(null)
  }

  const handleChangeStatus = (id, newStatus) => {
    // Se estiver mudando para cancelado e vier da lista (não do Kanban), pede confirmação
    if (newStatus === 'cancelado' && viewMode === 'lista') {
      const chamado = chamados.find(c => c.id === id)
      if (chamado) {
        const confirmMessage = `Deseja realmente cancelar o chamado de ${chamado.paciente}?`
        if (!confirm(confirmMessage)) {
          return // Cancela a operação se o usuário não confirmar
        }
      }
    }
    updateChamado(id, { status: newStatus })
  }

  const handleMarkUrgent = (id) => {
    markAsUrgent(id)
  }

  const handleCancel = (id) => {
    if (confirm('Deseja realmente cancelar este chamado?')) {
      cancelChamado(id)
    }
  }

  const handleLogin = (credentials) => {
    // Login simples sem validação - apenas salva no localStorage
    localStorage.setItem('isAuthenticated', 'true')
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    // Remove autenticação e volta para login
    localStorage.removeItem('isAuthenticated')
    setIsAuthenticated(false)
  }

  // Se não estiver autenticado, mostra a tela de login
  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <Login onLogin={handleLogin} />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-full mx-auto px-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Esquerda: Título */}
            <div className="text-center md:text-left">
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Central de Ambulâncias</h1>
              <p className="text-xs md:text-sm text-gray-600">Sistema de Gerenciamento de Chamados</p>
            </div>
            
            {/* Centro: Busca */}
            <div className="flex justify-center order-3 md:order-2">
              <div className="w-full max-w-md">
                <input
                  type="text"
                  placeholder="Buscar por nome ou telefone..."
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Direita: Avatar */}
            <div className="flex justify-center md:justify-end order-2 md:order-3">
              <div className="relative" ref={userMenuRef}>
                <div 
                  className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-lg cursor-pointer hover:bg-blue-700 transition-colors" 
                  title="Usuário"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <span>U</span>
                </div>
                
                {/* Menu Dropdown do Usuário */}
                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-lg border border-gray-200 py-2 min-w-[150px] z-50">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors text-gray-700"
                    >
                      <IconLogout className="w-4 h-4" />
                      <span>Sair</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </header>

      {/* Segundo Header - Visualização */}
      <header className="bg-white border-b border-gray-200 fixed top-[72px] left-0 right-0 z-[9]">
        <div className="max-w-full mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Esquerda: Ícone Kanban com Menu */}
            <div className="relative flex-shrink-0" ref={viewMenuRef}>
              <button
                onClick={() => setShowViewMenu(!showViewMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                title="Escolher visualização"
              >
                {viewMode === 'kanban' ? <IconKanban className="w-5 h-5" /> : <IconList className="w-5 h-5" />}
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                  {viewMode === 'kanban' ? 'Kanban' : 'Lista'}
                </span>
                <IconChevronDown className="w-3 h-3 text-gray-500" />
              </button>
              
              {/* Menu Dropdown */}
              {showViewMenu && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg border border-gray-200 py-2 min-w-[150px] z-50">
                  <button
                    onClick={() => {
                      setViewMode('kanban')
                      setShowViewMenu(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors ${
                      viewMode === 'kanban' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                    }`}
                  >
                    <IconKanban className="w-4 h-4" />
                    <span>Kanban</span>
                    {viewMode === 'kanban' && <IconCheck className="ml-auto w-4 h-4 text-blue-600" />}
                  </button>
                  <button
                    onClick={() => {
                      setViewMode('lista')
                      setShowViewMenu(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors ${
                      viewMode === 'lista' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                    }`}
                  >
                    <IconList className="w-4 h-4" />
                    <span>Lista</span>
                    {viewMode === 'lista' && <IconCheck className="ml-auto w-4 h-4 text-blue-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* Centro: Filtros Status e Prioridade */}
            <div className="flex items-center gap-3 flex-1 justify-center min-w-0">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700 whitespace-nowrap hidden md:inline">Status:</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[120px]"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700 whitespace-nowrap hidden md:inline">Prioridade:</label>
                <select
                  value={filters.prioridade}
                  onChange={(e) => handleFilterChange('prioridade', e.target.value)}
                  className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[140px]"
                >
                  {PRIORIDADE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Direita: Botão Novo Chamado */}
            <div className="flex items-center flex-shrink-0">
              <button
                onClick={handleOpenModal}
                className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium transition-colors flex items-center gap-1 text-sm"
              >
                <IconPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Novo Chamado</span>
                <span className="sm:hidden">Novo</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Tela Única */}
      <div className="max-w-full mx-auto p-4" style={{ marginTop: '50px' }}>

        {/* Área de Chamados */}
        <div className="max-w-full mx-auto">
          <div className="bg-white rounded-lg p-4" style={{ minHeight: 'calc(100vh - 250px)' }}>
            {viewMode === 'kanban' ? (
              <KanbanBoard
                chamados={chamados}
                onChangeStatus={handleChangeStatus}
                onMarkUrgent={handleMarkUrgent}
                onCancel={handleCancel}
                onEdit={handleEditChamado}
                onOpenMaps={handleOpenMaps}
                filters={filters}
              />
            ) : (
              <ChamadoList
                chamados={chamados}
                onChangeStatus={handleChangeStatus}
                onMarkUrgent={handleMarkUrgent}
                onCancel={handleCancel}
                onEdit={handleEditChamado}
                onOpenMaps={handleOpenMaps}
                filters={filters}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal de Criar/Editar Chamado */}
      <ChamadoForm 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCreateChamado={handleCreateChamado}
        chamadoEdicao={chamadoEdicao}
        onUpdateChamado={updateChamado}
      />

      {/* Modal do Google Maps */}
      <GoogleMapsModal
        isOpen={isMapsModalOpen}
        onClose={handleCloseMaps}
        endereco={mapsEndereco}
      />
    </div>
    </ErrorBoundary>
  )
}

export default App
