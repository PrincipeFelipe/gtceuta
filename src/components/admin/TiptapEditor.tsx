import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, AlignLeft, 
  AlignCenter, AlignRight, List, ListOrdered, Indent, Outdent, 
  Link as LinkIcon, Image as ImageIcon, Type, Heading1, Heading2, Heading3, 
  X, Quote, Code, Palette } from 'lucide-react';

// Añadir esta importación
import { API_URL } from '../../config/api';

export interface TiptapEditorRef {
  insertImage: (url: string) => void;
}

interface TiptapEditorProps {
  value: string;
  onChange: (content: string) => void;
  onImageSelect?: (file: File) => void;
}

const TiptapEditor = forwardRef<TiptapEditorRef, TiptapEditorProps>(({ 
  value, 
  onChange,
  onImageSelect 
}, ref) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true, // Importante para imágenes base64
        HTMLAttributes: {
          class: 'tiptap-image',
          // Añadir estilos adicionales para asegurar que la imagen es visible
          style: 'max-width: 100%; height: auto; display: block;'
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-red-600 hover:text-red-500 underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Exponer el método insertImage a través de la ref
  useImperativeHandle(ref, () => ({
    insertImage: (url: string) => {
      if (editor) {
        console.log("Insertando imagen con URL:", url);
        
        try {
          // Insertar la imagen con la URL correcta
          editor.chain()
            .focus()
            .setImage({ 
              src: url,
              alt: 'Imagen del blog',
              title: 'Imagen insertada' 
            })
            .run();
          
          // Comprobar que la imagen se insertó correctamente
          setTimeout(() => {
            const html = editor.getHTML();
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const images = tempDiv.querySelectorAll('img');
            images.forEach(img => {
              console.log("Imagen en editor:", img.src);
            });
            
            onChange(html);
          }, 50);
        } catch (error) {
          console.error("Error al insertar imagen:", error);
        }
      } else {
        console.error("Editor no disponible");
      }
    },
    editor // Exponer el editor si necesitas acceder a él externamente
  }));

  // Modificar el hook useEffect que actualiza el contenido
  useEffect(() => {
    if (editor && value) {
      // Asegurarse de que el editor está listo
      if (editor.isReady) {
        // Solo actualiza el contenido si es diferente
        if (value !== editor.getHTML()) {
          console.log("Actualizando contenido del editor con HTML:", 
            value.substring(0, 100) + (value.length > 100 ? "..." : ""));
          
          // Usar una pequeña demora para asegurar que el editor esté completamente inicializado
          setTimeout(() => {
            editor.commands.setContent(value);
          }, 50);
        }
      } else {
        // Si el editor no está listo, esperar y reintentar
        const checkInterval = setInterval(() => {
          if (editor.isReady) {
            editor.commands.setContent(value);
            clearInterval(checkInterval);
          }
        }, 100);
        
        // Limpiar el intervalo si el componente se desmonta
        return () => clearInterval(checkInterval);
      }
    }
  }, [value, editor]);

  // Modificar la función de subida de imagen para usar la API

  // Modificar la función addImage para manejar mejor la respuesta del servidor
  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event) => {
      if (input.files?.length) {
        const file = input.files[0];
        
        if (onImageSelect) {
          onImageSelect(file);
          return;
        }

        try {
          // Convertir imagen a base64
          const reader = new FileReader();
          reader.readAsDataURL(file);
          
          // Modifica la función addImage para normalizar mejor las URLs

          // Modificar la parte donde se normaliza la URL recibida del servidor
          reader.onloadend = async () => {
            const base64 = reader.result as string;
            
            try {
              const response = await fetch(`${API_URL}/upload/content-image`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: base64 })
              });
              
              const data = await response.json();
              console.log("Respuesta del servidor para imagen:", data);
              
              // IMPORTANTE: Normalizar la URL para que sea accesible desde el frontend
              let imageUrl = data.url;
              
              // Si la URL devuelta por el servidor es relativa, convertirla a absoluta para el frontend
              if (imageUrl && !imageUrl.startsWith('http')) {
                // Obtener la base de la URL desde window.location.origin para resolver correctamente
                // relativo al origen actual, no a la API
                imageUrl = `${window.location.origin}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
              }
              
              console.log("Imagen con URL normalizada:", imageUrl);
              
              // Insertar imagen con la URL ya normalizada
              editor?.chain().focus().setImage({ 
                src: imageUrl,
                alt: 'Imagen del blog',
                title: 'Imagen insertada' 
              }).run();
              
              // Forzar actualización del editor
              setTimeout(() => {
                const currentContent = editor?.getHTML();
                if (currentContent) {
                  onChange(currentContent);
                }
              }, 100);
            } catch (error) {
              console.error('Error al subir o insertar imagen:', error);
              alert('Error al subir la imagen. Inténtalo de nuevo.');
            }
          };
        } catch (error) {
          console.error('Error al subir imagen:', error);
          alert('Error al subir la imagen. Inténtalo de nuevo.');
        }
      }
    };
    input.click();
  };

  if (!editor) {
    return (
      <div className="border border-gray-700 rounded-lg p-4 bg-gray-800 flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const addHeading = (level: 1 | 2 | 3) => {
    editor.chain().focus().toggleHeading({ level }).run();
  };

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL del enlace:', previousUrl);
    
    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="tiptap-editor">
      <div className="tiptap-toolbar">
        {/* Formato de texto */}
        <div className="tiptap-button-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'is-active' : ''}
            title="Negrita"
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'is-active' : ''}
            title="Cursiva"
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'is-active' : ''}
            title="Subrayado"
          >
            <UnderlineIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'is-active' : ''}
            title="Tachado"
          >
            <Strikethrough size={16} />
          </button>
        </div>
        
        {/* Encabezados */}
        <div className="tiptap-button-group">
          <button
            type="button"
            onClick={() => addHeading(1)}
            className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
            title="Título 1"
          >
            <Heading1 size={16} />
          </button>
          <button
            type="button"
            onClick={() => addHeading(2)}
            className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
            title="Título 2"
          >
            <Heading2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => addHeading(3)}
            className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
            title="Título 3"
          >
            <Heading3 size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={editor.isActive('paragraph') ? 'is-active' : ''}
            title="Párrafo"
          >
            <Type size={16} />
          </button>
        </div>
        
        {/* Alineación */}
        <div className="tiptap-button-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
            title="Alinear a la izquierda"
          >
            <AlignLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
            title="Centrar"
          >
            <AlignCenter size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
            title="Alinear a la derecha"
          >
            <AlignRight size={16} />
          </button>
        </div>
        
        {/* Listas */}
        <div className="tiptap-button-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'is-active' : ''}
            title="Lista con viñetas"
          >
            <List size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'is-active' : ''}
            title="Lista numerada"
          >
            <ListOrdered size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'is-active' : ''}
            title="Cita"
          >
            <Quote size={16} />
          </button>
        </div>
        
        {/* Indentación */}
        <div className="tiptap-button-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().indent().run()}
            title="Aumentar indentación"
          >
            <Indent size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().outdent().run()}
            title="Disminuir indentación"
          >
            <Outdent size={16} />
          </button>
        </div>
        
        {/* Enlaces e imágenes */}
        <div className="tiptap-button-group">
          <button
            type="button"
            onClick={addLink}
            className={editor.isActive('link') ? 'is-active' : ''}
            title="Insertar enlace"
          >
            <LinkIcon size={16} />
          </button>
          <button
            type="button"
            onClick={addImage}
            title="Insertar imagen"
          >
            <ImageIcon size={16} />
          </button>
        </div>
        
        {/* Eliminar formato */}
        <div className="tiptap-button-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetAllMarks().run()}
            title="Eliminar formato"
          >
            <X size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().clearNodes().run()}
            title="Limpiar formato de bloques"
          >
            <Code size={16} />
          </button>
        </div>
      </div>
      
      <div className="tiptap-content">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
});

// Añadir un nombre para la visualización en DevTools
TiptapEditor.displayName = 'TiptapEditor';

export default TiptapEditor;