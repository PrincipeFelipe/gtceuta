import React, { useRef, useEffect, useState, forwardRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ImageEditor from './ImageEditor';

// Definir una clase personalizada para el blot de imagen
const ImageBlot = Quill.import('formats/image');
const Parchment = Quill.import('parchment');

// Modificar el blot de imagen para agregar eventos personalizados
class CustomImageBlot extends ImageBlot {
  static create(value: string) {
    const node = super.create(value);
    node.setAttribute('data-editable', 'true');
    return node;
  }

  static value(node: HTMLElement) {
    return node.getAttribute('src');
  }
}

CustomImageBlot.blotName = 'image';
CustomImageBlot.tagName = 'img';
Quill.register('formats/image', CustomImageBlot, true);

interface CustomReactQuillProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

// Usar forwardRef para pasar refs de manera correcta
const CustomReactQuill = forwardRef<ReactQuill, CustomReactQuillProps>(({ 
  value, 
  onChange, 
  placeholder, 
  readOnly = false 
}, ref) => {
  const quillRef = useRef<ReactQuill>(null);
  // Combinar la ref pasada con nuestra ref interna
  const combinedRef = (node: ReactQuill) => {
    quillRef.current = node;
    // Si se pasa una ref desde el componente padre, actualizarla también
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      (ref as React.MutableRefObject<ReactQuill | null>).current = node;
    }
  };
  
  const [imageEditorState, setImageEditorState] = useState<{
    open: boolean;
    src: string | null;
    node: HTMLElement | null;
  }>({
    open: false,
    src: null,
    node: null
  });
  
  // Mantener una referencia al elemento del editor
  const [editorElement, setEditorElement] = useState<HTMLElement | null>(null);

  // Función para detectar el elemento del editor de una manera más moderna
  const detectEditorElement = () => {
    if (quillRef.current) {
      // Usar querySelector en lugar de getEditingArea()
      const editorEl = quillRef.current.getEditor()?.root;
      if (editorEl && editorEl !== editorElement) {
        setEditorElement(editorEl);
        return editorEl;
      }
    }
    return editorElement;
  };

  // Handler para insertar imágenes desde el sistema de archivos
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const quillEditor = quillRef.current?.getEditor();
          if (!quillEditor) return;
          
          const range = quillEditor.getSelection(true);
          
          // Abrir editor de imágenes
          setImageEditorState({
            open: true,
            src: e.target?.result as string,
            node: null
          });
          
          // Guardar la posición de inserción para usar después
          localStorage.setItem('quillInsertIndex', String(range.index));
        };
        
        reader.readAsDataURL(file);
      }
    };
  };

  // Configurar los módulos de Quill
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}],
        [{'indent': '-1'}, {'indent': '+1'}],
        [{'align': []}],
        ['link', 'image'],
        ['clean'],
        [{'color': []}, {'background': []}]
      ],
      handlers: {
        image: imageHandler
      }
    },
    clipboard: {
      matchVisual: false
    }
  };

  // Usar MutationObserver en lugar de DOMNodeInserted
  useEffect(() => {
    const editor = detectEditorElement();
    
    if (editor) {
      console.log('Configurando evento click para imágenes');
      
      // Añadir un evento click para las imágenes
      const handleClick = (event: Event) => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'IMG' && !readOnly) {
          console.log('Imagen clickeada:', target.getAttribute('src'));
          
          // Prevenir navegación o comportamientos default
          event.preventDefault();
          event.stopPropagation();
          
          // Abrir editor con la imagen seleccionada
          setImageEditorState({
            open: true,
            src: target.getAttribute('src'),
            node: target
          });
        }
      };
      
      // Usar el evento click directamente en el editor
      editor.addEventListener('click', handleClick);
      
      // Configurar MutationObserver para detectar imágenes nuevas
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
              if (node instanceof HTMLImageElement) {
                console.log('Nueva imagen detectada:', node.src);
              }
            });
          }
        });
      });
      
      // Observar cambios en el DOM del editor
      observer.observe(editor, { 
        childList: true, 
        subtree: true 
      });
      
      return () => {
        editor.removeEventListener('click', handleClick);
        observer.disconnect();
      };
    }
  }, [readOnly, editorElement]);

  // Detectar el elemento del editor cuando el componente se monte o actualice
  useEffect(() => {
    detectEditorElement();
  }, [quillRef.current]);

  // Añadir un efecto específico para actualizar el editor cuando el valor cambia (muy importante)
  useEffect(() => {
    // Este efecto se ejecuta cuando el valor cambia desde fuera
    // Lo que asegura que el editor se actualice cuando se carga un post existente
    if (quillRef.current && value) {
      const editor = quillRef.current.getEditor();
      if (editor) {
        const currentContent = editor.root.innerHTML;
        if (currentContent !== value) {
          console.log("Actualizando contenido del editor");
          editor.clipboard.dangerouslyPasteHTML(value);
        }
      }
    }
  }, [value]);

  // Manejar la imagen guardada después de edición
  const handleSaveEditedImage = (editedImage: string) => {
    const quillEditor = quillRef.current?.getEditor();
    if (!quillEditor) return;
    
    // Caso 1: Editar imagen existente
    if (imageEditorState.node) {
      // Reemplazar la imagen existente con la editada
      imageEditorState.node.setAttribute('src', editedImage);
      
      // Notificar el cambio
      onChange(quillEditor.root.innerHTML);
    }
    // Caso 2: Insertar nueva imagen
    else {
      const insertIndex = parseInt(localStorage.getItem('quillInsertIndex') || '0');
      quillEditor.insertEmbed(insertIndex, 'image', editedImage, 'user');
      quillEditor.setSelection(insertIndex + 1, 0);
    }
    
    // Limpiar el estado y localStorage
    setImageEditorState({ open: false, src: null, node: null });
    localStorage.removeItem('quillInsertIndex');
  };

  return (
    <>
      <ReactQuill
        ref={combinedRef}
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        modules={readOnly ? {} : modules}
        formats={[
          'header',
          'bold', 'italic', 'underline', 'strike', 'blockquote',
          'list', 'bullet', 'indent',
          'link', 'image',
          'align',
          'color', 'background'
        ]}
      />
      
      {imageEditorState.open && (
        <ImageEditor
          src={imageEditorState.src}
          onSave={handleSaveEditedImage}
          onCancel={() => setImageEditorState({ open: false, src: null, node: null })}
        />
      )}
    </>
  );
});

// Añadir displayName para facilitar la depuración
CustomReactQuill.displayName = 'CustomReactQuill';

export default CustomReactQuill;