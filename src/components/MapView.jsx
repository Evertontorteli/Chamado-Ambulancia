import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { getStatusLabel } from '../services/chamadoMockService'

// Configuração única dos ícones do Leaflet (fora do componente)
let leafletIconsConfigured = false

if (typeof window !== 'undefined' && L && L.Icon && L.Icon.Default && !leafletIconsConfigured) {
  try {
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    })
    leafletIconsConfigured = true
  } catch (error) {
    console.error('Erro ao configurar ícones do Leaflet:', error)
  }
}

// Componente interno para atualizar o mapa
function MapUpdater({ chamados }) {
  const map = useMap()
  
  useEffect(() => {
    if (chamados.length > 0) {
      const validChamados = chamados.filter(t => t.coordenadas && t.status !== 'cancelado')
      if (validChamados.length > 0) {
        try {
          const bounds = validChamados.map(t => [t.coordenadas.lat, t.coordenadas.lng])
          map.fitBounds(bounds, { padding: [50, 50] })
        } catch (error) {
          console.error('Erro ao ajustar bounds do mapa:', error)
        }
      }
    }
  }, [chamados, map])
  
  return null
}

/**
 * Componente de mapa para visualização dos chamados
 * Área 3 da tela única
 */
const MapView = ({ chamados, onChamadoClick }) => {
  const [mounted, setMounted] = useState(false)
  const mapRef = useRef(null)
  
  // Garante que o componente só renderize no cliente
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Aguarda um pouco antes de montar o mapa
    const timer = setTimeout(() => {
      setMounted(true)
    }, 300)
    
    return () => {
      clearTimeout(timer)
      // Limpa referência do mapa ao desmontar
      if (mapRef.current) {
        try {
          mapRef.current.remove()
        } catch (error) {
          // Ignora erros de limpeza
        }
        mapRef.current = null
      }
    }
  }, [])

  // Centro padrão (Jales, SP)
  const defaultCenter = [-20.2689, -50.5458]

  // Calcula o centro baseado nos chamados
  const getMapCenter = () => {
    if (chamados.length === 0) return defaultCenter
    
    const validChamados = chamados.filter(t => t.coordenadas && t.status !== 'cancelado')
    if (validChamados.length === 0) return defaultCenter

    try {
      const avgLat = validChamados.reduce((sum, t) => sum + t.coordenadas.lat, 0) / validChamados.length
      const avgLng = validChamados.reduce((sum, t) => sum + t.coordenadas.lng, 0) / validChamados.length
      return [avgLat, avgLng]
    } catch (error) {
      return defaultCenter
    }
  }

  // Mostra loading enquanto não monta
  if (!mounted || typeof window === 'undefined') {
    return (
      <div className="h-full w-full rounded-lg overflow-hidden border border-gray-300 bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Carregando mapa...</p>
      </div>
    )
  }

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-gray-300 bg-gray-100">
      <MapContainer
        center={getMapCenter()}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <MapUpdater chamados={chamados} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {chamados
          .filter((chamado) => chamado && chamado.coordenadas && chamado.status !== 'cancelado')
          .map((chamado) => {
            if (!chamado || !chamado.coordenadas || !chamado.coordenadas.lat || !chamado.coordenadas.lng) {
              return null
            }
            
            return (
              <Marker
                key={chamado.id}
                position={[chamado.coordenadas.lat, chamado.coordenadas.lng]}
                eventHandlers={{
                  click: () => {
                    if (onChamadoClick) {
                      try {
                        onChamadoClick(chamado)
                      } catch (error) {
                        console.error('Erro ao clicar no chamado:', error)
                      }
                    }
                  },
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-sm text-gray-800">{chamado.paciente || 'Sem nome'}</h3>
                    <p className="text-xs text-gray-600 mt-1">{chamado.endereco || 'Sem endereço'}</p>
                    <p className="text-xs mt-2">
                      <span className="font-semibold">Status:</span>{' '}
                      <span className="text-gray-700">{getStatusLabel(chamado.status)}</span>
                    </p>
                    <p className="text-xs">
                      <span className="font-semibold">Prioridade:</span>{' '}
                      <span className="uppercase text-gray-700">{chamado.prioridade || 'N/A'}</span>
                    </p>
                    <p className="text-xs mt-1">
                      <span className="font-semibold">Destino:</span>{' '}
                      <span className="text-gray-700">{chamado.destino || 'Sem destino'}</span>
                    </p>
                  </div>
                </Popup>
              </Marker>
            )
          })}
      </MapContainer>
    </div>
  )
}

export default MapView
