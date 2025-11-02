# Prueba de Audio Persistente - Radio Conecta

## 🎯 Objetivo
Verificar que el audio del stream de radio se mantiene sonando al navegar entre páginas.

## 📋 Pasos de Prueba

### 1. Abrir la Consola del Navegador
- **Chrome/Edge**: F12 o Cmd+Option+I (Mac) / Ctrl+Shift+I (Windows)
- **Firefox**: F12 o Cmd+Option+K (Mac) / Ctrl+Shift+K (Windows)
- **Safari**: Cmd+Option+C (primero habilitar menú Desarrollador en Preferencias)

### 2. Acceder al Sitio
Abre en tu navegador: **http://localhost:8080/index.html**

### 3. Verificar Inicialización
En la consola deberías ver:
```
🎵 Creando nuevo RadioPlayer global
✅ RadioPlayer disponible globalmente
🚀 Inicializando Radio Conecta
```

### 4. Iniciar Reproducción
- Haz clic en el botón **"🔴 Escuchar en vivo"**
- En la consola deberías ver:
```
🔗 Interceptando clic en: radio.html
▶️ Iniciando reproducción
🔄 PJAX navegando a: http://localhost:8080/radio.html
▶️ Play solicitado
✅ Reproduciendo
✅ Reemplazando contenido sin recargar página
```

### 5. Navegar Entre Páginas
Mientras el audio está sonando, haz clic en:
- **Top 10**
- **Noticias**
- **Programación**
- **Inicio**

#### ✅ Comportamiento Esperado:
- El audio **NO se detiene**
- En la consola aparece: `🔄 PJAX navegando a:` seguido de `✅ Reemplazando contenido sin recargar página`
- La URL cambia pero la página NO recarga completamente
- El miniplayer (barra inferior) sigue visible y funcionando

#### ❌ Comportamiento Incorrecto:
- Si el audio se pausa
- Si la consola se limpia (indica recarga completa)
- Si aparece: `⚠️ No se encontró #pjax-container, recargando página`

### 6. Verificar Miniplayer
- El miniplayer (barra inferior) debe estar visible en todas las páginas
- Botón play/pause debe funcionar
- Control de volumen debe funcionar

## 🐛 Troubleshooting

### Problema: Audio se pausa al cambiar de página

**Verifica en la consola:**

1. Si ves `⚠️ No se encontró #pjax-container`:
   - Significa que falta el contenedor PJAX en alguna página
   - Revisa que todas las páginas tengan `<div id="pjax-container">`

2. Si ves `🎵 Creando nuevo RadioPlayer global` más de una vez:
   - Significa que `player.js` se está cargando múltiples veces
   - Verifica que los scripts estén FUERA del `#pjax-container`

3. Si NO ves `🔗 Interceptando clic en:`:
   - El listener de clics no se está registrando
   - Verifica que `main.js` se carga correctamente

4. Si la consola se limpia al cambiar de página:
   - La página se está recargando completamente
   - PJAX no está funcionando

### Problema: No aparecen los logs en consola

Abre la consola ANTES de cargar la página y asegúrate de:
- Tener activado "Preserve log" (Chrome) o "Persist Logs" (Firefox)
- No tener filtros activos en la consola

## 📱 Prueba en Móvil

### iOS (Safari)
1. Conecta tu iPhone al Mac
2. Safari > Desarrollador > [tu iPhone] > [la pestaña]
3. Sigue los pasos 3-5 anteriores

### Android (Chrome)
1. Activa "Depuración USB" en el dispositivo
2. Chrome en PC > chrome://inspect
3. Selecciona tu dispositivo
4. Sigue los pasos 3-5 anteriores

## ✅ Resultado Esperado Final

El audio debe:
- ✅ Iniciarse al hacer clic en "Escuchar en vivo"
- ✅ Continuar sonando al navegar entre todas las páginas
- ✅ Seguir sonando al bloquear la pantalla (móvil)
- ✅ Mostrar controles en el lockscreen (móvil)
- ✅ Poder ser controlado desde el miniplayer en cualquier página
