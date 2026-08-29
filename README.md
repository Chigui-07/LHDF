# ⚽ La Historia del Fútbol — LHDF

Repositorio oficial del juego web **La Historia del Fútbol (LHDF)**.

## 📌 Descripción

LHDF será un juego web relacionado con la historia y evolución del fútbol. El proyecto se desarrollará progresivamente desde cero, agregando sistemas, equipos, jugadores, torneos, partidos y demás funciones conforme avance el desarrollo.

## 🌐 Plataforma

- Tipo de proyecto: Juego web
- Repositorio: GitHub
- Publicación de pruebas: GitHub Pages
- Estado: En desarrollo
- Estudio: **Chigui Studios**

## 🛠️ Desarrollo

Este README funcionará como **bitácora oficial del proyecto**. Cada actualización importante realizada al juego será registrada aquí para mantener un historial claro de los cambios.

## 🎨 Identidad visual base

- Ambientación principal basada en un estadio nocturno.
- Colores principales: verde, aqua/cian, blanco y negro translúcido.
- Botones verdes con iluminación aqua al pasar el cursor.
- Pelota de fútbol animada y giratoria en el menú principal.
- Paneles oscuros y translúcidos para mantener la estética del estadio.
- Transiciones entre pantallas mediante un fundido suave a negro.

## 📜 Historial de actualizaciones

### 28 de agosto de 2026 — Inicio del nuevo proyecto

- Se creó el repositorio oficial `LHDF`.
- Se decidió desarrollar **La Historia del Fútbol** como un juego web.
- Se comenzó a utilizar este README como registro oficial de actualizaciones.

### 28 de agosto de 2026 — Primer prototipo web

- Se creó `index.html` como página inicial del juego.
- Se agregó `css/style.css` para los primeros estilos visuales.
- Se agregó `js/main.js` para la primera interacción básica.
- Se comprobó correctamente la publicación web del proyecto.

### 28 de agosto de 2026 — Menú principal Alpha 0.1

- Se reemplazó la portada de prueba por el primer menú principal real de LHDF.
- Se añadieron los botones **Nueva Historia**, **Continuar Partida**, **Configuraciones** y **Créditos**.
- Se definió a **Chigui Studios** como estudio del proyecto.
- Se creó una ambientación de estadio nocturno completamente mediante CSS.
- Se añadió una pelota de fútbol animada que gira y flota en el menú.
- Los botones utilizan verde como color principal y cambian a aqua/cian al pasar el cursor.
- Se añadieron efectos de iluminación, movimiento y respuesta al hacer clic.
- Se implementó un sistema reutilizable de transición `fade out → cambio de pantalla → fade in`.
- Se añadieron pantallas provisionales para probar la navegación de las cuatro opciones principales.
- Se añadió diseño adaptable para escritorio y teléfono.

### 28 de agosto de 2026 — Alpha 1.1: Nueva Historia

- Se creó la rama `alpha-1.1` a partir de la versión estable anterior.
- Se rediseñó por completo la pantalla **Nueva Historia** para mantener el estilo visual del menú.
- La creación de una historia ahora solicita únicamente **Fundación** y **Nombre del fundador**.
- Guatemala queda establecido internamente como país inicial de todas las nuevas historias.
- La elección del club se realizará posteriormente dentro de la partida.
- Se añadió validación básica de los datos introducidos.
- La versión visible del menú se actualizó a **Alpha 1.1**.

### 28 de agosto de 2026 — Alpha 1.1: Sistema de guardado

- Se implementó guardado local mediante `localStorage`.
- Cada nueva historia guarda el nombre de la fundación, fundador, país inicial, fecha de creación, última actualización y versión del juego.
- Se genera un identificador único para cada historia.
- La historia recién creada queda marcada como la partida actual.
- Se añadió el estado `introCompleted: false` para preparar la futura introducción animada.
- Las historias guardadas permanecen disponibles aunque se cierre o recargue el navegador.

### 28 de agosto de 2026 — Alpha 1.1: Continuar Partida

- Se conectó la pantalla **Continuar Partida** con las historias almacenadas en el navegador.
- Las partidas guardadas aparecen como tarjetas individuales.
- Cada tarjeta muestra fundación, fundador, país, último guardado y versión.
- La partida activa queda identificada visualmente.
- El jugador puede seleccionar una historia y convertirla en la partida activa.
- Al seleccionar una historia se actualiza su fecha de último acceso.
- Se añadió eliminación de partidas con confirmación integrada en la interfaz.
- Si se elimina la partida activa, otra historia pasa a ser la actual automáticamente cuando existe una disponible.
- Si no existen guardados, la pantalla muestra un estado vacío.

### 28 de agosto de 2026 — Cierre funcional de Alpha 1.1

- Se impide crear dos partidas con el mismo nombre de fundación, ignorando diferencias entre mayúsculas y minúsculas.
- La partida creada queda seleccionada inmediatamente como partida activa.
- Al pulsar **Crear Historia**, el juego guarda los datos y entra automáticamente al punto de inicio de la introducción.
- **Continuar Partida** también carga la historia elegida y la dirige al mismo punto de entrada.
- Se añadió una pantalla provisional de introducción para verificar el flujo completo antes de desarrollar las animaciones reales.
- La pantalla provisional muestra la fundación y el fundador cargados.
- Las animaciones reales no forman parte de Alpha 1.1 y serán implementadas en Alpha 2.1.

## 🧭 Próxima etapa — Alpha 2.1

- La **Alpha 2.1** estará dedicada a la introducción animada de la historia.
- La secuencia explicará el sueño del fundador de crear un deporte capaz de crecer hasta volverse mundial.
- Se mostrará el nacimiento de la fundación, que al principio será desconocida.
- La inauguración comenzará invitando a jóvenes para formar pequeños clubes.
- Estos clubes podrán desarrollarse y crecer conforme avance el tiempo dentro de la partida.
- La introducción se dividirá en varias escenas y animaciones para que la historia se entienda de forma progresiva.

## 🚧 Estado actual

La **Alpha 1.1** cuenta con menú principal, creación de historias, validación de nombres duplicados, guardado local, selección de partidas, eliminación de guardados y flujo automático hacia el inicio de la futura introducción. Con esto, la base del sistema de partidas queda preparada para comenzar la **Alpha 2.1**.
