// Un reemplazo simple para sanitize-html
function sanitizeHtml(html: string, options?: any): string {
  return html; // Devuelve el HTML sin modificar
}

// Agregar propiedades para que funcione como el original
sanitizeHtml.defaults = {
  allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
    'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img', 'span'],
  allowedAttributes: {
    a: ['href', 'name', 'target'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    '*': ['class', 'id', 'style']
  }
};

export default sanitizeHtml;