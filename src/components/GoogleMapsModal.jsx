import { IconClose, IconMap } from './Icons'

/**
 * Modal para exibir Google Maps com o endereço de destino
 */
const GoogleMapsModal = ({ isOpen, onClose, endereco }) => {
  if (!isOpen || !endereco) return null

  // Usa a URL de busca do Google Maps que não requer API key
  const googleMapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(endereco)}&output=embed`

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div 
        className="bg-white rounded-lg max-w-4xl w-full h-[80vh] flex flex-col"
      >
        {/* Header do Modal */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800">Localização</h2>
            <p className="text-sm text-gray-600 mt-1">{endereco}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 ml-4"
            aria-label="Fechar"
          >
            <IconClose className="w-6 h-6" />
          </button>
        </div>

        {/* Mapa */}
        <div className="flex-1 relative">
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={googleMapsUrl}
            title="Google Maps"
          />
        </div>

        {/* Footer com link para abrir no Google Maps */}
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline text-sm flex items-center gap-2"
          >
            <IconMap className="w-4 h-4" />
            <span>Abrir no Google Maps</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default GoogleMapsModal
