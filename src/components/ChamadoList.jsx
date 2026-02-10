import { useMemo, useState, useEffect } from 'react'
import ChamadoCard from './ChamadoCard'
import { calcularTempoEspera } from '../services/chamadoMockService'

/**
 * Componente de lista de chamados com filtros
 * Área 2 da tela única
 */
const ChamadoList = ({ 
  chamados, 
  onChangeStatus, 
  onMarkUrgent,
  onCancel,
  onEdit,
  onOpenMaps,
  filters
}) => {
  // Estado para forçar atualização dos filtros quando o tempo mudar
  const [updateKey, setUpdateKey] = useState(0)

  // Atualiza a cada minuto para recalcular os filtros
  useEffect(() => {
    const interval = setInterval(() => {
      setUpdateKey(prev => prev + 1)
    }, 60000) // Atualiza a cada minuto

    return () => clearInterval(interval)
  }, [])

  // Filtra chamados baseado nos filtros
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

      // Filtro de status
      if (filters.status !== 'todos' && chamado.status !== filters.status) {
        return false
      }

      // Filtro de prioridade
      if (filters.prioridade !== 'todos' && chamado.prioridade !== filters.prioridade) {
        return false
      }

      // Filtro de tempo de espera (calculado dinamicamente)
      if (filters.tempoEspera && filters.tempoEspera !== 'todos') {
        const tempoEspera = calcularTempoEspera(chamado.criadoEm)
        switch (filters.tempoEspera) {
          case '0-5':
            if (tempoEspera > 5) return false
            break
          case '5-15':
            if (tempoEspera <= 5 || tempoEspera > 15) return false
            break
          case '15-30':
            if (tempoEspera <= 15 || tempoEspera > 30) return false
            break
          case '30+':
            if (tempoEspera <= 30) return false
            break
        }
      }

      return true
    })
  }, [chamados, filters, updateKey])

  return (
    <div id="chamado-list" className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Chamados ({filteredChamados.length})
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        {filteredChamados.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum chamado encontrado</p>
          </div>
        ) : (
          filteredChamados.map((chamado) => (
            <ChamadoCard
              key={chamado.id}
              chamado={chamado}
              onChangeStatus={onChangeStatus}
              onMarkUrgent={onMarkUrgent}
              onCancel={onCancel}
              onEdit={onEdit}
              onOpenMaps={onOpenMaps}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default ChamadoList
