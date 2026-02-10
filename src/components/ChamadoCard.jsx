import { useState, useEffect } from 'react'
import { getPrioridadeColor, getStatusColor, getStatusLabel, calcularTempoEspera, formatarTempoEspera } from '../services/chamadoMockService'
import { IconLocation, IconHospital, IconWhatsApp } from './Icons'

/**
 * Componente de card para exibir um chamado
 * Mostra informações principais e ações rápidas
 */
const ChamadoCard = ({ 
  chamado, 
  onChangeStatus, 
  onMarkUrgent,
  onCancel,
  onEdit,
  onOpenMaps
}) => {
  const prioridadeColor = getPrioridadeColor(chamado.prioridade)
  const statusColor = getStatusColor(chamado.status)
  const [tempoEspera, setTempoEspera] = useState(() => calcularTempoEspera(chamado.criadoEm))

  // Atualiza o tempo de espera a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setTempoEspera(calcularTempoEspera(chamado.criadoEm))
    }, 60000) // Atualiza a cada minuto

    return () => clearInterval(interval)
  }, [chamado.criadoEm])

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
      className={`bg-white rounded-lg p-4 mb-3 border-l-4 ${
        chamado.prioridade === 'urgente' ? 'border-red-600' : 'border-gray-300'
      } transition-shadow cursor-pointer hover:bg-gray-50`}
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-800">{chamado.paciente}</h3>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-600">{chamado.telefone}</p>
            <button
              onClick={handleWhatsAppClick}
              className="flex-shrink-0 text-green-600 hover:text-green-700 transition-colors"
              title="Abrir WhatsApp"
              aria-label="Abrir WhatsApp"
            >
              <IconWhatsApp className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className={`px-2 py-1 rounded text-xs font-semibold ${prioridadeColor}`}>
            {chamado.prioridade.toUpperCase()}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-semibold border ${statusColor}`}>
            {getStatusLabel(chamado.status)}
          </span>
        </div>
      </div>

      <div className="mb-3 space-y-1">
        <p className="text-sm text-gray-700 flex items-start gap-2">
          <IconLocation className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span><span className="font-semibold">Endereço:</span> {chamado.endereco}</span>
        </p>
        <p className="text-sm text-gray-700 flex items-start gap-2">
          <IconHospital className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            <span className="font-semibold">Destino:</span>{' '}
            <span 
              onClick={handleDestinoClick}
              className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              title="Clique para abrir no Google Maps"
            >
              {chamado.destino}
            </span>
          </span>
        </p>
        {chamado.observacoes && (
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Observações:</span> {chamado.observacoes}
          </p>
        )}
      </div>

      <div className="flex flex-wrap justify-between items-center gap-2 pt-2 border-t">
        <span className="text-xs text-gray-500">
          Tempo de espera: {formatarTempoEspera(tempoEspera)}
        </span>
        <div className="flex flex-wrap gap-2">
          {chamado.status !== 'cancelado' && onCancel && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCancel(chamado.id)
              }}
              className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 font-medium"
            >
              Cancelar
            </button>
          )}
          {onChangeStatus && (
            <select
              value={chamado.status}
              onChange={(e) => {
                e.stopPropagation()
                onChangeStatus(chamado.id, e.target.value)
              }}
              onClick={(e) => e.stopPropagation()}
              className="px-2 py-1 text-xs border rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pendente">Triagem</option>
              <option value="alocado">Alocado</option>
              <option value="em_deslocamento">Em Deslocamento</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChamadoCard
