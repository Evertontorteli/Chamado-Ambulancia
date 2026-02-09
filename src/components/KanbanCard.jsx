import { getPrioridadeColor, getStatusColor, getStatusLabel } from '../services/chamadoMockService'
import { IconLocation, IconHospital, IconWhatsApp } from './Icons'

/**
 * Componente de card para exibir um chamado no Kanban
 * Versão simplificada para drag and drop
 */
const KanbanCard = ({ 
  chamado, 
  onMarkUrgent,
  onCancel,
  columnColor,
  onEdit,
  onOpenMaps
}) => {
  const prioridadeColor = getPrioridadeColor(chamado.prioridade)
  const statusColor = getStatusColor(chamado.status)

  // Determina a cor da borda do card
  const getCardBorderColor = () => {
    // Se a coluna tem cor, usa a cor da coluna
    if (columnColor) {
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
      return colorMap[columnColor] || 'border-gray-300'
    }
    // Caso contrário, usa a prioridade (urgente = vermelho)
    return chamado.prioridade === 'urgente' ? 'border-red-600' : 'border-gray-300'
  }

  const handleCardClick = () => {
    if (onEdit) {
      onEdit(chamado)
    }
  }

  const handleDestinoClick = (e) => {
    e.stopPropagation() // Impede que abra o modal de edição
    if (chamado.destino && onOpenMaps) {
      onOpenMaps(chamado.destino)
    }
  }

  const handleWhatsAppClick = (e) => {
    e.stopPropagation() // Impede que abra o modal de edição
    // Remove caracteres não numéricos do telefone
    const phoneNumber = chamado.telefone.replace(/\D/g, '')
    // Abre WhatsApp com o número formatado
    window.open(`https://wa.me/${phoneNumber}`, '_blank')
  }

  return (
    <div
      id={`chamado-${chamado.id}`}
      className={`bg-white rounded-lg p-3 mb-2 border-l-4 ${getCardBorderColor()} transition-shadow cursor-pointer hover:bg-gray-50`}
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-gray-800 truncate">{chamado.paciente}</h3>
          <div className="flex items-center gap-1.5">
            <p className="text-xs text-gray-600">{chamado.telefone}</p>
            <button
              onClick={handleWhatsAppClick}
              className="flex-shrink-0 text-green-600 hover:text-green-700 transition-colors"
              title="Abrir WhatsApp"
              aria-label="Abrir WhatsApp"
            >
              <IconWhatsApp className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${prioridadeColor}`}>
            {chamado.prioridade.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="mb-2 space-y-1">
        <p className="text-xs text-gray-700 truncate flex items-center gap-1">
          <IconLocation className="w-3 h-3 flex-shrink-0" />
          <span>{chamado.endereco}</span>
        </p>
        <p className="text-xs text-gray-700 truncate flex items-center gap-1">
          <IconHospital className="w-3 h-3 flex-shrink-0" />
          <span 
            onClick={handleDestinoClick}
            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            title="Clique para abrir no Google Maps"
          >
            {chamado.destino}
          </span>
        </p>
      </div>

      <div className="flex flex-wrap gap-1 pt-2 border-t">
        {chamado.status !== 'cancelado' && onCancel && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onCancel(chamado.id)
            }}
            className="px-2 py-0.5 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 font-medium"
          >
            Cancelar
          </button>
        )}
        <span className="text-xs text-gray-500 ml-auto">
          {chamado.tempoEspera} min
        </span>
      </div>
    </div>
  )
}

export default KanbanCard
