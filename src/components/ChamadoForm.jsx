import { useState, useEffect } from 'react'
import { IconClose, IconSearch } from './Icons'

/**
 * Componente de formulário modal para criação e edição de chamados
 */
const ChamadoForm = ({ isOpen, onClose, onCreateChamado, chamadoEdicao, onUpdateChamado }) => {
  const [formData, setFormData] = useState({
    paciente: '',
    telefone: '',
    endereco: '',
    destino: '',
    prioridade: 'media',
    observacoes: '',
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cepOrigem, setCepOrigem] = useState('')
  const [cepDestino, setCepDestino] = useState('')
  const [loadingCepOrigem, setLoadingCepOrigem] = useState(false)
  const [loadingCepDestino, setLoadingCepDestino] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Limpa erro do campo quando usuário começa a digitar
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // Função para buscar CEP usando ViaCEP
  const buscarCep = async (cep, tipo) => {
    // Remove caracteres não numéricos
    const cepLimpo = cep.replace(/\D/g, '')
    
    if (cepLimpo.length !== 8) {
      alert('CEP deve conter 8 dígitos')
      return
    }

    if (tipo === 'origem') {
      setLoadingCepOrigem(true)
    } else {
      setLoadingCepDestino(true)
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await response.json()

      if (data.erro) {
        alert('CEP não encontrado')
        return
      }

      // Formata o endereço completo
      const enderecoCompleto = `${data.logradouro || ''}${data.logradouro ? ', ' : ''}${data.bairro || ''}${data.bairro ? ', ' : ''}${data.localidade || ''}${data.localidade ? ' - ' : ''}${data.uf || ''}${data.cep ? ', CEP: ' + data.cep : ''}`.trim()

      if (tipo === 'origem') {
        setFormData((prev) => ({ ...prev, endereco: enderecoCompleto }))
        setCepOrigem('')
      } else {
        setFormData((prev) => ({ ...prev, destino: enderecoCompleto }))
        setCepDestino('')
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      alert('Erro ao buscar CEP. Tente novamente.')
    } finally {
      if (tipo === 'origem') {
        setLoadingCepOrigem(false)
      } else {
        setLoadingCepDestino(false)
      }
    }
  }

  const handleBuscarCepOrigem = () => {
    if (cepOrigem.trim()) {
      buscarCep(cepOrigem, 'origem')
    }
  }

  const handleBuscarCepDestino = () => {
    if (cepDestino.trim()) {
      buscarCep(cepDestino, 'destino')
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.paciente.trim()) newErrors.paciente = 'Nome do paciente é obrigatório'
    if (!formData.telefone.trim()) newErrors.telefone = 'Telefone é obrigatório'
    if (!formData.endereco.trim()) newErrors.endereco = 'Endereço é obrigatório'
    if (!formData.destino.trim()) newErrors.destino = 'Destino é obrigatório'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Carrega dados do chamado quando está em modo de edição
  useEffect(() => {
    if (isOpen && chamadoEdicao) {
      setFormData({
        paciente: chamadoEdicao.paciente || '',
        telefone: chamadoEdicao.telefone || '',
        endereco: chamadoEdicao.endereco || '',
        destino: chamadoEdicao.destino || '',
        prioridade: chamadoEdicao.prioridade || 'media',
        observacoes: chamadoEdicao.observacoes || '',
      })
      setCepOrigem('')
      setCepDestino('')
    } else if (!isOpen) {
      // Reset form quando o modal fecha
      setFormData({
        paciente: '',
        telefone: '',
        endereco: '',
        destino: '',
        prioridade: 'media',
        observacoes: '',
      })
      setErrors({})
      setIsSubmitting(false)
      setCepOrigem('')
      setCepDestino('')
    }
  }, [isOpen, chamadoEdicao])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    
    // Simula pequeno delay para feedback visual
    setTimeout(() => {
      if (chamadoEdicao && onUpdateChamado) {
        // Modo edição
        onUpdateChamado(chamadoEdicao.id, formData)
      } else {
        // Modo criação
        onCreateChamado(formData)
      }
      setIsSubmitting(false)
      onClose() // Fecha o modal após criar/editar
    }, 300)
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  // Não renderiza se não estiver aberto
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div 
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {chamadoEdicao ? 'Editar Chamado' : 'Novo Pedido de Ambulância'}
            </h2>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
              aria-label="Fechar"
            >
              <IconClose className="w-6 h-6" />
            </button>
          </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Paciente *
            </label>
            <input
              type="text"
              name="paciente"
              value={formData.paciente}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.paciente ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Digite o nome do paciente"
            />
            {errors.paciente && (
              <p className="text-red-500 text-xs mt-1">{errors.paciente}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone *
            </label>
            <input
              type="text"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.telefone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="(11) 98765-4321"
            />
            {errors.telefone && (
              <p className="text-red-500 text-xs mt-1">{errors.telefone}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Endereço de Origem *
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.endereco ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Rua, número - Bairro, Cidade, Estado"
              />
            </div>
            <div className="flex gap-1">
              <input
                type="text"
                value={cepOrigem}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  if (value.length <= 8) {
                    setCepOrigem(value)
                  }
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleBuscarCepOrigem()}
                className="w-24 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="CEP"
                maxLength={8}
              />
              <button
                type="button"
                onClick={handleBuscarCepOrigem}
                disabled={loadingCepOrigem || !cepOrigem.trim()}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                title="Buscar CEP"
              >
                {loadingCepOrigem ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <IconSearch className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          {errors.endereco && (
            <p className="text-red-500 text-xs mt-1">{errors.endereco}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Destino *
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                name="destino"
                value={formData.destino}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.destino ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Hospital ou clínica de destino"
              />
            </div>
            <div className="flex gap-1">
              <input
                type="text"
                value={cepDestino}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  if (value.length <= 8) {
                    setCepDestino(value)
                  }
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleBuscarCepDestino()}
                className="w-24 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="CEP"
                maxLength={8}
              />
              <button
                type="button"
                onClick={handleBuscarCepDestino}
                disabled={loadingCepDestino || !cepDestino.trim()}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                title="Buscar CEP"
              >
                {loadingCepDestino ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <IconSearch className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          {errors.destino && (
            <p className="text-red-500 text-xs mt-1">{errors.destino}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridade *
            </label>
            <select
              name="prioridade"
              value={formData.prioridade}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <input
              type="text"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Informações adicionais (opcional)"
            />
          </div>
        </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting 
                ? (chamadoEdicao ? 'Salvando...' : 'Criando...') 
                : (chamadoEdicao ? 'Salvar Alterações' : 'Criar Chamado')
              }
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}

export default ChamadoForm
