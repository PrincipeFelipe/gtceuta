import React, { useState, useImperativeHandle, forwardRef, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Youtube from '@tiptap/extension-youtube';

// Iconos para la barra de herramientas
import {
  Bold, Italic, Underline as UnderlineIcon, AlignLeft, AlignCenter,
  AlignRight, Link as LinkIcon, List, ListOrdered, Image as ImageIcon,
  Youtube as YoutubeIcon, Undo, Redo, Quote, Code
} from 'lucide-react';

import '../../styles/tiptap.css';

export interface TiptapEditorRef {
  getContent: () => string;
  setContent: (content: string) => void;
  insertImage: (url: string) => void;
  clearContent: () => void;
  focus: () => void;
  editor?: Editor | null;
}

interface TiptapProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  autofocus?: boolean;
  uploadImage?: (file: File) => Promise<string>;
  uploadImageFromUrl?: (url: string) => Promise<string>;
}

const Tiptap = forwardRef<TiptapEditorRef, TiptapProps>((props, ref) => {
  const { value, onChange, placeholder, autofocus = false, uploadImage, uploadImageFromUrl } = props;
  
  // Referencia directa al estado interno para evitar renderizados innecesarios
  const isUpdatingRef = useRef(false);
  const lastContentRef = useRef(value);
  
  // Estados para UI
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Esta función debe memoizarse para evitar recreaciones en cada renderizado
  const handleEditorUpdate = useCallback(({ editor }) => {
    // No actualizar el estado si estamos en medio de una actualización programada
    if (isUpdatingRef.current) return;
    
    // Obtener el nuevo contenido
    const newContent = editor.getHTML();
    
    // Verificar si realmente cambió para evitar actualizaciones innecesarias
    if (newContent !== lastContentRef.current) {
      lastContentRef.current = newContent;
      
      // Usar RAF (requestAnimationFrame) para retrasar la actualización del estado
      // hasta que el navegador esté listo para renderizar, evitando así pérdidas de foco
      window.requestAnimationFrame(() => {
        onChange(newContent);
      });
    }
  }, [onChange]);
  
  // Configuración del editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-red-500 hover:text-red-400 underline',
        },
      }),
      Image.configure({
        inline: false,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full mx-auto my-4',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Escribe el contenido aquí...',
        emptyEditorClass: 'is-editor-empty',
      }),
      Underline,
      Youtube.configure({
        controls: false,
        nocookie: true,
        progressbarColor: 'white',
        modestBranding: false,
      }),
    ],
    content: value,
    onUpdate: handleEditorUpdate,
    autofocus,
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
      },
    },
  });
  
  // Este efecto se encarga de actualizar el contenido del editor cuando cambia externamente
  useEffect(() => {
    if (!editor) return;
    
    // Solo actualizar si el valor ha cambiado y es diferente al último contenido conocido
    if (value !== lastContentRef.current) {
      // Marcar que estamos actualizando para evitar ciclos
      isUpdatingRef.current = true;
      
      // Actualizar el contenido
      const isFocused = editor.isFocused;
      const selection = isFocused ? editor.state.selection : null;
      
      editor.commands.setContent(value);
      lastContentRef.current = value;
      
      // Restaurar el foco y la selección si el editor estaba enfocado
      if (isFocused) {
        editor.commands.focus();
        if (selection) {
          // Intentar restaurar la selección aproximadamente
          editor.commands.setTextSelection(selection.from);
        }
      }
      
      // Desmarcar después de un breve tiempo
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
    }
  }, [editor, value]);
  
  // Exponer la API del editor para uso externo
  useImperativeHandle(ref, () => ({
    getContent: () => editor ? editor.getHTML() : '',
    setContent: (content: string) => {
      if (!editor) return;
      
      isUpdatingRef.current = true;
      editor.commands.setContent(content);
      lastContentRef.current = content;
      
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
    },
    insertImage: (url: string) => {
      if (!editor) return;
      
      isUpdatingRef.current = true;
      
      editor.chain().focus().setImage({ src: url }).run();
      
      // Actualizar el último contenido conocido
      setTimeout(() => {
        lastContentRef.current = editor.getHTML();
        isUpdatingRef.current = false;
      }, 50);
    },
    clearContent: () => {
      if (!editor) return;
      
      isUpdatingRef.current = true;
      editor.commands.clearContent();
      
      setTimeout(() => {
        lastContentRef.current = editor.getHTML();
        isUpdatingRef.current = false;
      }, 50);
    },
    focus: () => editor?.commands.focus('end'),
    editor
  }));
  
  // Resto del componente...
  
  // Manejo de enlaces
  const handleSetLink = () => {
    if (!editor || !linkUrl) {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    // Si la URL no tiene http/https, añadirlo
    const url = linkUrl.match(/^https?:\/\//) ? linkUrl : `https://${linkUrl}`;
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    setLinkUrl('');
    setShowLinkInput(false);
  };
  
  // Manejo de imágenes desde URL
  const handleInsertImage = async () => {
    if (!imageUrl || !editor) return;
    
    try {
      setIsUploading(true);
      setErrorMessage(null);
      
      let finalUrl = imageUrl;
      
      // Si hay función para procesar URL de imágenes, usarla
      if (uploadImageFromUrl) {
        finalUrl = await uploadImageFromUrl(imageUrl);
      }
      
      isUpdatingRef.current = true;
      
      if (imageCaption) {
        editor.chain().focus().insertContent(`
          <figure>
            <img src="${finalUrl}" alt="${imageCaption || 'Imagen'}" />
            <figcaption>${imageCaption}</figcaption>
          </figure>
        `).run();
      } else {
        editor.chain().focus().setImage({ src: finalUrl }).run();
      }
      
      setTimeout(() => {
        lastContentRef.current = editor.getHTML();
        isUpdatingRef.current = false;
        onChange(editor.getHTML());
      }, 50);
      
      setImageUrl('');
      setImageCaption('');
      setShowImageInput(false);
    } catch (error) {
      console.error("Error insertando imagen:", error);
      setErrorMessage("No se pudo insertar la imagen");
    } finally {
      setIsUploading(false);
    }
  };
  
  // Subir imagen desde archivo
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !uploadImage || !editor) return;
    
    const file = e.target.files[0];
    
    try {
      setIsUploading(true);
      setErrorMessage(null);
      
      const imageUrl = await uploadImage(file);
      
      isUpdatingRef.current = true;
      
      editor.chain().focus().setImage({ src: imageUrl, alt: file.name }).run();
      
      setTimeout(() => {
        lastContentRef.current = editor.getHTML();
        isUpdatingRef.current = false;
        onChange(editor.getHTML());
      }, 50);
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      setErrorMessage("No se pudo subir la imagen");
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };
  
  if (!editor) {
    return null;
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
      {/* Barra de herramientas */}
      <div className="p-2 border-b border-gray-700 bg-gray-800 flex flex-wrap gap-1">
        {/* Formateo básico */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('bold') ? 'bg-gray-700' : ''}`}
          title="Negrita"
        >
          <Bold size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('italic') ? 'bg-gray-700' : ''}`}
          title="Cursiva"
        >
          <Italic size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('underline') ? 'bg-gray-700' : ''}`}
          title="Subrayado"
        >
          <UnderlineIcon size={16} />
        </button>
        
        <span className="w-px h-6 bg-gray-700 mx-1"></span>
        
        {/* Encabezados */}
        <select 
          className="p-1 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200"
          onChange={(e) => {
            const value = e.target.value;
            if (value === 'paragraph') {
              editor.chain().focus().setParagraph().run();
            } else if (value.startsWith('heading')) {
              const level = parseInt(value.split('-')[1]) as 1 | 2 | 3;
              editor.chain().focus().toggleHeading({ level }).run();
            }
          }}
          value={
            editor.isActive('heading', { level: 1 }) ? 'heading-1' :
            editor.isActive('heading', { level: 2 }) ? 'heading-2' :
            editor.isActive('heading', { level: 3 }) ? 'heading-3' :
            'paragraph'
          }
        >
          <option value="paragraph">Párrafo</option>
          <option value="heading-1">Título 1</option>
          <option value="heading-2">Título 2</option>
          <option value="heading-3">Título 3</option>
        </select>
        
        <span className="w-px h-6 bg-gray-700 mx-1"></span>
        
        {/* Alineación */}
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded hover:bg-gray-700 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-700' : ''}`}
          title="Alinear a la izquierda"
        >
          <AlignLeft size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded hover:bg-gray-700 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-700' : ''}`}
          title="Centrar"
        >
          <AlignCenter size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded hover:bg-gray-700 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-700' : ''}`}
          title="Alinear a la derecha"
        >
          <AlignRight size={16} />
        </button>
        
        <span className="w-px h-6 bg-gray-700 mx-1"></span>
        
        {/* Listas */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('bulletList') ? 'bg-gray-700' : ''}`}
          title="Lista de viñetas"
        >
          <List size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('orderedList') ? 'bg-gray-700' : ''}`}
          title="Lista numerada"
        >
          <ListOrdered size={16} />
        </button>
        
        <span className="w-px h-6 bg-gray-700 mx-1"></span>
        
        {/* Enlaces e imágenes */}
        <button
          onClick={() => setShowLinkInput(!showLinkInput)}
          className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('link') ? 'bg-gray-700' : ''}`}
          title="Enlace"
        >
          <LinkIcon size={16} />
        </button>
        
        <button
          onClick={() => setShowImageInput(!showImageInput)}
          className="p-2 rounded hover:bg-gray-700"
          title="Imagen"
        >
          <ImageIcon size={16} />
        </button>
        
        <span className="w-px h-6 bg-gray-700 mx-1"></span>
        
        {/* Elementos adicionales */}
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('blockquote') ? 'bg-gray-700' : ''}`}
          title="Cita"
        >
          <Quote size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('codeBlock') ? 'bg-gray-700' : ''}`}
          title="Bloque de código"
        >
          <Code size={16} />
        </button>
        
        <span className="w-px h-6 bg-gray-700 mx-1"></span>
        
        {/* Deshacer/Rehacer */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="p-2 rounded hover:bg-gray-700 disabled:opacity-50"
          title="Deshacer"
        >
          <Undo size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="p-2 rounded hover:bg-gray-700 disabled:opacity-50"
          title="Rehacer"
        >
          <Redo size={16} />
        </button>
      </div>
      
      {/* Entrada para enlaces */}
      {showLinkInput && (
        <div className="p-2 border-b border-gray-700 bg-gray-800 flex items-center gap-2">
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Introduce URL (ej: https://ejemplo.com)"
            className="p-1 bg-gray-700 border border-gray-600 rounded text-sm text-white flex-1"
            autoFocus
          />
          <button
            onClick={handleSetLink}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
          >
            Aplicar
          </button>
          <button
            onClick={() => {
              editor.chain().focus().extendMarkRange('link').unsetLink().run();
              setShowLinkInput(false);
              setLinkUrl('');
            }}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
          >
            Quitar enlace
          </button>
        </div>
      )}
      
      {/* Entrada para imágenes */}
      {showImageInput && (
        <div className="p-2 border-b border-gray-700 bg-gray-800">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="URL de la imagen"
                className="p-1 bg-gray-700 border border-gray-600 rounded text-sm text-white flex-1"
              />
              <button
                onClick={handleInsertImage}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm whitespace-nowrap"
                disabled={isUploading || !imageUrl}
              >
                {isUploading ? 'Insertando...' : 'Insertar'}
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                placeholder="Pie de foto (opcional)"
                className="p-1 bg-gray-700 border border-gray-600 rounded text-sm text-white flex-1"
              />
            </div>
            
            {uploadImage && (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="text-sm text-gray-400
                    file:mr-4 file:py-1 file:px-3
                    file:rounded file:border-0
                    file:text-xs file:font-medium
                    file:bg-red-600 file:text-white
                    hover:file:bg-red-700"
                  disabled={isUploading}
                />
              </div>
            )}
            
            {errorMessage && (
              <div className="text-red-500 text-xs mt-1">
                {errorMessage}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Editor de contenido */}
      <div className="tiptap-editor p-4 bg-gray-900 text-gray-200 min-h-[300px]">
        <EditorContent editor={editor} />
      </div>
      
      {/* Barra inferior con botones para insertar */}
      <div className="p-2 border-t border-gray-700 bg-gray-800 flex flex-wrap gap-2">
        <button
          onClick={() => setShowLinkInput(!showLinkInput)}
          className={`px-3 py-1 rounded flex items-center gap-1 text-sm ${
            showLinkInput ? 'bg-gray-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          <LinkIcon size={14} />
          <span>Enlace</span>
        </button>
        
        <button
          onClick={() => setShowImageInput(!showImageInput)}
          className={`px-3 py-1 rounded flex items-center gap-1 text-sm ${
            showImageInput ? 'bg-gray-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          <ImageIcon size={14} />
          <span>Imagen</span>
        </button>
      </div>
    </div>
  );
});

Tiptap.displayName = 'Tiptap';

export default Tiptap;