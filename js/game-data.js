// Alpha 3.1 — Datos base compartidos del mundo de LHDF.
window.LHDF_DATA = window.LHDF_DATA || {
  countries: [
    { id: 'guatemala', name: 'Guatemala', code: 'GT', flag: 'assets/flags/guatemala.png', discovered: true }
  ],
  clubs: [
    { id: 'municipal', countryId: 'guatemala', name: 'Municipal', logo: 'CSD Municipal.png' },
    { id: 'comunicaciones', countryId: 'guatemala', name: 'Comunicaciones', logo: 'Comunicaciones FC.png' },
    { id: 'antigua-gfc', countryId: 'guatemala', name: 'Antigua GFC', logo: 'Antigua GFC.png' },
    { id: 'xelaju-mc', countryId: 'guatemala', name: 'Xelajú MC', logo: 'Xelaju FC.png' },
    { id: 'mixco', countryId: 'guatemala', name: 'Deportivo Mixco', logo: 'Mixco FC.png' },
    { id: 'guastatoya', countryId: 'guatemala', name: 'Guastatoya', logo: 'Guastatoya FC.png' },
    { id: 'san-pedro', countryId: 'guatemala', name: 'San Pedro', logo: 'San Pedro FC.png' },
    { id: 'suchitepequez', countryId: 'guatemala', name: 'Suchitepéquez', logo: 'Suchitepequez FC.png' },
    { id: 'marquense', countryId: 'guatemala', name: 'Marquense', logo: 'Marquense FC.png' },
    { id: 'aurora', countryId: 'guatemala', name: 'Aurora FC', logo: 'Aurora FC.png' },
    { id: 'malacateco', countryId: 'guatemala', name: 'Malacateco', logo: 'Malacateco FC.png' },
    { id: 'coban-imperial', countryId: 'guatemala', name: 'Cobán Imperial', logo: 'Coban Imperial FC.png' }
  ],
  // Los jugadores se relacionan con su país; clubId es el club dentro de la historia.
  players: []
};
