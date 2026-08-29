// Alpha 3.1 — Pool inicial de jugadores de Guatemala.
// Regla: jugadores guatemaltecos presentes en plantillas de primer equipo de clubes de Guatemala.
// No se importan plantillas Sub-20/juveniles por separado. El club real solo se conserva como referencia.
(() => {
  const data = window.LHDF_DATA;
  if (!data) return;
  data.players = [];

  const normalizeId = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const add = (referenceClubId, position, names) => names.forEach((name) => data.players.push({ id: `${referenceClubId}-${normalizeId(name)}`, name, countryId: 'guatemala', clubId: null, referenceClubId, position, referenceSeason: '2026/27', pool: 'senior-first-team' }));

  add('municipal', 'Portero', ["Braulio Linares", "Kenderson Navarro"]);
  add('municipal', 'Defensa', ["Carlos Aguilar", "Carlos Estrada", "Cristian Jiménez", "José Alfredo Morales", "Nicolás Samayoa"]);
  add('municipal', 'Mediocampista', ["Pedro Altán", "Rudy Barrientos", "Jonathan Franco", "John Méndez", "Rudy Muñoz", "Rodrigo Saravia"]);
  add('municipal', 'Delantero', ["César Archila", "Jefry Bantes", "José Carlos Martínez"]);

  add('comunicaciones', 'Portero', ["Fredy Pérez", "Arnold Barrios"]);
  add('comunicaciones', 'Defensa', ["José Carlos Pinto", "Kevin Grijalva", "Elsar Cruz Martín", "Emerson Raymundo", "David Prada", "Diego Santis"]);
  add('comunicaciones', 'Mediocampista', ["Marco Domínguez", "Samuel Camacho", "Stheven Robles", "Joseph Folgar", "Brayam Castañeda", "Axel de la Cruz"]);
  add('comunicaciones', 'Delantero', ["Nelson García", "Andersson Ortiz", "Erick Lemus", "Dewinder Bradley"]);

  add('antigua-gfc', 'Portero', ["Luis Morán", "Jorge Moreno"]);
  add('antigua-gfc', 'Defensa', ["José Ardón", "Wálter Paz", "Alejandro González", "Héctor Prillwitz", "Dilan Palencia", "José Gálvez"]);
  add('antigua-gfc', 'Mediocampista', ["Óscar Castellanos", "Allan García", "Guillermo Carbonell", "José Rosales", "Selvin Sagastume", "Jimmy Ruiz", "Santiago Garzaro", "José Espinoza"]);
  add('antigua-gfc', 'Delantero', ["Diego Fernández", "William Fajardo", "Jhostin Colindres", "José Franco"]);

  add('xelaju-mc', 'Portero', ["Estuardo Chang", "Álvaro Marcelo García Zaroba", "Estuardo Sican"]);
  add('xelaju-mc', 'Defensa', ["Javier González", "José Castañeda", "Kevin Ruiz", "Widvin Tebalán", "Erick González", "Jesús López"]);
  add('xelaju-mc', 'Mediocampista', ["Maynor de León", "Ricardo Eliud Márquez Álvarez", "Claudio de Oliveira", "Juan Cardona", "José Carlos López Avila", "Joshua Ramiro Ubico Pyle", "Diego Emiliano Ovando Monzón", "Jorge Aparicio"]);
  add('xelaju-mc', 'Delantero', ["Óscar Mejía", "Hárim Quezada", "Raúl Calderón", "Oscar de León", "Elmer Cardoza"]);

  add('mixco', 'Portero', ["Kevin Moscoso", "Mynor Roberto Padilla Zúñiga", "Mario Mendoza"]);
  add('mixco', 'Defensa', ["Jeshua Urizar", "Nixsón Flores", "Aldo Paolo Luna Velásquez", "Cristian Jiménez", "Allen Yanes", "Rodrigo Marroquin Santos", "Manuel Moreno", "Diego Orlando Méndez Vásquez"]);
  add('mixco', 'Mediocampista', ["Juan Sebastián Mancilla Véliz", "Diego Fabian Marroquin Pérez", "Oscar Andrés González Palma", "Esnaydi Zúñiga", "Kener Lemus", "Christian Ojeda", "Kevin Illescas"]);
  add('mixco', 'Delantero', ["Jeremy Emanuel Chinchilla Gómez", "José Ramón Bolaños Boburg", "Yonatan Pozuelos", "Jefrey Rodrigo Segura Morán", "Esteban García"]);

  add('guastatoya', 'Portero', ["Abner Estuardo Pérez Beltetón", "Brayan Hernández"]);
  add('guastatoya', 'Defensa', ["Andy José Contreras Hernández", "Brayan Morales", "Samuel Garrido", "Kevyn Aguilar", "Víctor Efraín Armas López", "Luis Benjamín Urías Morales", "Wilson Pineda"]);
  add('guastatoya', 'Mediocampista', ["Ariel Lon", "Herberth Amaniel Morales Solís", "Jeferson Snaider Macal López", "Jonathan Robelvy Estrada Balcarcel", "Javier Estrada", "Carlos Alvarado", "Marlon Sequén", "Anderson Molina", "Stuart Romilio Jusviel Ramos Marroquín", "Yordi Estid Adonay Aguilar Colíndres"]);
  add('guastatoya', 'Delantero', ["Gilder Otoniel Cruz Ortíz", "Denilson Sánchez", "Bryan Lemus", "Christopher Ramírez", "Edy Palencia"]);

  add('san-pedro', 'Portero', ["Vander Estuardo Cruz Véliz"]);
  add('san-pedro', 'Defensa', ["Mathius Gaitán", "Steveth Óscar Javier Chacón Maldonado", "Romario Gómez Palacios", "Emerson Gonzalo García Matías", "Edgar Alejandro Macal Razulfo"]);
  add('san-pedro', 'Mediocampista', ["Yonathan Morán", "Edwin Fuentes"]);
  add('san-pedro', 'Delantero', ["Alexis Jesús Eduardo Barrientos Mejía", "Jorge Vargas"]);

  add('suchitepequez', 'Portero', ["Eder Alexander García Castillo", "Julio Steven Secaida Gómez"]);
  add('suchitepequez', 'Defensa', ["Jorge Matul", "Denilson Luis Antonio Hernández Coronado", "César Augusto Madrid Franco", "Dany Klisman Rodas Cifuentes", "Nery Gerardo Cifuentes Pinto"]);
  add('suchitepequez', 'Mediocampista', ["Mafre Icuté", "Edwin Armando Morales", "Frank de León", "Esvin Noé de León Hernández", "Alejandro Galindo", "Denis Herrera", "Figo Montaño"]);
  add('suchitepequez', 'Delantero', ["Erick Rivera", "Mateo Alvarado Vicente", "Adrián Enrique Cifuentes Pinto"]);

  add('marquense', 'Portero', ["Esteban Benjamin Pérez Bravo", "Jordy Cifuentes", "Carlos Josué Rodríguez Almeda"]);
  add('marquense', 'Defensa', ["Randall Corado", "Ryan Eduardo Díaz López", "Fernando Fuentes", "Gerardo Gordillo"]);
  add('marquense', 'Delantero', ["Erick Sanchez"]);

  add('aurora', 'Portero', ["Diego Navas", "Ian Cabrera"]);
  add('aurora', 'Defensa', ["Klisman Rene García Samayoa", "Carlos Flores", "Luís Cardona", "Emmanuel Esaú Almaraz Flores", "Carlos Monterroso", "José Manuel Lémus Ruíz", "Raúl Alfredo Tobías Guzmán"]);
  add('aurora', 'Mediocampista', ["Rogger Ariel López Larios", "Diego Fernando Gómez Méndez", "Daniel Alexander Bajan Morales", "Jorge Rigoberto Ticurú de Paz", "Lenin Obed González Aguilar", "Roger Estuardo Hernández Camey", "Jimmy Joshuaky Álvarez Rivera", "Gabriel Grajeda Campos", "Hector Alejandro Morales Muñoz", "José Pablo Grajeda Salinas", "Jorge Mario Batres Salazar", "Matías Sebastián Hernández Lainfiesta", "Hugo Alejandro Cid Meda", "José Alejandro Trujillo Asturias", "Melvin Allan Chén Lima"]);
  add('aurora', 'Delantero', ["Juan Gomez", "Álex Estuardo Díaz Zamora", "Juan Pablo Rafael Monterroso Pineda", "Adrián Morales Aguilar", "Paulo André Motta Velásquez", "Víctor Hugo Urias Martínez", "Diego Ruiz", "Andrés Josael Echeverría Pérez"]);

  add('malacateco', 'Portero', ["Abel Josué Guzmán Menéndez"]);
  add('malacateco', 'Defensa', ["Luis Javier Yagut Solis", "Uzias Hernández", "Rudy Comayagua", "Andy Jorge Luis Soto Arrecis", "Andru Daniel Alí Morales Cisneros", "Marco Rivaí Girón Escobar"]);
  add('malacateco', 'Mediocampista', ["Gerson Michael Morales Morales", "Frankli Quinteros", "Jorge Sánchez", "Arsham Naeem García Salinas", "Jonathan Abisai Castañon Fuentes", "Kevin Ramírez", "Sergio Armando Pérez Ramírez", "Isaías Mauricio de León Peque", "Gabino Vásquez", "José Ochoa"]);
  add('malacateco', 'Delantero', ["Nelson Andrade", "José Longo", "Joshua Trigueño", "Ditter Lang", "Demcy Jafeth Guzmán Mirón", "Vidal Paz"]);

  add('coban-imperial', 'Portero', ["Javier Armando Romero Pivaral", "Luis Pereira"]);
  add('coban-imperial', 'Defensa', ["Eduardo Soto", "Blady Aldana Estrada", "Luis de León", "Ángel Cabrera", "Selvin Teni", "Carlos Alberto Winter Sierra"]);
  add('coban-imperial', 'Mediocampista', ["Jonathan Alexis Morán Urízar", "Diego Amilcar Chen Chocooj", "Lester Armando Ical", "William Amaya", "Yeltsin Álvarez", "Steven Paredes Beltetón", "Keneth Alexander Valdez Morales", "Byron Leal", "Luis Rosas"]);
  add('coban-imperial', 'Delantero', ["Michael Orlando Moreira Barillas", "Juan Winter"]);
})();
