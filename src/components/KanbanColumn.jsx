import { useState, useRef, useEffect } from 'react'
import KanbanCard from './KanbanCard'
import { IconMenu, IconSettings, IconEdit, IconClose, IconCheck } from './Icons'

/**
 * Componente de coluna do Kanban
 */
const KanbanColumn = ({ 
  column, 
  chamados, 
  onMarkUrgent,
  onCancel,
  onEdit,
  onOpenMaps,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onDeleteColumn,
  onEditColumn,
  onColumnColorChange,
  onColumnDragStart,
  onColumnDragOver,
  onColumnDragLeave,
  onColumnDrop,
  onColumnDragEnd,
  isDraggingColumn
}) => {
  const columnChamados = chamados.filter(c => c.status === column.id)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(column.name)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const colorPickerRef = useRef(null)
  const dragTrackers = useRef(new Map())
  
  // Cores disponíveis
  const availableColors = [
    { name: 'Padrão', value: null, class: 'bg-gray-200 border-t-gray-300' },
    { name: 'Vermelho', value: 'red', class: 'bg-red-200 border-t-red-500' },
    { name: 'Azul', value: 'blue', class: 'bg-blue-200 border-t-blue-500' },
    { name: 'Verde', value: 'green', class: 'bg-green-200 border-t-green-500' },
    { name: 'Amarelo', value: 'yellow', class: 'bg-yellow-200 border-t-yellow-500' },
    { name: 'Roxo', value: 'purple', class: 'bg-purple-200 border-t-purple-500' },
    { name: 'Laranja', value: 'orange', class: 'bg-orange-200 border-t-orange-500' },
    { name: 'Rosa', value: 'pink', class: 'bg-pink-200 border-t-pink-500' },
    { name: 'Cinza', value: 'gray', class: 'bg-gray-200 border-t-gray-400' },
  ]

  // Fecha o color picker ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setShowColorPicker(false)
      }
    }
    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showColorPicker])

  const getTopBorderColor = (color) => {
    if (!color) return 'border-t-gray-300'
    const colorMap = {
      red: 'border-t-red-500',
      blue: 'border-t-blue-500',
      green: 'border-t-green-500',
      yellow: 'border-t-yellow-500',
      purple: 'border-t-purple-500',
      orange: 'border-t-orange-500',
      pink: 'border-t-pink-500',
      gray: 'border-t-gray-400',
    }
    return colorMap[color] || 'border-t-gray-300'
  }

  const getCardBorderColor = (color) => {
    if (!color) return 'border-gray-300'
    const colorMap = {
      red: 'border-red-500',
      blue: 'border-blue-500',
      green: 'border-green-500',
      yellow: 'border-yellow-500',
      purple: 'border-purple-500',
      orange: 'border-orange-500',
      pink: 'border-pink-500',
      gray: 'border-gray-400',
    }
    return colorMap[color] || 'border-gray-300'
  }

  const handleSaveEdit = () => {
    if (editName.trim() && onEditColumn) {
      onEditColumn(column.id, editName.trim())
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setEditName(column.name)
    setIsEditing(false)
  }

  const columnColor = column.color || null
  const topBorderColor = getTopBorderColor(columnColor)

  return (
    <div
      className={`bg-gray-50 rounded-lg p-3 min-w-[280px] flex flex-col h-full transition-all border-t-4 ${topBorderColor} ${
        isDraggingColumn ? 'opacity-50 scale-95' : ''
      }`}
      onDragOver={(e) => {
        // Verifica se é drag de coluna (verifica types primeiro, mais confiável)
        if (e.dataTransfer.types.includes('column-id') || e.dataTransfer.types.includes('text/plain')) {
          e.preventDefault()
          e.stopPropagation()
          onColumnDragOver && onColumnDragOver(e, column)
        }
      }}
      onDragLeave={(e) => {
        // Verifica se é drag de coluna
        if (e.dataTransfer.types.includes('column-id') || e.dataTransfer.types.includes('text/plain')) {
          e.stopPropagation()
          onColumnDragLeave && onColumnDragLeave(e)
        }
      }}
      onDrop={(e) => {
        // Verifica se é drag de coluna
        if (e.dataTransfer.types.includes('column-id') || e.dataTransfer.types.includes('text/plain')) {
          e.preventDefault()
          e.stopPropagation()
          onColumnDrop && onColumnDrop(e, column)
        }
      }}
    >
      {/* Header da Coluna */}
      <div 
        className="flex justify-between items-center mb-3 pb-2 border-b border-gray-300 cursor-move hover:bg-gray-100 rounded px-1 -mx-1 transition-colors"
        draggable
        onDragStart={(e) => {
          e.stopPropagation()
          onColumnDragStart && onColumnDragStart(e, column)
        }}
        onDragEnd={(e) => {
          e.stopPropagation()
          onColumnDragEnd && onColumnDragEnd(e)
        }}
        title="Arraste para reordenar colunas"
      >
        <div className="flex items-center gap-1 text-gray-400 mr-1">
          <IconMenu className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-1 flex-1">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSaveEdit()
                  if (e.key === 'Escape') handleCancelEdit()
                }}
                onBlur={handleSaveEdit}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 px-2 py-1 text-sm font-semibold border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleSaveEdit()
                }}
                className="text-green-600 hover:text-green-700 text-sm"
                title="Salvar"
              >
                <IconCheck className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleCancelEdit()
                }}
                className="text-red-600 hover:text-red-700 text-sm"
                title="Cancelar"
              >
                <IconClose className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <h3 
                className={`font-semibold truncate ${
                  column.editable === false ? 'text-gray-600' : 'text-gray-800'
                }`}
                title={column.name}
              >
                {column.name}
              </h3>
              <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                {columnChamados.length}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 relative">
          {!isEditing && (
            <>
              {/* Botão de configuração de cor */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowColorPicker(!showColorPicker)
                }}
                className="text-gray-400 hover:text-purple-600 text-sm"
                title="Configurar cor"
              >
                <IconSettings className="w-4 h-4" />
              </button>
              
              {/* Color Picker Dropdown */}
              {showColorPicker && (
                <div
                  ref={colorPickerRef}
                  className="absolute top-full right-0 mt-1 bg-white rounded-lg border border-gray-200 p-2 z-[100] min-w-[180px]"
                  onClick={(e) => e.stopPropagation()}
                  style={{ zIndex: 9999 }}
                >
                  <div className="text-xs font-semibold text-gray-700 mb-2">Cor da Coluna</div>
                  <div className="grid grid-cols-4 gap-2">
                    {availableColors.map((color) => (
                      <button
                        key={color.value || 'default'}
                        onClick={() => {
                          onColumnColorChange && onColumnColorChange(column.id, color.value)
                          setShowColorPicker(false)
                        }}
                        className={`w-8 h-8 rounded border-2 ${
                          color.class
                        } ${
                          columnColor === color.value ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                        } hover:scale-110 transition-transform`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Botão de editar - não aparece para colunas não editáveis */}
              {column.editable !== false && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsEditing(true)
                  }}
                  className="text-gray-400 hover:text-blue-600 text-sm"
                  title="Editar nome"
                >
                  <IconEdit className="w-4 h-4" />
                </button>
              )}
              {/* Botão de deletar - apenas para colunas customizadas */}
              {column.custom && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteColumn && onDeleteColumn(column.id)
                  }}
                  className="text-gray-400 hover:text-red-600 text-sm"
                  title="Remover coluna"
                >
                  <IconClose className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Cards da Coluna */}
      <div 
        className="flex-1 overflow-y-auto space-y-2 min-h-[100px]"
        onDragOver={(e) => {
          // Só processa se for drag de card, não de coluna
          const isColumnDrag = e.dataTransfer.types.includes('column-id')
          if (!isColumnDrag) {
            e.preventDefault()
            e.stopPropagation()
            onDragOver(e)
          }
        }}
        onDragLeave={(e) => {
          const isColumnDrag = e.dataTransfer.types.includes('column-id')
          if (!isColumnDrag) {
            e.stopPropagation()
            onDragLeave(e)
          }
        }}
        onDrop={(e) => {
          // Só processa se for drag de card
          const isColumnDrag = e.dataTransfer.types.includes('column-id')
          if (!isColumnDrag) {
            e.preventDefault()
            e.stopPropagation()
            onDrop(e, column.id)
          }
        }}
      >
        {columnChamados.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            <p>Arraste chamados aqui</p>
          </div>
        ) : (
          columnChamados.map((chamado) => {
            if (!dragTrackers.current.has(chamado.id)) {
              dragTrackers.current.set(chamado.id, { dragged: false })
            }
            const tracker = dragTrackers.current.get(chamado.id)
            
            return (
              <div
                key={chamado.id}
                draggable
                onDragStart={(e) => {
                  e.stopPropagation()
                  tracker.dragged = true
                  onDragStart(e, chamado)
                }}
                onDragEnd={(e) => {
                  onDragEnd(e)
                  // Reset após um pequeno delay
                  setTimeout(() => {
                    tracker.dragged = false
                  }, 200)
                }}
                onMouseDown={(e) => {
                  // Reset flag quando mouse é pressionado
                  tracker.dragged = false
                }}
                onClick={(e) => {
                  // Só abre edição se não foi um drag
                  if (!tracker.dragged && onEdit) {
                    onEdit(chamado)
                  }
                }}
                className="cursor-move"
              >
                <KanbanCard
                  chamado={chamado}
                  onMarkUrgent={onMarkUrgent}
                  onCancel={onCancel}
                  onEdit={null} // Remove onClick do card, será tratado no wrapper
                  onOpenMaps={onOpenMaps}
                  columnColor={columnColor}
                />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default KanbanColumn
