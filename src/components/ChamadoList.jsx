import { useMemo } from 'react'
import ChamadoCard from './ChamadoCard'

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

      return true
    })
  }, [chamados, filters])

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
