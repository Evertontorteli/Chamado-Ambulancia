import { useState, useEffect, useCallback } from 'react'
import { initialChamados, mockGeocode } from '../services/chamadoMockService'

/**
 * Hook customizado para gerenciamento de chamados
 * Gerencia estado local e persiste no localStorage
 */
export const useChamados = () => {
  const [chamados, setChamados] = useState(() => {
    // Carrega chamados do localStorage ou usa dados iniciais
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('chamados')
        if (saved && saved !== '[]' && saved !== 'null') {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar chamados:', error)
    }
    return initialChamados
  })

  // Salva chamados no localStorage sempre que mudarem
  useEffect(() => {
    if (chamados && chamados.length >= 0) {
      try {
        localStorage.setItem('chamados', JSON.stringify(chamados))
      } catch (error) {
        console.error('Erro ao salvar chamados:', error)
      }
    }
  }, [chamados])

  // Garante dados iniciais se estiver vazio
  useEffect(() => {
    if (chamados.length === 0) {
      setChamados(initialChamados)
    }
  }, [])

  /**
   * Cria um novo chamado
   * @param {Object} chamadoData - Dados do chamado
   */
  const createChamado = useCallback((chamadoData) => {
    const coordenadas = mockGeocode(chamadoData.endereco)
    const newChamado = {
      ...chamadoData,
      id: Date.now(),
      status: 'pendente',
      tempoEspera: 0,
      coordenadas,
      criadoEm: new Date().toISOString(),
    }
    setChamados((prev) => {
      // Chamados urgentes sempre no topo
      if (newChamado.prioridade === 'urgente') {
        return [newChamado, ...prev]
      }
      return [...prev, newChamado]
    })
    return newChamado
  }, [])

  /**
   * Atualiza um chamado existente
   * @param {number} id - ID do chamado
   * @param {Object} updates - Campos a atualizar
   */
  const updateChamado = useCallback((id, updates) => {
    setChamados((prev) =>
      prev.map((chamado) => {
        if (chamado.id === id) {
          const updated = { ...chamado, ...updates }
          // Se mudou a prioridade para urgente, move para o topo
          if (updates.prioridade === 'urgente' && chamado.prioridade !== 'urgente') {
            return updated
          }
          return updated
        }
        return chamado
      })
      .sort((a, b) => {
        // Urgentes sempre primeiro
        if (a.prioridade === 'urgente' && b.prioridade !== 'urgente') return -1
        if (a.prioridade !== 'urgente' && b.prioridade === 'urgente') return 1
        return 0
      })
    )
  }, [])

  /**
   * Remove um chamado
   * @param {number} id - ID do chamado
   */
  const deleteChamado = useCallback((id) => {
    setChamados((prev) => prev.filter((chamado) => chamado.id !== id))
  }, [])

  /**
   * Marca um chamado como urgente
   * @param {number} id - ID do chamado
   */
  const markAsUrgent = useCallback((id) => {
    updateChamado(id, { prioridade: 'urgente' })
  }, [updateChamado])

  /**
   * Cancela um chamado
   * @param {number} id - ID do chamado
   */
  const cancelChamado = useCallback((id) => {
    updateChamado(id, { status: 'cancelado' })
  }, [updateChamado])

  return {
    chamados,
    createChamado,
    updateChamado,
    deleteChamado,
    markAsUrgent,
    cancelChamado,
  }
}
