import { useEffect, useState } from 'react'
import { IconCheck, IconClose } from './Icons'

/**
 * Componente de Toast para notificações
 */
const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Aguarda animação de saída
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const borderColors = {
    success: 'border-l-green-500',
    error: 'border-l-red-500',
    warning: 'border-l-yellow-500',
    info: 'border-l-blue-500',
  }

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  }

  return (
    <div
      className={`transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`bg-white border-l-4 ${borderColors[type]} rounded-lg shadow-lg px-4 py-3 min-w-[300px] max-w-md flex items-center gap-3`}
      >
        {type === 'success' && (
          <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${iconColors[type]} bg-green-50`}>
            <IconCheck className="w-3 h-3" />
          </div>
        )}
        {type === 'error' && (
          <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${iconColors[type]} bg-red-50`}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        {type === 'warning' && (
          <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${iconColors[type]} bg-yellow-50`}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        {type === 'info' && (
          <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${iconColors[type]} bg-blue-50`}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        <p className="flex-1 text-sm font-medium text-gray-800">{message}</p>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fechar"
        >
          <IconClose className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Toast
