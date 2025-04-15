import React, { useState, useEffect } from 'react';

const PdfTester: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const pdfUrl = '/documents/bases_gt_ceuta.pdf';
  
  useEffect(() => {
    const checkPdf = async () => {
      try {
        const response = await fetch(pdfUrl);
        if (response.ok) {
          console.log('PDF encontrado correctamente');
          setStatus('success');
        } else {
          console.error(`Error al acceder al PDF: ${response.status}`);
          setStatus('error');
        }
      } catch (error) {
        console.error('Error al verificar el PDF:', error);
        setStatus('error');
      }
    };
    
    checkPdf();
  }, []);
  
  return (
    <div className="p-4 rounded-lg">
      <h3 className="text-lg font-bold mb-2">Verificación de PDF</h3>
      
      {status === 'loading' && (
        <p className="text-blue-500">Comprobando acceso al PDF...</p>
      )}
      
      {status === 'success' && (
        <div className="text-green-500">
          <p>✅ El PDF está disponible en: <a href={pdfUrl} className="underline" target="_blank" rel="noopener noreferrer">{pdfUrl}</a></p>
          <iframe src={pdfUrl} className="w-full h-20 bg-white rounded mt-2"></iframe>
        </div>
      )}
      
      {status === 'error' && (
        <div className="text-red-500">
          <p>❌ Error: No se puede acceder al PDF</p>
          <p>URL probada: {pdfUrl}</p>
          <p>Asegúrate de que el archivo existe en la carpeta correcta y que se ha copiado durante el build.</p>
        </div>
      )}
    </div>
  );
};

export default PdfTester;