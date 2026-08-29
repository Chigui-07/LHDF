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
- Alpha 2.1 queda cerrada como la versión de **introducción, elección del club y origen de la primera rivalidad**.

## 🚧 Alpha 3.1 — En desarrollo

La siguiente versión comienza el juego después de la introducción.

Objetivos iniciales:

- Crear el **Hub principal** de cada historia.
- Hacer que las historias con `introCompleted: true` entren directamente al Hub.
- Desarrollar una pantalla real de **Configuraciones**.
- Añadir modo de pantalla completa y opciones básicas de experiencia.
- Preparar la arquitectura sobre la que se añadirán clubes, partidos, torneos y herramientas de gestión.

## 🌿 Ramas de desarrollo

Las versiones Alpha se conservan en ramas separadas para mantener el historial del proyecto. El desarrollo activo pasa a `alpha-3.1` una vez cerrada Alpha 2.1.
