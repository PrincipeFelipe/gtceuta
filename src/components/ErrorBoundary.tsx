import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error capturado por el límite de error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Puedes renderizar cualquier interfaz de usuario personalizada
      return this.props.fallback || (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-red-900/20 border border-red-800 p-6 rounded-lg max-w-lg w-full">
            <h2 className="text-xl font-bold text-red-400 mb-3">Algo salió mal</h2>
            <p className="text-gray-300 mb-4">
              Se ha producido un error en la aplicación. Intenta recargar la página.
            </p>
            <pre className="bg-gray-800 p-4 rounded overflow-auto text-xs text-gray-300">
              {this.state.error?.toString()}
            </pre>
            <button 
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              onClick={() => window.location.reload()}
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;