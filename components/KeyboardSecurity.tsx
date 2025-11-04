import React, { useEffect } from 'react';

const KeyboardSecurity: React.FC = () => {
  useEffect(() => {
    // Lista de combinaciones de teclas a bloquear
    const blockedKeyCombinations = [
      // Developer Tools
      { key: 'F12' },
      { key: 'I', ctrl: true, shift: true }, // Ctrl+Shift+I
      { key: 'J', ctrl: true, shift: true }, // Ctrl+Shift+J
      { key: 'C', ctrl: true, shift: true }, // Ctrl+Shift+C
      { key: 'K', ctrl: true, shift: true }, // Ctrl+Shift+K
      { key: 'U', ctrl: true }, // Ctrl+U (View Source)
      
      // Copy/Paste
      { key: 'C', ctrl: true }, // Ctrl+C
      { key: 'V', ctrl: true }, // Ctrl+V
      { key: 'X', ctrl: true }, // Ctrl+X
      { key: 'A', ctrl: true }, // Ctrl+A (Select All)
      { key: 'S', ctrl: true }, // Ctrl+S (Save)
      { key: 'P', ctrl: true }, // Ctrl+P (Print)
      
      // Navigation and Refresh
      { key: 'F5' }, // F5 (Refresh)
      { key: 'R', ctrl: true }, // Ctrl+R (Refresh)
      { key: 'R', ctrl: true, shift: true }, // Ctrl+Shift+R (Hard Refresh)
      { key: 'F', ctrl: true }, // Ctrl+F (Find)
      { key: 'G', ctrl: true }, // Ctrl+G (Find Next)
      { key: 'H', ctrl: true }, // Ctrl+H (History)
      
      // Browser Navigation
      { key: 'T', ctrl: true }, // Ctrl+T (New Tab)
      { key: 'W', ctrl: true }, // Ctrl+W (Close Tab)
      { key: 'N', ctrl: true }, // Ctrl+N (New Window)
      { key: 'L', ctrl: true }, // Ctrl+L (Address Bar)
      { key: 'D', ctrl: true }, // Ctrl+D (Bookmark)
      
      // Zoom
      { key: '+', ctrl: true }, // Ctrl++ (Zoom In)
      { key: '-', ctrl: true }, // Ctrl+- (Zoom Out)
      { key: '0', ctrl: true }, // Ctrl+0 (Reset Zoom)
      
      // Other Function Keys
      { key: 'F1' }, { key: 'F2' }, { key: 'F3' }, { key: 'F4' },
      { key: 'F6' }, { key: 'F7' }, { key: 'F8' }, { key: 'F9' },
      { key: 'F10' }, { key: 'F11' },
      
      // Alt combinations
      { key: 'Tab', alt: true }, // Alt+Tab
      { key: 'F4', alt: true }, // Alt+F4
      
      // Windows key combinations
      { key: 'R', meta: true }, // Win+R
      { key: 'L', meta: true }, // Win+L
      
      // Escape key
      { key: 'Escape' },
    ];

    // Función para verificar si el elemento actual permite entrada de texto
    const isInputElement = (target: EventTarget | null): boolean => {
      if (!target) return false;
      const element = target as HTMLElement;
      
      // Permitir en inputs, textareas, y elementos editables
      if (element.tagName === 'INPUT' || 
          element.tagName === 'TEXTAREA' || 
          element.contentEditable === 'true') {
        return true;
      }
      
      // Verificar si está dentro de un contenedor editable
      let parent = element.parentElement;
      while (parent) {
        if (parent.tagName === 'INPUT' || 
            parent.tagName === 'TEXTAREA' || 
            parent.contentEditable === 'true') {
          return true;
        }
        parent = parent.parentElement;
      }
      
      return false;
    };

    // Función para verificar si una combinación está bloqueada
    const isBlockedCombination = (event: KeyboardEvent) => {
      // Si estamos en un campo de entrada, permitir ciertas teclas básicas
      if (isInputElement(event.target)) {
        // Permitir teclas básicas de navegación y edición en campos de entrada
        const allowedInInputs = [
          'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
          'Home', 'End', 'Tab', 'Enter', 'Space'
        ];
        
        if (allowedInInputs.includes(event.key)) {
          return false;
        }
        
        // Permitir caracteres normales (letras, números, símbolos)
        if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
          return false;
        }
        
        // Permitir Ctrl+A (select all) solo en campos de entrada
        if (event.key.toLowerCase() === 'a' && event.ctrlKey && !event.shiftKey) {
          return false;
        }
      }
      
      return blockedKeyCombinations.some(combo => {
        const keyMatch = combo.key.toLowerCase() === event.key.toLowerCase() || 
                        combo.key === event.code;
        const ctrlMatch = combo.ctrl ? event.ctrlKey : !event.ctrlKey;
        const shiftMatch = combo.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = combo.alt ? event.altKey : !event.altKey;
        const metaMatch = combo.meta ? event.metaKey : !event.metaKey;
        
        return keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch;
      });
    };

    // Event listener para keydown
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isBlockedCombination(event)) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    };

    // Event listener para keyup
    const handleKeyUp = (event: KeyboardEvent) => {
      if (isBlockedCombination(event)) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    };

    // Event listener para keypress
    const handleKeyPress = (event: KeyboardEvent) => {
      if (isBlockedCombination(event)) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    };

    // Deshabilitar menú contextual (click derecho)
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      return false;
    };

    // Deshabilitar selección de texto
    const handleSelectStart = (event: Event) => {
      event.preventDefault();
      return false;
    };

    // Deshabilitar drag and drop
    const handleDragStart = (event: DragEvent) => {
      event.preventDefault();
      return false;
    };

    // Bloquear apertura de DevTools mediante JavaScript
    const blockDevTools = () => {
      // Detectar si DevTools está abierto
      let devtools = {
        open: false,
        orientation: null as string | null
      };
      
      const threshold = 160;
      setInterval(() => {
        if (window.outerHeight - window.innerHeight > threshold ||
            window.outerWidth - window.innerWidth > threshold) {
          if (!devtools.open) {
            devtools.open = true;
            // Redirigir o cerrar la página si se detectan DevTools
            window.location.href = 'about:blank';
          }
        } else {
          devtools.open = false;
        }
      }, 500);
    };

    // Deshabilitar funciones de consola
    const disableConsole = () => {
      // Sobrescribir métodos de console
      const noop = () => {};
      (window as any).console = {
        log: noop,
        error: noop,
        warn: noop,
        info: noop,
        debug: noop,
        trace: noop,
        dir: noop,
        dirxml: noop,
        group: noop,
        groupCollapsed: noop,
        groupEnd: noop,
        time: noop,
        timeEnd: noop,
        count: noop,
        assert: noop,
        clear: noop,
        table: noop,
        profile: noop,
        profileEnd: noop,
        timeStamp: noop
      };
    };

    // Aplicar estilos CSS para deshabilitar selección
    const applySecurityStyles = () => {
      const style = document.createElement('style');
      style.textContent = `
        * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-touch-callout: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        
        /* Permitir selección solo en inputs y textareas */
        input, textarea, [contenteditable="true"] {
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
          user-select: text !important;
        }
        
        /* Permitir selección en campos de búsqueda específicamente */
        input[type="text"], input[type="search"], input[placeholder*="earch"] {
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
          user-select: text !important;
        }
        
        /* Deshabilitar highlighting en general, pero permitir en inputs */
        ::selection {
          background: transparent !important;
        }
        
        ::-moz-selection {
          background: transparent !important;
        }
        
        /* Permitir highlighting solo en campos de entrada */
        input::selection, textarea::selection, [contenteditable="true"]::selection {
          background: #3b82f6 !important;
          color: white !important;
        }
        
        input::-moz-selection, textarea::-moz-selection, [contenteditable="true"]::-moz-selection {
          background: #3b82f6 !important;
          color: white !important;
        }
      `;
      document.head.appendChild(style);
    };

    // Registrar todos los event listeners
    document.addEventListener('keydown', handleKeyDown, { capture: true, passive: false });
    document.addEventListener('keyup', handleKeyUp, { capture: true, passive: false });
    document.addEventListener('keypress', handleKeyPress, { capture: true, passive: false });
    document.addEventListener('contextmenu', handleContextMenu, { passive: false });
    document.addEventListener('selectstart', handleSelectStart, { passive: false });
    document.addEventListener('dragstart', handleDragStart, { passive: false });

    // También en window para capturar eventos que puedan escapar
    window.addEventListener('keydown', handleKeyDown, { capture: true, passive: false });
    window.addEventListener('keyup', handleKeyUp, { capture: true, passive: false });
    window.addEventListener('keypress', handleKeyPress, { capture: true, passive: false });

    // Aplicar todas las medidas de seguridad
    applySecurityStyles();
    disableConsole();
    blockDevTools();

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('keyup', handleKeyUp, { capture: true });
      document.removeEventListener('keypress', handleKeyPress, { capture: true });
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
      
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('keyup', handleKeyUp, { capture: true });
      window.removeEventListener('keypress', handleKeyPress, { capture: true });
    };
  }, []);

  return null; // Este componente no renderiza nada
};

export default KeyboardSecurity;