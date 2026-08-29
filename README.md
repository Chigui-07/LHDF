# ⚽ La Historia del Fútbol — LHDF

Repositorio oficial del juego web **La Historia del Fútbol (LHDF)**, desarrollado por **Chigui Studios**.

## 📌 Idea del juego

LHDF parte desde un mundo en el que la historia del fútbol todavía está por escribirse. El jugador crea una fundación, impulsa los primeros clubes y construye con sus decisiones una historia propia de partidos, rivalidades, torneos y crecimiento internacional.

Los clubes, países, jugadores, nombres e identidades pueden tomar datos del mundo real, pero la historia deportiva de cada partida nace desde cero dentro del juego.

## 🌐 Plataforma

- Tipo: juego web.
- Tecnologías actuales: HTML, CSS y JavaScript.
- Repositorio: GitHub.
- Pruebas públicas: GitHub Pages.
- Guardado actual: `localStorage` del navegador.
- Estado: en desarrollo.

## 🛠️ Bitácora oficial

Este README funciona como registro de los cambios importantes del proyecto.

## 🎨 Identidad visual

- Ambientación nocturna y deportiva.
- Verde, aqua/cian, blanco y fondos oscuros.
- Transiciones mediante fundidos a negro.
- Paneles y tarjetas oscuras.
- Animaciones realizadas principalmente con CSS y JavaScript.

## 📜 Historial

### 28 de agosto de 2026 — Alpha 0.1

- Se creó el repositorio oficial `LHDF`.
- Se construyó el primer menú principal.
- Se añadieron **Nueva Historia**, **Continuar Partida**, **Configuraciones** y **Créditos**.
- Se definió **Chigui Studios** como estudio del proyecto.
- Se creó la ambientación inicial de estadio nocturno y la pelota animada.
- Se implementó el sistema base de navegación y fundidos entre pantallas.

### 28 de agosto de 2026 — Alpha 1.1

- Se creó el sistema **Nueva Historia**.
- Cada partida solicita el nombre de la fundación y del fundador.
- Guatemala quedó establecido como país inicial.
- Se implementó guardado local mediante `localStorage`.
- Cada historia posee identificador, fechas, versión y estado de introducción.
- Se impidieron nombres de fundación duplicados.
- Se construyó **Continuar Partida** con tarjetas de guardado.
- Se añadieron selección, partida activa y eliminación con confirmación.
- Alpha 1.1 quedó cerrada como la base funcional de historias y guardados.

### 28–29 de agosto de 2026 — Alpha 2.1: Introducción animada

- Se creó la secuencia narrativa completa que presenta el nacimiento del fútbol dentro de una nueva historia.
- **El Sueño:** estadio nocturno, iluminación progresiva, pelota y primeras ideas del fundador.
- **Nacimiento de la fundación:** escritorio, documentos, nombre dinámico de la fundación y sello de fundación.
- **Fundación desconocida:** escena urbana en la que todavía nadie conoce el proyecto.
- **Primera convocatoria:** cancha comunitaria, jóvenes, carteles e invitación pública.
- Se creó una pantalla interactiva para escoger el primer club entre 12 clubes de Guatemala.
- Se añadieron los escudos cargados desde `assets/clubs/guatemala/`.
- La selección guarda `selectedClub`, `clubSelected` y el `rivalClub` resuelto para esa historia.
- Se añadió una celebración con confeti independiente de los colores del club.
- Se creó la animación del **primer clásico**, mostrando el club elegido contra su rival automático.
- En el universo de LHDF este encuentro establece el primer clásico de esa historia, sin depender de rivalidades reales previas.
- Se creó la escena final con los dos clubes descubiertos y los restantes ocultos mediante tarjetas negras con `?`.
- La última escena establece `introCompleted: true`, por lo que la introducción completa solo debe reproducirse una vez por historia.
- Se retiraron los atajos temporales utilizados durante las pruebas de las animaciones.
- Se añadieron ajustes responsive para que las escenas se mantengan centradas y dentro del viewport en ventana y pantalla completa.
- Alpha 2.1 queda cerrada como la versión de **introducción, elección del club y origen de la primera rivalidad**.

