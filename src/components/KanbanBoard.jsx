import { useState, useMemo, useEffect, useRef } from 'react'
import KanbanColumn from './KanbanColumn'
import { IconPlus } from './Icons'

/**
 * Componente de board Kanban
 * Permite criar colunas e mover cards entre elas
 */
const KanbanBoard = ({ 
  chamados, 
  onChangeStatus,
  onMarkUrgent,
  onCancel,
  onEdit,
  onOpenMaps,
  filters
}) => {
  // Wrapper para onChangeStatus que adiciona confirmação para cancelado
  const handleStatusChangeWithConfirm = (id, newStatus) => {
    if (newStatus === 'cancelado') {
      const chamado = chamados.find(c => c.id === id)
      if (chamado) {
        const confirmMessage = `Deseja realmente cancelar o chamado de ${chamado.paciente}?`
        if (confirm(confirmMessage)) {
          onChangeStatus(id, newStatus)
        }
      }
    } else {
      onChangeStatus(id, newStatus)
    }
  }
  // Colunas padrão baseadas nos status
  const defaultColumns = [
    { id: 'pendente', name: 'Triagem', custom: false, editable: true, color: 'red' },
    { id: 'alocado', name: 'Alocado', custom: false, editable: true, color: 'blue' },
    { id: 'em_deslocamento', name: 'Em Deslocamento', custom: false, editable: true, color: 'purple' },
    { id: 'concluido', name: 'Concluído', custom: false, editable: true, color: 'green' },
    { id: 'cancelado', name: 'Cancelado', custom: false, editable: false, color: 'gray' },
  ]

  const [columns, setColumns] = useState(() => {
    // Carrega colunas do localStorage ou usa padrão
    try {
      const saved = localStorage.getItem('kanban-columns')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Garante que a coluna de cancelados sempre existe
          const hasCancelado = parsed.some(col => col.id === 'cancelado')
          if (!hasCancelado) {
            parsed.push({ id: 'cancelado', name: 'Cancelado', custom: false, editable: false, color: 'gray' })
          }
          // Garante que todas as colunas padrão tenham as propriedades necessárias e cores padrão
          const defaultColorMap = {
            pendente: 'red',
            alocado: 'blue',
            em_deslocamento: 'purple',
            concluido: 'green',
            cancelado: 'gray'
          }
          // Mapeia nomes padrão para garantir consistência
          const defaultNames = {
            pendente: 'Triagem',
            alocado: 'Alocado',
            em_deslocamento: 'Em Deslocamento',
            concluido: 'Concluído',
            cancelado: 'Cancelado'
          }
          return parsed.map(col => {
            if (col.id === 'cancelado') {
              return { ...col, editable: false, color: col.color || defaultColorMap[col.id] || null, name: defaultNames[col.id] || col.name }
            }
            // Atualiza o nome se for uma coluna padrão (sempre atualiza colunas padrão, mesmo se custom foi alterado)
            const updatedCol = { ...col, editable: col.editable !== false, color: col.color || defaultColorMap[col.id] || null }
            // Sempre atualiza o nome das colunas padrão para garantir consistência
            if (defaultNames[col.id]) {
              updatedCol.name = defaultNames[col.id]
            }
            return updatedCol
          })
        }
      }
    } catch (error) {
      console.error('Erro ao carregar colunas:', error)
    }
    return defaultColumns
  })

  const [draggedChamado, setDraggedChamado] = useState(null)
  const [draggedColumn, setDraggedColumn] = useState(null)
  const draggedColumnIdRef = useRef(null) // Ref para armazenar ID da coluna sendo arrastada
  const [newColumnName, setNewColumnName] = useState('')
  const [showAddColumn, setShowAddColumn] = useState(false)

  // Salva colunas no localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kanban-columns', JSON.stringify(columns))
    } catch (error) {
      console.error('Erro ao salvar colunas:', error)
    }
  }, [columns])

  // Filtra chamados baseado nos filtros
  // Nota: O filtro de status não é aplicado aqui porque as colunas já representam os status
  const filteredChamados = useMemo(() => {
    return chamados.filter((chamado) => {
      // Filtro de busca
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          chamado.paciente.toLowerCase().includes(searchLower) ||
          chamado.telefone.includes(filters.search)
        if (!matchesSearch) return false
      }

      // Filtro de prioridade
      if (filters.prioridade !== 'todos' && chamado.prioridade !== filters.prioridade) {
        return false
      }

      return true
    })
  }, [chamados, filters])

  const handleDragStart = (e, chamado) => {
    setDraggedChamado(chamado)
    e.dataTransfer.effectAllowed = 'move'
    e.currentTarget.style.opacity = '0.5'
  }

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1'
    setDraggedChamado(null)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    e.currentTarget.style.backgroundColor = '#e5e7eb'
  }

  const handleDragLeave = (e) => {
    e.currentTarget.style.backgroundColor = '#f9fafb'
  }

  const handleDrop = (e, columnId) => {
    e.preventDefault()
    e.currentTarget.style.backgroundColor = '#f9fafb'
    if (draggedChamado && draggedChamado.status !== columnId) {
      handleStatusChangeWithConfirm(draggedChamado.id, columnId)
    }
    setDraggedChamado(null)
  }

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      const newColumn = {
        id: `custom-${Date.now()}`,
        name: newColumnName.trim(),
        custom: true,
        editable: true,
        color: null
      }
      setColumns([...columns, newColumn])
      setNewColumnName('')
      setShowAddColumn(false)
    }
  }

  const handleDeleteColumn = (columnId) => {
    // Não permite deletar colunas padrão (incluindo cancelado)
    const column = columns.find(c => c.id === columnId)
    if (!column || !column.custom) {
      return
    }
    
    if (confirm('Deseja realmente remover esta coluna? Os chamados serão movidos para "Triagem".')) {
      // Move chamados da coluna para pendente
      filteredChamados
        .filter(c => c.status === columnId)
        .forEach(chamado => {
          onChangeStatus(chamado.id, 'pendente')
        })
      
      // Remove a coluna
      setColumns(columns.filter(c => c.id !== columnId))
    }
  }

  const handleEditColumn = (columnId, newName) => {
    // Não permite editar a coluna de cancelados
    const column = columns.find(col => col.id === columnId)
    if (column && column.editable !== false) {
      setColumns(columns.map(col => 
        col.id === columnId ? { ...col, name: newName } : col
      ))
    }
  }

  const handleColumnColorChange = (columnId, color) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, color: color } : col
    ))
  }

  // Handlers para drag and drop de colunas
  const handleColumnDragStart = (e, column) => {
    setDraggedColumn(column)
    draggedColumnIdRef.current = column.id // Armazena em ref para acesso durante dragOver
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('column-id', column.id)
    e.dataTransfer.setData('text/plain', '') // Limpa para evitar conflito
    // Aplica estilo ao elemento pai (a coluna inteira)
    const columnElement = e.currentTarget.closest('.bg-gray-50')
    if (columnElement) {
      columnElement.style.opacity = '0.5'
      columnElement.style.transform = 'scale(0.95)'
    }
  }

  const handleColumnDragOver = (e, targetColumn) => {
    e.preventDefault()
    e.stopPropagation()
    const draggedId = draggedColumnIdRef.current || e.dataTransfer.getData('column-id')
    if (draggedId && draggedId !== targetColumn.id) {
      const columnElement = e.currentTarget.closest('.bg-gray-50')
      if (columnElement) {
        columnElement.style.borderLeft = '3px solid #3b82f6'
        columnElement.style.transform = 'translateX(5px)'
      }
    }
  }

  const handleColumnDragLeave = (e) => {
    const columnElement = e.currentTarget.closest('.bg-gray-50')
    if (columnElement) {
      columnElement.style.borderLeft = 'none'
      columnElement.style.transform = 'translateX(0)'
    }
  }

  const handleColumnDrop = (e, targetColumn) => {
    e.preventDefault()
    e.stopPropagation()
    
    const columnElement = e.currentTarget.closest('.bg-gray-50')
    if (columnElement) {
      columnElement.style.borderLeft = 'none'
      columnElement.style.transform = 'translateX(0)'
    }
    
    const draggedId = draggedColumnIdRef.current || e.dataTransfer.getData('column-id')
    if (draggedId && draggedId !== targetColumn.id) {
      const draggedIndex = columns.findIndex(c => c.id === draggedId)
      const targetIndex = columns.findIndex(c => c.id === targetColumn.id)
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newColumns = [...columns]
        const [removed] = newColumns.splice(draggedIndex, 1)
        newColumns.splice(targetIndex, 0, removed)
        
        setColumns(newColumns)
      }
    }
    
    // Restaura opacidade de todas as colunas
    document.querySelectorAll('.bg-gray-50').forEach(el => {
      el.style.opacity = '1'
      el.style.transform = 'scale(1)'
    })
    
    setDraggedColumn(null)
    draggedColumnIdRef.current = null
  }

  const handleColumnDragEnd = (e) => {
    // Restaura opacidade de todas as colunas
    document.querySelectorAll('.bg-gray-50').forEach(el => {
      el.style.opacity = '1'
      el.style.transform = 'scale(1)'
      el.style.borderLeft = 'none'
    })
    setDraggedColumn(null)
    draggedColumnIdRef.current = null
  }

  return (
    <div className="h-full flex flex-col">
      {/* Controles */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">
          Chamados ({filteredChamados.length})
        </h2>
        <div className="flex gap-2">
          {showAddColumn ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nome da coluna..."
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddColumn()}
                className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                autoFocus
              />
              <button
                onClick={handleAddColumn}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                Adicionar
              </button>
              <button
                onClick={() => {
                  setShowAddColumn(false)
                  setNewColumnName('')
                }}
                className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm font-medium"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddColumn(true)}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium flex items-center gap-1"
            >
              <IconPlus className="w-4 h-4" />
              <span>Nova Coluna</span>
            </button>
          )}
        </div>
      </div>

      {/* Board Kanban */}
      <div className="flex-1 overflow-x-auto pb-4" style={{ maxHeight: 'calc(100vh - 350px)' }}>
        <div className="flex gap-4 h-full min-w-max" style={{ minHeight: '500px' }}>
          {columns
            .filter((column) => {
              // Se o filtro de status for "todos", mostra todas as colunas
              if (filters.status === 'todos') return true
              // Caso contrário, mostra apenas a coluna correspondente ao status filtrado
              return column.id === filters.status
            })
            .map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                chamados={filteredChamados}
                onMarkUrgent={onMarkUrgent}
                onCancel={onCancel}
                onEdit={onEdit}
                onOpenMaps={onOpenMaps}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onDeleteColumn={handleDeleteColumn}
                onEditColumn={handleEditColumn}
                onColumnColorChange={handleColumnColorChange}
                onColumnDragStart={handleColumnDragStart}
                onColumnDragOver={handleColumnDragOver}
                onColumnDragLeave={handleColumnDragLeave}
                onColumnDrop={handleColumnDrop}
                onColumnDragEnd={handleColumnDragEnd}
                isDraggingColumn={draggedColumn?.id === column.id}
              />
            ))}
        </div>
      </div>
    </div>
  )
}

export default KanbanBoard
