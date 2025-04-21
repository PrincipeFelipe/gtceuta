import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
          <p className="text-gray-300 mb-6">{description}</p>
          
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition"
            >
              {cancelText}
            </button>
            
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-md transition ${
                isDestructive 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;