### 29 de agosto de 2026 — Inicio de Alpha 3.1

- Se creó la rama `alpha-3.1` desde el cierre de Alpha 2.1.
- Se inició la construcción de la pantalla real de **Configuraciones**.
- Las preferencias se guardan en `lhdf.settings` dentro de `localStorage`.
- Se añadió un control funcional para entrar y salir de pantalla completa.
- Se añadió la opción de reducir las animaciones del juego.
- Se añadió selección entre transiciones normales y rápidas.
- Se añadió ajuste de tamaño de interfaz entre 90%, 100% y 110%.
- Se añadió restablecimiento de configuraciones.
- La interfaz visible identifica el desarrollo como **Alpha 3.1**.

### 29 de agosto de 2026 — Alpha 3.1: Base del Hub principal

- Se creó la primera versión funcional del **Hub principal**.
- El Hub muestra el nombre de la fundación, fundador y país de la partida activa.
- Se muestran el club elegido y el rival que originó el primer clásico, con sus escudos.
- Se añadieron accesos provisionales para **Clubes**, **Jugadores**, **Partidos**, **Torneos** y **Fundación**.
- Las historias con `introCompleted: true` entran directamente al Hub desde **Continuar Partida**.
- La última escena de la introducción entra al Hub al terminar por primera vez.
- Se añadió un botón manual **Guardar partida**.
- Se añadió **Guardar y salir**, que actualiza el guardado antes de volver al menú principal.
- Al guardar desde el Hub, la historia actualiza su fecha de guardado y queda identificada como **Alpha 3.1**.

### 29 de agosto de 2026 — Alpha 3.1: Clubes, países y jugadores

- El módulo **Clubes** quedó disponible desde el Hub.
- Solo el club elegido por el jugador aparece descubierto; los otros clubes se muestran en negro con `?`.
- Se creó un menú base propio para el club seleccionado con accesos futuros a Plantilla, Estadísticas, Historia y Gestión.
- Se añadió el módulo **Países** al Hub y Guatemala quedó como primer país disponible.
- Se creó una base común de datos en `js/game-data.js` para relacionar países, clubes y jugadores.
- Se activó la pantalla de **Jugadores** y Guatemala abre directamente su registro de futbolistas.
- Se creó `js/players-guatemala.js` como archivo separado para mantener actualizado el pool nacional sin modificar el resto del mundo.
- El pool inicial de Guatemala contiene jugadores guatemaltecos identificados en plantillas de **primer equipo** de clubes de la Liga Nacional 2026/27.
- No se importan plantillas Sub-20, Sub-22, academias o juveniles como fuentes independientes.
- Un jugador joven sí puede formar parte del pool si ya aparece en la plantilla del primer equipo de su club.
- Los futbolistas extranjeros o nacionalizados guatemaltecos cuyo origen futbolístico corresponde a otro país no se incorporan al pool de Guatemala.
- Todos los jugadores comienzan con `clubId: null`: ningún club real queda fijado dentro de una historia nueva.
- `referenceClubId` conserva únicamente el club real usado para verificar que el jugador estaba activo en Guatemala al crear la base.
- La pantalla de jugadores permite filtrar por país y posición y muestra a todos inicialmente como **Sin club en esta historia**.

## 🚧 Alpha 3.1 — En desarrollo

Objetivos principales:

- Expandir el **Hub principal** y definir la navegación real del juego.
- Completar y ampliar **Configuraciones** conforme aparezcan nuevos sistemas como audio.
- Preparar la arquitectura sobre la que se añadirán clubes, partidos, torneos y herramientas de gestión.
- Convertir progresivamente los módulos provisionales del Hub en sistemas jugables.
- Revisar y mantener actualizado el pool de jugadores de Guatemala conforme cambien las plantillas reales.

## 🌿 Ramas de desarrollo

Las versiones Alpha se conservan en ramas separadas para mantener el historial del proyecto. El desarrollo activo se encuentra en `alpha-3.1`.
