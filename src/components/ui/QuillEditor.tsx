import React, { useEffect, useRef } from 'react';
import ReactQuill, { ReactQuillProps } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface QuillEditorProps extends ReactQuillProps {
  onImageUpload?: () => void;
}

const QuillEditor: React.FC<QuillEditorProps> = ({ onImageUpload, ...props }) => {
  const quillRef = useRef<ReactQuill>(null);
  
  useEffect(() => {
    // Si necesitas alguna configuración adicional cuando el componente se monte
    return () => {
      // Limpieza si es necesaria
    };
  }, []);

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['link'],
        ['clean'],
        ['image']
      ],
      handlers: {
        'image': onImageUpload
      }
    }
  };

  return <ReactQuill ref={quillRef} modules={onImageUpload ? modules : props.modules} {...props} />;
};

export default QuillEditor;