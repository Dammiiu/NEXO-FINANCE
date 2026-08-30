export interface GlobalIdentity {
  name: string;
  country: string;
  flag: string;
  city: string;
  region: 'Americas' | 'Europe' | 'Asia' | 'Middle East' | 'Africa' | 'Oceania';
}

export const GLOBAL_IDENTITIES: GlobalIdentity[] = [
  // --- NORTH AMERICA (1-50) ---
  { name: 'Alexander Vance', country: 'United States', flag: '🇺🇸', city: 'New York', region: 'Americas' },
  { name: 'Sarah Jenkins', country: 'United States', flag: '🇺🇸', city: 'San Francisco', region: 'Americas' },
  { name: 'Marcus Sterling', country: 'United States', flag: '🇺🇸', city: 'Chicago', region: 'Americas' },
  { name: 'Chloe Montgomery', country: 'United States', flag: '🇺🇸', city: 'Austin', region: 'Americas' },
  { name: 'Ethan Richardson', country: 'United States', flag: '🇺🇸', city: 'Boston', region: 'Americas' },
  { name: 'David K. Miller', country: 'United States', flag: '🇺🇸', city: 'Seattle', region: 'Americas' },
  { name: 'Emma Sullivan', country: 'United States', flag: '🇺🇸', city: 'Miami', region: 'Americas' },
  { name: 'Jonathan Hayes', country: 'United States', flag: '🇺🇸', city: 'Denver', region: 'Americas' },
  { name: 'Olivia Kensington', country: 'United States', flag: '🇺🇸', city: 'Los Angeles', region: 'Americas' },
  { name: 'Brandon Cole', country: 'United States', flag: '🇺🇸', city: 'Atlanta', region: 'Americas' },
  { name: 'Tyler Bennett', country: 'United States', flag: '🇺🇸', city: 'Dallas', region: 'Americas' },
  { name: 'Hannah Campbell', country: 'United States', flag: '🇺🇸', city: 'Phoenix', region: 'Americas' },
  { name: 'Noah Abernathy', country: 'United States', flag: '🇺🇸', city: 'Philadelphia', region: 'Americas' },
  { name: 'Sophia Reynolds', country: 'United States', flag: '🇺🇸', city: 'San Diego', region: 'Americas' },
  { name: 'Austin Bradley', country: 'United States', flag: '🇺🇸', city: 'Charlotte', region: 'Americas' },
  { name: 'Victoria Thorne', country: 'United States', flag: '🇺🇸', city: 'Nashville', region: 'Americas' },
  { name: 'Mason Lockhart', country: 'United States', flag: '🇺🇸', city: 'Houston', region: 'Americas' },
  { name: 'Grace Davenport', country: 'United States', flag: '🇺🇸', city: 'Las Vegas', region: 'Americas' },
  { name: 'Logan Prescott', country: 'United States', flag: '🇺🇸', city: 'Portland', region: 'Americas' },
  { name: 'Rachel Whitaker', country: 'United States', flag: '🇺🇸', city: 'Salt Lake City', region: 'Americas' },
  { name: 'Zachary Thornton', country: 'United States', flag: '🇺🇸', city: 'Minneapolis', region: 'Americas' },
  { name: 'Brooke Harrison', country: 'United States', flag: '🇺🇸', city: 'Orlando', region: 'Americas' },
  { name: 'Caleb Sterling', country: 'United States', flag: '🇺🇸', city: 'Tampa', region: 'Americas' },
  { name: 'Madeline Frost', country: 'United States', flag: '🇺🇸', city: 'Columbus', region: 'Americas' },
  { name: 'Trevor Vance', country: 'United States', flag: '🇺🇸', city: 'Indianapolis', region: 'Americas' },
  { name: 'Liam Dubois', country: 'Canada', flag: '🇨🇦', city: 'Toronto', region: 'Americas' },
  { name: 'Isabella Tremblay', country: 'Canada', flag: '🇨🇦', city: 'Montreal', region: 'Americas' },
  { name: 'Noah MacLeod', country: 'Canada', flag: '🇨🇦', city: 'Vancouver', region: 'Americas' },
  { name: 'Charlotte Roy', country: 'Canada', flag: '🇨🇦', city: 'Calgary', region: 'Americas' },
  { name: 'Lucas Gagnon', country: 'Canada', flag: '🇨🇦', city: 'Ottawa', region: 'Americas' },
  { name: 'Benjamin Bouchard', country: 'Canada', flag: '🇨🇦', city: 'Edmonton', region: 'Americas' },
  { name: 'Ava Gauthier', country: 'Canada', flag: '🇨🇦', city: 'Quebec City', region: 'Americas' },
  { name: 'William Fortin', country: 'Canada', flag: '🇨🇦', city: 'Winnipeg', region: 'Americas' },
  { name: 'Emily Morin', country: 'Canada', flag: '🇨🇦', city: 'Halifax', region: 'Americas' },
  { name: 'Samuel Belanger', country: 'Canada', flag: '🇨🇦', city: 'Victoria', region: 'Americas' },
  { name: 'Antoine Lemieux', country: 'Canada', flag: '🇨🇦', city: 'Laval', region: 'Americas' },
  { name: 'Chloe Beaulieu', country: 'Canada', flag: '🇨🇦', city: 'Gatineau', region: 'Americas' },
  { name: 'Mateo Hernandez', country: 'Mexico', flag: '🇲🇽', city: 'Mexico City', region: 'Americas' },
  { name: 'Sofia Rodriguez', country: 'Mexico', flag: '🇲🇽', city: 'Guadalajara', region: 'Americas' },
  { name: 'Diego Martinez', country: 'Mexico', flag: '🇲🇽', city: 'Monterrey', region: 'Americas' },
  { name: 'Valentina Lopez', country: 'Mexico', flag: '🇲🇽', city: 'Puebla', region: 'Americas' },
  { name: 'Santiago Gonzalez', country: 'Mexico', flag: '🇲🇽', city: 'Tijuana', region: 'Americas' },
  { name: 'Camila Perez', country: 'Mexico', flag: '🇲🇽', city: 'Leon', region: 'Americas' },
  { name: 'Sebastian Sanchez', country: 'Mexico', flag: '🇲🇽', city: 'Cancun', region: 'Americas' },
  { name: 'Lucia Ramirez', country: 'Mexico', flag: '🇲🇽', city: 'Merida', region: 'Americas' },
  { name: 'Emiliano Torres', country: 'Mexico', flag: '🇲🇽', city: 'Queretaro', region: 'Americas' },
  { name: 'Ximena Flores', country: 'Mexico', flag: '🇲🇽', city: 'San Luis Potosi', region: 'Americas' },
  { name: 'Rodrigo Morales', country: 'Mexico', flag: '🇲🇽', city: 'Toluca', region: 'Americas' },
  { name: 'Paulina Navarro', country: 'Mexico', flag: '🇲🇽', city: 'Chihuahua', region: 'Americas' },
  { name: 'Mariana Delgado', country: 'Mexico', flag: '🇲🇽', city: 'Hermosillo', region: 'Americas' },

  // --- CENTRAL & SOUTH AMERICA (51-100) ---
  { name: 'Gabriel Silva', country: 'Brazil', flag: '🇧🇷', city: 'São Paulo', region: 'Americas' },
  { name: 'Helena Santos', country: 'Brazil', flag: '🇧🇷', city: 'Rio de Janeiro', region: 'Americas' },
  { name: 'Arthur Oliveira', country: 'Brazil', flag: '🇧🇷', city: 'Brasília', region: 'Americas' },
  { name: 'Alice Souza', country: 'Brazil', flag: '🇧🇷', city: 'Curitiba', region: 'Americas' },
  { name: 'Bernardo Lima', country: 'Brazil', flag: '🇧🇷', city: 'Belo Horizonte', region: 'Americas' },
  { name: 'Laura Pereira', country: 'Brazil', flag: '🇧🇷', city: 'Porto Alegre', region: 'Americas' },
  { name: 'Heitor Ferreira', country: 'Brazil', flag: '🇧🇷', city: 'Salvador', region: 'Americas' },
  { name: 'Manuela Costa', country: 'Brazil', flag: '🇧🇷', city: 'Recife', region: 'Americas' },
  { name: 'Davi Ribeiro', country: 'Brazil', flag: '🇧🇷', city: 'Fortaleza', region: 'Americas' },
  { name: 'Sophia Carvalho', country: 'Brazil', flag: '🇧🇷', city: 'Florianópolis', region: 'Americas' },
  { name: 'Lucas Guimarães', country: 'Brazil', flag: '🇧🇷', city: 'Campinas', region: 'Americas' },
  { name: 'Juliana Barbosa', country: 'Brazil', flag: '🇧🇷', city: 'Vitória', region: 'Americas' },
  { name: 'Facundo Rossi', country: 'Argentina', flag: '🇦🇷', city: 'Buenos Aires', region: 'Americas' },
  { name: 'Martina Gomez', country: 'Argentina', flag: '🇦🇷', city: 'Cordoba', region: 'Americas' },
  { name: 'Joaquin Fernandez', country: 'Argentina', flag: '🇦🇷', city: 'Rosario', region: 'Americas' },
  { name: 'Delfina Alvarez', country: 'Argentina', flag: '🇦🇷', city: 'Mendoza', region: 'Americas' },
  { name: 'Bautista Diaz', country: 'Argentina', flag: '🇦🇷', city: 'La Plata', region: 'Americas' },
  { name: 'Catalina Romero', country: 'Argentina', flag: '🇦🇷', city: 'San Miguel de Tucumán', region: 'Americas' },
  { name: 'Gonzalo Benitez', country: 'Argentina', flag: '🇦🇷', city: 'Mar del Plata', region: 'Americas' },
  { name: 'Tomas Herrera', country: 'Chile', flag: '🇨🇱', city: 'Santiago', region: 'Americas' },
  { name: 'Isidora Castro', country: 'Chile', flag: '🇨🇱', city: 'Valparaíso', region: 'Americas' },
  { name: 'Matias Morales', country: 'Chile', flag: '🇨🇱', city: 'Concepción', region: 'Americas' },
  { name: 'Florencia Munoz', country: 'Chile', flag: '🇨🇱', city: 'La Serena', region: 'Americas' },
  { name: 'Cristobal Vega', country: 'Chile', flag: '🇨🇱', city: 'Antofagasta', region: 'Americas' },
  { name: 'Alejandro Morales', country: 'Colombia', flag: '🇨🇴', city: 'Bogotá', region: 'Americas' },
  { name: 'Mariana Restrepo', country: 'Colombia', flag: '🇨🇴', city: 'Medellín', region: 'Americas' },
  { name: 'Andres Ospina', country: 'Colombia', flag: '🇨🇴', city: 'Cali', region: 'Americas' },
  { name: 'Daniela Gutierrez', country: 'Colombia', flag: '🇨🇴', city: 'Barranquilla', region: 'Americas' },
  { name: 'Felipe Jaramillo', country: 'Colombia', flag: '🇨🇴', city: 'Cartagena', region: 'Americas' },
  { name: 'Carlos Mendoza', country: 'Peru', flag: '🇵🇪', city: 'Lima', region: 'Americas' },
  { name: 'Valeria Quispe', country: 'Peru', flag: '🇵🇪', city: 'Arequipa', region: 'Americas' },
  { name: 'Renzo Flores', country: 'Peru', flag: '🇵🇪', city: 'Cusco', region: 'Americas' },
  { name: 'Claudia Espinoza', country: 'Peru', flag: '🇵🇪', city: 'Trujillo', region: 'Americas' },
  { name: 'Sebastian Noboa', country: 'Ecuador', flag: '🇪🇨', city: 'Quito', region: 'Americas' },
  { name: 'Andrea Cordero', country: 'Ecuador', flag: '🇪🇨', city: 'Guayaquil', region: 'Americas' },
  { name: 'Esteban Viteri', country: 'Ecuador', flag: '🇪🇨', city: 'Cuenca', region: 'Americas' },
  { name: 'Mathias Larrañaga', country: 'Uruguay', flag: '🇺🇾', city: 'Montevideo', region: 'Americas' },
  { name: 'Lucia Batlle', country: 'Uruguay', flag: '🇺🇾', city: 'Punta del Este', region: 'Americas' },
  { name: 'Guillermo Fariña', country: 'Paraguay', flag: '🇵🇾', city: 'Asunción', region: 'Americas' },
  { name: 'Sol Dominguez', country: 'Paraguay', flag: '🇵🇾', city: 'Ciudad del Este', region: 'Americas' },
  { name: 'Mauricio Siles', country: 'Bolivia', flag: '🇧🇴', city: 'La Paz', region: 'Americas' },
  { name: 'Carla Justiniano', country: 'Bolivia', flag: '🇧🇴', city: 'Santa Cruz', region: 'Americas' },
  { name: 'Rodrigo Alvarado', country: 'Costa Rica', flag: '🇨🇷', city: 'San José', region: 'Americas' },
  { name: 'Mariela Brenes', country: 'Costa Rica', flag: '🇨🇷', city: 'Heredia', region: 'Americas' },
  { name: 'Ricardo Arias', country: 'Panama', flag: '🇵🇦', city: 'Panama City', region: 'Americas' },
  { name: 'Yaritza Lasso', country: 'Panama', flag: '🇵🇦', city: 'Colón', region: 'Americas' },
  { name: 'Jean-Luc Henríquez', country: 'Dominican Republic', flag: '🇩🇴', city: 'Santo Domingo', region: 'Americas' },
  { name: 'Scarlet Peña', country: 'Dominican Republic', flag: '🇩🇴', city: 'Santiago de los Caballeros', region: 'Americas' },
  { name: 'Rafael Altagracia', country: 'Dominican Republic', flag: '🇩🇴', city: 'Punta Cana', region: 'Americas' },
  { name: 'Enrique Castillo', country: 'Guatemala', flag: '🇬🇹', city: 'Guatemala City', region: 'Americas' },

  // --- UNITED KINGDOM & IRELAND (101-140) ---
  { name: 'Oliver Kensington', country: 'United Kingdom', flag: '🇬🇧', city: 'London', region: 'Europe' },
  { name: 'Grace O\'Malley', country: 'United Kingdom', flag: '🇬🇧', city: 'Manchester', region: 'Europe' },
  { name: 'Arthur Pendelton', country: 'United Kingdom', flag: '🇬🇧', city: 'Edinburgh', region: 'Europe' },
  { name: 'Amelia Crawford', country: 'United Kingdom', flag: '🇬🇧', city: 'Birmingham', region: 'Europe' },
  { name: 'George Harrison-Cole', country: 'United Kingdom', flag: '🇬🇧', city: 'Bristol', region: 'Europe' },
  { name: 'Isla MacIntyre', country: 'United Kingdom', flag: '🇬🇧', city: 'Glasgow', region: 'Europe' },
  { name: 'Harry Thornton', country: 'United Kingdom', flag: '🇬🇧', city: 'Leeds', region: 'Europe' },
  { name: 'Freya Sinclair', country: 'United Kingdom', flag: '🇬🇧', city: 'Oxford', region: 'Europe' },
  { name: 'Edward Sterling', country: 'United Kingdom', flag: '🇬🇧', city: 'Cambridge', region: 'Europe' },
  { name: 'Poppy Abercrombie', country: 'United Kingdom', flag: '🇬🇧', city: 'Belfast', region: 'Europe' },
  { name: 'Archie Montgomery', country: 'United Kingdom', flag: '🇬🇧', city: 'Cardiff', region: 'Europe' },
  { name: 'Lily Radcliffe', country: 'United Kingdom', flag: '🇬🇧', city: 'Liverpool', region: 'Europe' },
  { name: 'Henry Cavendish', country: 'United Kingdom', flag: '🇬🇧', city: 'Newcastle', region: 'Europe' },
  { name: 'Rosie Beaumont', country: 'United Kingdom', flag: '🇬🇧', city: 'Brighton', region: 'Europe' },
  { name: 'Sebastian Ward', country: 'United Kingdom', flag: '🇬🇧', city: 'Sheffield', region: 'Europe' },
  { name: 'Charles Somerset', country: 'United Kingdom', flag: '🇬🇧', city: 'Bath', region: 'Europe' },
  { name: 'Eleanor Hasting', country: 'United Kingdom', flag: '🇬🇧', city: 'York', region: 'Europe' },
  { name: 'Rupert Finch', country: 'United Kingdom', flag: '🇬🇧', city: 'Canterbury', region: 'Europe' },
  { name: 'Beatrice Wolsey', country: 'United Kingdom', flag: '🇬🇧', city: 'Norwich', region: 'Europe' },
  { name: 'Gareth Llewelyn', country: 'United Kingdom', flag: '🇬🇧', city: 'Swansea', region: 'Europe' },
  { name: 'Conor O\'Brien', country: 'Ireland', flag: '🇮🇪', city: 'Dublin', region: 'Europe' },
  { name: 'Saoirse Byrne', country: 'Ireland', flag: '🇮🇪', city: 'Cork', region: 'Europe' },
  { name: 'Liam Murphy', country: 'Ireland', flag: '🇮🇪', city: 'Galway', region: 'Europe' },
  { name: 'Aoife Kelly', country: 'Ireland', flag: '🇮🇪', city: 'Limerick', region: 'Europe' },
  { name: 'Cillian Walsh', country: 'Ireland', flag: '🇮🇪', city: 'Waterford', region: 'Europe' },
  { name: 'Niamh Fitzgerald', country: 'Ireland', flag: '🇮🇪', city: 'Drogheda', region: 'Europe' },
  { name: 'Sean MacCarthy', country: 'Ireland', flag: '🇮🇪', city: 'Kilkenny', region: 'Europe' },
  { name: 'Ciara O\'Connor', country: 'Ireland', flag: '🇮🇪', city: 'Sligo', region: 'Europe' },
  { name: 'Darragh Nolan', country: 'Ireland', flag: '🇮🇪', city: 'Killarney', region: 'Europe' },
  { name: 'Roisin Higgins', country: 'Ireland', flag: '🇮🇪', city: 'Athlone', region: 'Europe' },

  // --- WESTERN & CENTRAL EUROPE (141-200) ---
  { name: 'Beat Meier', country: 'Switzerland', flag: '🇨🇭', city: 'Zurich', region: 'Europe' },
  { name: 'Elena Bieri', country: 'Switzerland', flag: '🇨🇭', city: 'Geneva', region: 'Europe' },
  { name: 'Lukas Steiner', country: 'Switzerland', flag: '🇨🇭', city: 'Basel', region: 'Europe' },
  { name: 'Camille Favre', country: 'Switzerland', flag: '🇨🇭', city: 'Lausanne', region: 'Europe' },
  { name: 'Fabian Gerber', country: 'Switzerland', flag: '🇨🇭', city: 'Bern', region: 'Europe' },
  { name: 'Nathalie Weber', country: 'Switzerland', flag: '🇨🇭', city: 'Lucerne', region: 'Europe' },
  { name: 'Maximilian Krause', country: 'Germany', flag: '🇩🇪', city: 'Frankfurt', region: 'Europe' },
  { name: 'Sophie Schneider', country: 'Germany', flag: '🇩🇪', city: 'Munich', region: 'Europe' },
  { name: 'Lukas Fischer', country: 'Germany', flag: '🇩🇪', city: 'Berlin', region: 'Europe' },
  { name: 'Hannah Wagner', country: 'Germany', flag: '🇩🇪', city: 'Hamburg', region: 'Europe' },
  { name: 'Julian Becker', country: 'Germany', flag: '🇩🇪', city: 'Stuttgart', region: 'Europe' },
  { name: 'Lea Hoffmann', country: 'Germany', flag: '🇩🇪', city: 'Cologne', region: 'Europe' },
  { name: 'Felix Neumann', country: 'Germany', flag: '🇩🇪', city: 'Düsseldorf', region: 'Europe' },
  { name: 'Klara Zimmermann', country: 'Germany', flag: '🇩🇪', city: 'Dresden', region: 'Europe' },
  { name: 'Niklas Bauer', country: 'Germany', flag: '🇩🇪', city: 'Leipzig', region: 'Europe' },
  { name: 'Greta Hartmann', country: 'Germany', flag: '🇩🇪', city: 'Nuremberg', region: 'Europe' },
  { name: 'Alexandre Laurent', country: 'France', flag: '🇫🇷', city: 'Paris', region: 'Europe' },
  { name: 'Camille Moreau', country: 'France', flag: '🇫🇷', city: 'Lyon', region: 'Europe' },
  { name: 'Antoine Dubois', country: 'France', flag: '🇫🇷', city: 'Marseille', region: 'Europe' },
  { name: 'Juliette Bernard', country: 'France', flag: '🇫🇷', city: 'Bordeaux', region: 'Europe' },
  { name: 'Hugo Fournier', country: 'France', flag: '🇫🇷', city: 'Toulouse', region: 'Europe' },
  { name: 'Manon Girard', country: 'France', flag: '🇫🇷', city: 'Nice', region: 'Europe' },
  { name: 'Louis Bonnet', country: 'France', flag: '🇫🇷', city: 'Strasbourg', region: 'Europe' },
  { name: 'Chloe Mercier', country: 'France', flag: '🇫🇷', city: 'Nantes', region: 'Europe' },
  { name: 'Daan van Dijk', country: 'Netherlands', flag: '🇳🇱', city: 'Amsterdam', region: 'Europe' },
  { name: 'Sanne de Jong', country: 'Netherlands', flag: '🇳🇱', city: 'Rotterdam', region: 'Europe' },
  { name: 'Lars Bakker', country: 'Netherlands', flag: '🇳🇱', city: 'Utrecht', region: 'Europe' },
  { name: 'Fleur Visser', country: 'Netherlands', flag: '🇳🇱', city: 'The Hague', region: 'Europe' },
  { name: 'Sem Janssen', country: 'Netherlands', flag: '🇳🇱', city: 'Eindhoven', region: 'Europe' },
  { name: 'Maud Smit', country: 'Netherlands', flag: '🇳🇱', city: 'Groningen', region: 'Europe' },
  { name: 'Florian Pichler', country: 'Austria', flag: '🇦🇹', city: 'Vienna', region: 'Europe' },
  { name: 'Katharina Gruber', country: 'Austria', flag: '🇦🇹', city: 'Salzburg', region: 'Europe' },
  { name: 'Stefan Hofer', country: 'Austria', flag: '🇦🇹', city: 'Innsbruck', region: 'Europe' },
  { name: 'Julia Moser', country: 'Austria', flag: '🇦🇹', city: 'Graz', region: 'Europe' },
  { name: 'Louis Van Den Bossche', country: 'Belgium', flag: '🇧🇪', city: 'Brussels', region: 'Europe' },
  { name: 'Elise Peeters', country: 'Belgium', flag: '🇧🇪', city: 'Antwerp', region: 'Europe' },
  { name: 'Arthur Wouters', country: 'Belgium', flag: '🇧🇪', city: 'Ghent', region: 'Europe' },
  { name: 'Clara Jacobs', country: 'Belgium', flag: '🇧🇪', city: 'Bruges', region: 'Europe' },
  { name: 'Jean-Luc Schmit', country: 'Luxembourg', flag: '🇱🇺', city: 'Luxembourg City', region: 'Europe' },
  { name: 'Lynn Schuler', country: 'Luxembourg', flag: '🇱🇺', city: 'Esch-sur-Alzette', region: 'Europe' },
  { name: 'Franziska Kieber', country: 'Liechtenstein', flag: '🇱🇮', city: 'Vaduz', region: 'Europe' },
  { name: 'Christoph Büchel', country: 'Liechtenstein', flag: '🇱🇮', city: 'Schaan', region: 'Europe' },
  { name: 'Matteo Rossi', country: 'Italy', flag: '🇮🇹', city: 'Milan', region: 'Europe' },
  { name: 'Giulia Ferrari', country: 'Italy', flag: '🇮🇹', city: 'Rome', region: 'Europe' },
  { name: 'Leonardo Bianchi', country: 'Italy', flag: '🇮🇹', city: 'Turin', region: 'Europe' },
  { name: 'Chiara Romano', country: 'Italy', flag: '🇮🇹', city: 'Bologna', region: 'Europe' },
  { name: 'Alessandro Colombo', country: 'Italy', flag: '🇮🇹', city: 'Florence', region: 'Europe' },
  { name: 'Sofia Ricci', country: 'Italy', flag: '🇮🇹', city: 'Naples', region: 'Europe' },
  { name: 'Federico Marino', country: 'Italy', flag: '🇮🇹', city: 'Venice', region: 'Europe' },
  { name: 'Martina Greco', country: 'Italy', flag: '🇮🇹', city: 'Verona', region: 'Europe' },
  { name: 'Alejandro Ramos', country: 'Spain', flag: '🇪🇸', city: 'Madrid', region: 'Europe' },
  { name: 'Lucia Navarro', country: 'Spain', flag: '🇪🇸', city: 'Barcelona', region: 'Europe' },
  { name: 'Pablo Iglesias', country: 'Spain', flag: '🇪🇸', city: 'Valencia', region: 'Europe' },
  { name: 'Carmen Gil', country: 'Spain', flag: '🇪🇸', city: 'Seville', region: 'Europe' },
  { name: 'Javier Serrano', country: 'Spain', flag: '🇪🇸', city: 'Bilbao', region: 'Europe' },
  { name: 'Elena Ortega', country: 'Spain', flag: '🇪🇸', city: 'Málaga', region: 'Europe' },
  { name: 'Tiago Fernandes', country: 'Portugal', flag: '🇵🇹', city: 'Lisbon', region: 'Europe' },
  { name: 'Ines Martins', country: 'Portugal', flag: '🇵🇹', city: 'Porto', region: 'Europe' },
  { name: 'Gonçalo Ribeiro', country: 'Portugal', flag: '🇵🇹', city: 'Braga', region: 'Europe' },
  { name: 'Beatriz Santos', country: 'Portugal', flag: '🇵🇹', city: 'Coimbra', region: 'Europe' },

  // --- NORDIC & SCANDINAVIA (201-240) ---
  { name: 'Erik Lindqvist', country: 'Sweden', flag: '🇸🇪', city: 'Stockholm', region: 'Europe' },
  { name: 'Astrid Bergman', country: 'Sweden', flag: '🇸🇪', city: 'Gothenburg', region: 'Europe' },
  { name: 'Henrik Wallin', country: 'Sweden', flag: '🇸🇪', city: 'Malmö', region: 'Europe' },
  { name: 'Freja Holm', country: 'Sweden', flag: '🇸🇪', city: 'Uppsala', region: 'Europe' },
  { name: 'Oskar Nilsson', country: 'Sweden', flag: '🇸🇪', city: 'Västerås', region: 'Europe' },
  { name: 'Elin Hedlund', country: 'Sweden', flag: '🇸🇪', city: 'Örebro', region: 'Europe' },
  { name: 'Magnus Hansen', country: 'Norway', flag: '🇳🇴', city: 'Oslo', region: 'Europe' },
  { name: 'Ingrid Johansen', country: 'Norway', flag: '🇳🇴', city: 'Bergen', region: 'Europe' },
  { name: 'Lars Hagen', country: 'Norway', flag: '🇳🇴', city: 'Trondheim', region: 'Europe' },
  { name: 'Nora Solberg', country: 'Norway', flag: '🇳🇴', city: 'Stavanger', region: 'Europe' },
  { name: 'Andreas Moen', country: 'Norway', flag: '🇳🇴', city: 'Kristiansand', region: 'Europe' },
  { name: 'Kari Haugen', country: 'Norway', flag: '🇳🇴', city: 'Tromsø', region: 'Europe' },
  { name: 'Frederik Møller', country: 'Denmark', flag: '🇩🇰', city: 'Copenhagen', region: 'Europe' },
  { name: 'Emma Nielsen', country: 'Denmark', flag: '🇩🇰', city: 'Aarhus', region: 'Europe' },
  { name: 'Rasmus Jensen', country: 'Denmark', flag: '🇩🇰', city: 'Odense', region: 'Europe' },
  { name: 'Mathilde Lund', country: 'Denmark', flag: '🇩🇰', city: 'Aalborg', region: 'Europe' },
  { name: 'Morten Poulsen', country: 'Denmark', flag: '🇩🇰', city: 'Esbjerg', region: 'Europe' },
  { name: 'Juho Korhonen', country: 'Finland', flag: '🇫🇮', city: 'Helsinki', region: 'Europe' },
  { name: 'Aino Virtanen', country: 'Finland', flag: '🇫🇮', city: 'Espoo', region: 'Europe' },
  { name: 'Matias Nieminen', country: 'Finland', flag: '🇫🇮', city: 'Tampere', region: 'Europe' },
  { name: 'Venla Laine', country: 'Finland', flag: '🇫🇮', city: 'Turku', region: 'Europe' },
  { name: 'Aleksi Heikkinen', country: 'Finland', flag: '🇫🇮', city: 'Oulu', region: 'Europe' },
  { name: 'Kerttu Koskinen', country: 'Finland', flag: '🇫🇮', city: 'Jyväskylä', region: 'Europe' },
  { name: 'Gunnar Jonsson', country: 'Iceland', flag: '🇮🇸', city: 'Reykjavik', region: 'Europe' },
  { name: 'Hekla Sigurdardottir', country: 'Iceland', flag: '🇮🇸', city: 'Kópavogur', region: 'Europe' },
  { name: 'Arnar Einarsson', country: 'Iceland', flag: '🇮🇸', city: 'Hafnarfjörður', region: 'Europe' },

  // --- EASTERN & SOUTHERN EUROPE (241-290) ---
  { name: 'Jan Kowalski', country: 'Poland', flag: '🇵🇱', city: 'Warsaw', region: 'Europe' },
  { name: 'Zofia Wisniewska', country: 'Poland', flag: '🇵🇱', city: 'Kraków', region: 'Europe' },
  { name: 'Mateusz Dabrowski', country: 'Poland', flag: '🇵🇱', city: 'Wrocław', region: 'Europe' },
  { name: 'Maja Lewandowska', country: 'Poland', flag: '🇵🇱', city: 'Gdańsk', region: 'Europe' },
  { name: 'Piotr Wójcik', country: 'Poland', flag: '🇵🇱', city: 'Poznań', region: 'Europe' },
  { name: 'Jakub Novak', country: 'Czech Republic', flag: '🇨🇿', city: 'Prague', region: 'Europe' },
  { name: 'Tereza Svobodova', country: 'Czech Republic', flag: '🇨🇿', city: 'Brno', region: 'Europe' },
  { name: 'Tomas Dvorak', country: 'Czech Republic', flag: '🇨🇿', city: 'Ostrava', region: 'Europe' },
  { name: 'Eliska Cerna', country: 'Czech Republic', flag: '🇨🇿', city: 'Plzeň', region: 'Europe' },
  { name: 'Martin Nagy', country: 'Slovakia', flag: '🇸🇰', city: 'Bratislava', region: 'Europe' },
  { name: 'Zuzana Kovacova', country: 'Slovakia', flag: '🇸🇰', city: 'Košice', region: 'Europe' },
  { name: 'Balazs Horvath', country: 'Hungary', flag: '🇭🇺', city: 'Budapest', region: 'Europe' },
  { name: 'Eszter Toth', country: 'Hungary', flag: '🇭🇺', city: 'Debrecen', region: 'Europe' },
  { name: 'Gabor Varga', country: 'Hungary', flag: '🇭🇺', city: 'Szeged', region: 'Europe' },
  { name: 'Andrei Popescu', country: 'Romania', flag: '🇷🇴', city: 'Bucharest', region: 'Europe' },
  { name: 'Elena Radu', country: 'Romania', flag: '🇷🇴', city: 'Cluj-Napoca', region: 'Europe' },
  { name: 'Mihai Dumitrescu', country: 'Romania', flag: '🇷🇴', city: 'Timișoara', region: 'Europe' },
  { name: 'Ioana Stan', country: 'Romania', flag: '🇷🇴', city: 'Iași', region: 'Europe' },
  { name: 'Dimitar Georgiev', country: 'Bulgaria', flag: '🇧🇬', city: 'Sofia', region: 'Europe' },
  { name: 'Elena Dimitrova', country: 'Bulgaria', flag: '🇧🇬', city: 'Plovdiv', region: 'Europe' },
  { name: 'Luka Horvat', country: 'Croatia', flag: '🇭🇷', city: 'Zagreb', region: 'Europe' },
  { name: 'Mia Kovacevic', country: 'Croatia', flag: '🇭🇷', city: 'Split', region: 'Europe' },
  { name: 'Nikola Babic', country: 'Croatia', flag: '🇭🇷', city: 'Rijeka', region: 'Europe' },
  { name: 'Nikolaos Papadopoulos', country: 'Greece', flag: '🇬🇷', city: 'Athens', region: 'Europe' },
  { name: 'Eleni Georgiou', country: 'Greece', flag: '🇬🇷', city: 'Thessaloniki', region: 'Europe' },
  { name: 'Dimitrios Vassiliou', country: 'Greece', flag: '🇬🇷', city: 'Patras', region: 'Europe' },
  { name: 'Kyriakos Demetriou', country: 'Cyprus', flag: '🇨🇾', city: 'Nicosia', region: 'Europe' },
  { name: 'Stavroula Ioannou', country: 'Cyprus', flag: '🇨🇾', city: 'Limassol', region: 'Europe' },
  { name: 'Mark Galea', country: 'Malta', flag: '🇲🇹', city: 'Valletta', region: 'Europe' },
  { name: 'Maria Borg', country: 'Malta', flag: '🇲🇹', city: 'Sliema', region: 'Europe' },
  { name: 'Artem Shevchenko', country: 'Ukraine', flag: '🇺🇦', city: 'Kyiv', region: 'Europe' },
  { name: 'Olena Bondarenko', country: 'Ukraine', flag: '🇺🇦', city: 'Lviv', region: 'Europe' },
  { name: 'Taras Kovalenko', country: 'Ukraine', flag: '🇺🇦', city: 'Odesa', region: 'Europe' },
  { name: 'Ihor Moroz', country: 'Ukraine', flag: '🇺🇦', city: 'Dnipro', region: 'Europe' },
  { name: 'Kaspar Tamm', country: 'Estonia', flag: '🇪🇪', city: 'Tallinn', region: 'Europe' },
  { name: 'Laura Saar', country: 'Estonia', flag: '🇪🇪', city: 'Tartu', region: 'Europe' },
  { name: 'Janis Berzins', country: 'Latvia', flag: '🇱🇻', city: 'Riga', region: 'Europe' },
  { name: 'Liga Kalnina', country: 'Latvia', flag: '🇱🇻', city: 'Jurmala', region: 'Europe' },
  { name: 'Mantas Kazlauskas', country: 'Lithuania', flag: '🇱🇹', city: 'Vilnius', region: 'Europe' },
  { name: 'Gabriele Petrauskaite', country: 'Lithuania', flag: '🇱🇹', city: 'Kaunas', region: 'Europe' },

  // --- EAST ASIA (291-350) ---
  { name: 'Hiroto Kobayashi', country: 'Japan', flag: '🇯🇵', city: 'Tokyo', region: 'Asia' },
  { name: 'Yuki Takahashi', country: 'Japan', flag: '🇯🇵', city: 'Osaka', region: 'Asia' },
  { name: 'Kenji Sato', country: 'Japan', flag: '🇯🇵', city: 'Kyoto', region: 'Asia' },
  { name: 'Akira Watanabe', country: 'Japan', flag: '🇯🇵', city: 'Yokohama', region: 'Asia' },
  { name: 'Sakura Tanaka', country: 'Japan', flag: '🇯🇵', city: 'Nagoya', region: 'Asia' },
  { name: 'Daiki Ito', country: 'Japan', flag: '🇯🇵', city: 'Fukuoka', region: 'Asia' },
  { name: 'Ren Nakamura', country: 'Japan', flag: '🇯🇵', city: 'Sapporo', region: 'Asia' },
  { name: 'Hina Yamamoto', country: 'Japan', flag: '🇯🇵', city: 'Kobe', region: 'Asia' },
  { name: 'Kazuki Yoshida', country: 'Japan', flag: '🇯🇵', city: 'Sendai', region: 'Asia' },
  { name: 'Min-Jun Park', country: 'South Korea', flag: '🇰🇷', city: 'Seoul', region: 'Asia' },
  { name: 'Seo-Yeon Kim', country: 'South Korea', flag: '🇰🇷', city: 'Busan', region: 'Asia' },
  { name: 'Ji-Hoon Lee', country: 'South Korea', flag: '🇰🇷', city: 'Incheon', region: 'Asia' },
  { name: 'Ha-Eun Choi', country: 'South Korea', flag: '🇰🇷', city: 'Daegu', region: 'Asia' },
  { name: 'Do-Yun Jung', country: 'South Korea', flag: '🇰🇷', city: 'Daejeon', region: 'Asia' },
  { name: 'Ye-Jun Kang', country: 'South Korea', flag: '🇰🇷', city: 'Gwangju', region: 'Asia' },
  { name: 'Yu-Na Cho', country: 'South Korea', flag: '🇰🇷', city: 'Suwon', region: 'Asia' },
  { name: 'Hyun-Woo Yoon', country: 'South Korea', flag: '🇰🇷', city: 'Ulsan', region: 'Asia' },
  { name: 'Wei Chen', country: 'Taiwan', flag: '🇹🇼', city: 'Taipei', region: 'Asia' },
  { name: 'Ying-Hsuan Lin', country: 'Taiwan', flag: '🇹🇼', city: 'Kaohsiung', region: 'Asia' },
  { name: 'Po-Chun Huang', country: 'Taiwan', flag: '🇹🇼', city: 'Taichung', region: 'Asia' },
  { name: 'Tzu-Ching Chang', country: 'Taiwan', flag: '🇹🇼', city: 'Tainan', region: 'Asia' },
  { name: 'Kwan-Yiu Ho', country: 'Hong Kong', flag: '🇭🇰', city: 'Central', region: 'Asia' },
  { name: 'Wing-Shan Chan', country: 'Hong Kong', flag: '🇭🇰', city: 'Kowloon', region: 'Asia' },
  { name: 'Cheuk-Nam Wong', country: 'Hong Kong', flag: '🇭🇰', city: 'Tsim Sha Tsui', region: 'Asia' },
  { name: 'Hiu-Tung Cheung', country: 'Hong Kong', flag: '🇭🇰', city: 'Wan Chai', region: 'Asia' },
  { name: 'Wei Jie Tan', country: 'Singapore', flag: '🇸🇬', city: 'Marina Bay', region: 'Asia' },
  { name: 'Xin Yi Lim', country: 'Singapore', flag: '🇸🇬', city: 'Raffles Place', region: 'Asia' },
  { name: 'Jun Jie Lee', country: 'Singapore', flag: '🇸🇬', city: 'Orchard', region: 'Asia' },
  { name: 'Pei Shan Ong', country: 'Singapore', flag: '🇸🇬', city: 'Sentosa Cove', region: 'Asia' },
  { name: 'Guan Yu Koh', country: 'Singapore', flag: '🇸🇬', city: 'Jurong East', region: 'Asia' },
  { name: 'Hui Min Teo', country: 'Singapore', flag: '🇸🇬', city: 'Tampines', region: 'Asia' },

  // --- SOUTHEAST & SOUTH ASIA (351-410) ---
  { name: 'Aarav Sharma', country: 'India', flag: '🇮🇳', city: 'Mumbai', region: 'Asia' },
  { name: 'Ananya Patel', country: 'India', flag: '🇮🇳', city: 'Bengaluru', region: 'Asia' },
  { name: 'Rohan Gupta', country: 'India', flag: '🇮🇳', city: 'Delhi', region: 'Asia' },
  { name: 'Diya Mukherjee', country: 'India', flag: '🇮🇳', city: 'Kolkata', region: 'Asia' },
  { name: 'Aditya Reddy', country: 'India', flag: '🇮🇳', city: 'Hyderabad', region: 'Asia' },
  { name: 'Ishaan Iyer', country: 'India', flag: '🇮🇳', city: 'Chennai', region: 'Asia' },
  { name: 'Saanvi Nair', country: 'India', flag: '🇮🇳', city: 'Kochi', region: 'Asia' },
  { name: 'Kabir Malhotra', country: 'India', flag: '🇮🇳', city: 'Pune', region: 'Asia' },
  { name: 'Bhavna Kulkarni', country: 'India', flag: '🇮🇳', city: 'Ahmedabad', region: 'Asia' },
  { name: 'Devendra Singhania', country: 'India', flag: '🇮🇳', city: 'Jaipur', region: 'Asia' },
  { name: 'Budi Santoso', country: 'Indonesia', flag: '🇮🇩', city: 'Jakarta', region: 'Asia' },
  { name: 'Siti Rahmawati', country: 'Indonesia', flag: '🇮🇩', city: 'Surabaya', region: 'Asia' },
  { name: 'Reza Pratama', country: 'Indonesia', flag: '🇮🇩', city: 'Bandung', region: 'Asia' },
  { name: 'Dewi Lestari', country: 'Indonesia', flag: '🇮🇩', city: 'Bali', region: 'Asia' },
  { name: 'Agus Wijaya', country: 'Indonesia', flag: '🇮🇩', city: 'Medan', region: 'Asia' },
  { name: 'Nguyen Van Minh', country: 'Vietnam', flag: '🇻🇳', city: 'Ho Chi Minh City', region: 'Asia' },
  { name: 'Tran Thi Mai', country: 'Vietnam', flag: '🇻🇳', city: 'Hanoi', region: 'Asia' },
  { name: 'Le Hoang Nam', country: 'Vietnam', flag: '🇻🇳', city: 'Da Nang', region: 'Asia' },
  { name: 'Pham Thu Huong', country: 'Vietnam', flag: '🇻🇳', city: 'Hai Phong', region: 'Asia' },
  { name: 'Somchai Prasert', country: 'Thailand', flag: '🇹🇭', city: 'Bangkok', region: 'Asia' },
  { name: 'Pornthip Saelim', country: 'Thailand', flag: '🇹🇭', city: 'Chiang Mai', region: 'Asia' },
  { name: 'Kittisak Charoen', country: 'Thailand', flag: '🇹🇭', city: 'Phuket', region: 'Asia' },
  { name: 'Nattaporn Srichan', country: 'Thailand', flag: '🇹🇭', city: 'Pattaya', region: 'Asia' },
  { name: 'Joshua Dizon', country: 'Philippines', flag: '🇵🇭', city: 'Manila', region: 'Asia' },
  { name: 'Maria Santos', country: 'Philippines', flag: '🇵🇭', city: 'Cebu City', region: 'Asia' },
  { name: 'Christian Reyes', country: 'Philippines', flag: '🇵🇭', city: 'Davao City', region: 'Asia' },
  { name: 'Bea Patricia Tan', country: 'Philippines', flag: '🇵🇭', city: 'Makati', region: 'Asia' },
  { name: 'Muhammad Danish', country: 'Malaysia', flag: '🇲🇾', city: 'Kuala Lumpur', region: 'Asia' },
  { name: 'Nurul Ain', country: 'Malaysia', flag: '🇲🇾', city: 'Penang', region: 'Asia' },
  { name: 'Lim Wei Kang', country: 'Malaysia', flag: '🇲🇾', city: 'Johor Bahru', region: 'Asia' },
  { name: 'Tariq Butt', country: 'Pakistan', flag: '🇵🇰', city: 'Karachi', region: 'Asia' },
  { name: 'Ayesha Siddiqui', country: 'Pakistan', flag: '🇵🇰', city: 'Lahore', region: 'Asia' },
  { name: 'Hamza Khan', country: 'Pakistan', flag: '🇵🇰', city: 'Islamabad', region: 'Asia' },
  { name: 'Chaminda Perera', country: 'Sri Lanka', flag: '🇱🇰', city: 'Colombo', region: 'Asia' },
  { name: 'Dilani Fernando', country: 'Sri Lanka', flag: '🇱🇰', city: 'Kandy', region: 'Asia' },
  { name: 'Arman Zhumabayev', country: 'Kazakhstan', flag: '🇰🇿', city: 'Almaty', region: 'Asia' },
  { name: 'Aizhan Nurmagambetova', country: 'Kazakhstan', flag: '🇰🇿', city: 'Astana', region: 'Asia' },
  { name: 'Rustam Karimov', country: 'Uzbekistan', flag: '🇺🇿', city: 'Tashkent', region: 'Asia' },
  { name: 'Nilufar Usmonova', country: 'Uzbekistan', flag: '🇺🇿', city: 'Samarkand', region: 'Asia' },

  // --- MIDDLE EAST (411-455) ---
  { name: 'Tariq Al-Mansoor', country: 'United Arab Emirates', flag: '🇦🇪', city: 'Dubai DIFC', region: 'Middle East' },
  { name: 'Fatima Al-Hashemi', country: 'United Arab Emirates', flag: '🇦🇪', city: 'Abu Dhabi', region: 'Middle East' },
  { name: 'Rashid Al-Maktoum', country: 'United Arab Emirates', flag: '🇦🇪', city: 'Dubai Downtown', region: 'Middle East' },
  { name: 'Mariam Al-Suwaidi', country: 'United Arab Emirates', flag: '🇦🇪', city: 'Sharjah', region: 'Middle East' },
  { name: 'Zayed Al-Nahyan', country: 'United Arab Emirates', flag: '🇦🇪', city: 'Al Ain', region: 'Middle East' },
  { name: 'Faisal Al-Otaibi', country: 'Saudi Arabia', flag: '🇸🇦', city: 'Riyadh', region: 'Middle East' },
  { name: 'Noura Al-Ghamdi', country: 'Saudi Arabia', flag: '🇸🇦', city: 'Jeddah', region: 'Middle East' },
  { name: 'Khalid Al-Dossary', country: 'Saudi Arabia', flag: '🇸🇦', city: 'Dammam', region: 'Middle East' },
  { name: 'Reem Al-Qahtani', country: 'Saudi Arabia', flag: '🇸🇦', city: 'Khobar', region: 'Middle East' },
  { name: 'Bandar Al-Husseini', country: 'Saudi Arabia', flag: '🇸🇦', city: 'Medina', region: 'Middle East' },
  { name: 'Hamad Al-Thani', country: 'Qatar', flag: '🇶🇦', city: 'Doha', region: 'Middle East' },
  { name: 'Sheikha Al-Kuwari', country: 'Qatar', flag: '🇶🇦', city: 'Lusail', region: 'Middle East' },
  { name: 'Nasser Al-Marri', country: 'Qatar', flag: '🇶🇦', city: 'Al Wakrah', region: 'Middle East' },
  { name: 'Yousef Al-Sabah', country: 'Kuwait', flag: '🇰🇼', city: 'Kuwait City', region: 'Middle East' },
  { name: 'Dalal Al-Mutawa', country: 'Kuwait', flag: '🇰🇼', city: 'Salmiya', region: 'Middle East' },
  { name: 'Bader Al-Kandari', country: 'Kuwait', flag: '🇰🇼', city: 'Hawally', region: 'Middle East' },
  { name: 'Sultan Al-Busaidi', country: 'Oman', flag: '🇴🇲', city: 'Muscat', region: 'Middle East' },
  { name: 'Azza Al-Riyami', country: 'Oman', flag: '🇴🇲', city: 'Salalah', region: 'Middle East' },
  { name: 'Ali Al-Khalifa', country: 'Bahrain', flag: '🇧🇭', city: 'Manama', region: 'Middle East' },
  { name: 'Zainab Al-Mahroos', country: 'Bahrain', flag: '🇧🇭', city: 'Riffa', region: 'Middle East' },
  { name: 'Zaid Majali', country: 'Jordan', flag: '🇯🇴', city: 'Amman', region: 'Middle East' },
  { name: 'Rania Haddad', country: 'Jordan', flag: '🇯🇴', city: 'Aqaba', region: 'Middle East' },
  { name: 'Karim Chammas', country: 'Lebanon', flag: '🇱🇧', city: 'Beirut', region: 'Middle East' },
  { name: 'Nour Khoury', country: 'Lebanon', flag: '🇱🇧', city: 'Jounieh', region: 'Middle East' },

  // --- AFRICA (456-505) ---
  { name: 'Chukwudi Okafor', country: 'Nigeria', flag: '🇳🇬', city: 'Lagos', region: 'Africa' },
  { name: 'Amara Adebayo', country: 'Nigeria', flag: '🇳🇬', city: 'Abuja', region: 'Africa' },
  { name: 'Babajide Balogun', country: 'Nigeria', flag: '🇳🇬', city: 'Victoria Island', region: 'Africa' },
  { name: 'Ngozi Ezekwesili', country: 'Nigeria', flag: '🇳🇬', city: 'Port Harcourt', region: 'Africa' },
  { name: 'Emeka Danjuma', country: 'Nigeria', flag: '🇳🇬', city: 'Enugu', region: 'Africa' },
  { name: 'Folake Alakija', country: 'Nigeria', flag: '🇳🇬', city: 'Ibadan', region: 'Africa' },
  { name: 'Sipho Ndlovu', country: 'South Africa', flag: '🇿🇦', city: 'Johannesburg', region: 'Africa' },
  { name: 'Zanele Khumalo', country: 'South Africa', flag: '🇿🇦', city: 'Cape Town', region: 'Africa' },
  { name: 'Pieter van der Merwe', country: 'South Africa', flag: '🇿🇦', city: 'Pretoria', region: 'Africa' },
  { name: 'Nandi Mthembu', country: 'South Africa', flag: '🇿🇦', city: 'Durban', region: 'Africa' },
  { name: 'Johan Botha', country: 'South Africa', flag: '🇿🇦', city: 'Stellenbosch', region: 'Africa' },
  { name: 'Kwame Mensah', country: 'Ghana', flag: '🇬🇭', city: 'Accra', region: 'Africa' },
  { name: 'Abena Osei', country: 'Ghana', flag: '🇬🇭', city: 'Kumasi', region: 'Africa' },
  { name: 'Kofi Boateng', country: 'Ghana', flag: '🇬🇭', city: 'Takoradi', region: 'Africa' },
  { name: 'Jomo Kenyatta-Mwangi', country: 'Kenya', flag: '🇰🇪', city: 'Nairobi', region: 'Africa' },
  { name: 'Faith Wanjiku', country: 'Kenya', flag: '🇰🇪', city: 'Mombasa', region: 'Africa' },
  { name: 'Brian Kiprop', country: 'Kenya', flag: '🇰🇪', city: 'Kisumu', region: 'Africa' },
  { name: 'Tarek Ben Salem', country: 'Tunisia', flag: '🇹🇳', city: 'Tunis', region: 'Africa' },
  { name: 'Karim Bouazizi', country: 'Tunisia', flag: '🇹🇳', city: 'Sousse', region: 'Africa' },
  { name: 'Rachid Belkacem', country: 'Algeria', flag: '🇩🇿', city: 'Algiers', region: 'Africa' },
  { name: 'Nadia Bouteflika', country: 'Algeria', flag: '🇩🇿', city: 'Oran', region: 'Africa' },
  { name: 'Omar El-Fassi', country: 'Morocco', flag: '🇲🇦', city: 'Casablanca', region: 'Africa' },
  { name: 'Laila Benkirane', country: 'Morocco', flag: '🇲🇦', city: 'Rabat', region: 'Africa' },
  { name: 'Mehdi Amrani', country: 'Morocco', flag: '🇲🇦', city: 'Marrakech', region: 'Africa' },
  { name: 'Ahmed Mansour', country: 'Egypt', flag: '🇪🇬', city: 'Cairo', region: 'Africa' },
  { name: 'Farida El-Sayed', country: 'Egypt', flag: '🇪🇬', city: 'Alexandria', region: 'Africa' },
  { name: 'Youssef El-Gohary', country: 'Egypt', flag: '🇪🇬', city: 'Giza', region: 'Africa' },
  { name: 'Tewodros Haile', country: 'Ethiopia', flag: '🇪🇹', city: 'Addis Ababa', region: 'Africa' },
  { name: 'Bethlehem Tilahun', country: 'Ethiopia', flag: '🇪🇹', city: 'Dire Dawa', region: 'Africa' },
  { name: 'Mamadou Diop', country: 'Senegal', flag: '🇸🇳', city: 'Dakar', region: 'Africa' },
  { name: 'Aminata Ndiaye', country: 'Senegal', flag: '🇸🇳', city: 'Saint-Louis', region: 'Africa' },
  { name: 'Kouassi Konan', country: 'Ivory Coast', flag: '🇨🇮', city: 'Abidjan', region: 'Africa' },
  { name: 'Aïcha Traoré', country: 'Ivory Coast', flag: '🇨🇮', city: 'Yamoussoukro', region: 'Africa' },
  { name: 'Jean-Claude Ndayizeye', country: 'Mauritius', flag: '🇲🇺', city: 'Port Louis', region: 'Africa' },
  { name: 'Devanand Ramgoolam', country: 'Mauritius', flag: '🇲🇺', city: 'Ebène Cybercity', region: 'Africa' },

  // --- OCEANIA (506-530) ---
  { name: 'Lachlan Murdoch-Smith', country: 'Australia', flag: '🇦🇺', city: 'Sydney', region: 'Oceania' },
  { name: 'Matilda Hemsworth', country: 'Australia', flag: '🇦🇺', city: 'Melbourne', region: 'Oceania' },
  { name: 'Oliver Thornton', country: 'Australia', flag: '🇦🇺', city: 'Brisbane', region: 'Oceania' },
  { name: 'Charlotte Irwin', country: 'Australia', flag: '🇦🇺', city: 'Perth', region: 'Oceania' },
  { name: 'Callum O\'Shea', country: 'Australia', flag: '🇦🇺', city: 'Adelaide', region: 'Oceania' },
  { name: 'Gemma Sutherland', country: 'Australia', flag: '🇦🇺', city: 'Gold Coast', region: 'Oceania' },
  { name: 'Harrison Darcy', country: 'Australia', flag: '🇦🇺', city: 'Canberra', region: 'Oceania' },
  { name: 'Liam MacIntyre', country: 'New Zealand', flag: '🇳🇿', city: 'Auckland', region: 'Oceania' },
  { name: 'Zara Rutherford', country: 'New Zealand', flag: '🇳🇿', city: 'Wellington', region: 'Oceania' },
  { name: 'Flynn Stewart', country: 'New Zealand', flag: '🇳🇿', city: 'Christchurch', region: 'Oceania' },
  { name: 'Harper Campbell', country: 'New Zealand', flag: '🇳🇿', city: 'Queenstown', region: 'Oceania' },
  { name: 'Jone Baleiwai', country: 'Fiji', flag: '🇫🇯', city: 'Suva', region: 'Oceania' },
  { name: 'Mereoni Tabua', country: 'Fiji', flag: '🇫🇯', city: 'Nadi', region: 'Oceania' },

  // --- INSTITUTIONAL FAMILY OFFICES, HEDGE FUNDS & QUANT DESKS (531-550) ---
  { name: 'Meridian Capital Partners', country: 'United States', flag: '🇺🇸', city: 'New York', region: 'Americas' },
  { name: 'Apex Global Arbitrage LLC', country: 'United States', flag: '🇺🇸', city: 'Chicago', region: 'Americas' },
  { name: 'Kensington Trust Group', country: 'United Kingdom', flag: '🇬🇧', city: 'London Mayfair', region: 'Europe' },
  { name: 'Rothschild-Vance Asset Management', country: 'Switzerland', flag: '🇨🇭', city: 'Geneva', region: 'Europe' },
  { name: 'Helvetic Alpha Fund', country: 'Switzerland', flag: '🇨🇭', city: 'Zurich Paradeplatz', region: 'Europe' },
  { name: 'Lombard Odier Syndicate', country: 'Liechtenstein', flag: '🇱🇮', city: 'Vaduz', region: 'Europe' },
  { name: 'Temasek Horizon Holdings', country: 'Singapore', flag: '🇸🇬', city: 'Marina Bay Sands', region: 'Asia' },
  { name: 'GIC Quantum Yields', country: 'Singapore', flag: '🇸🇬', city: 'Raffles Place', region: 'Asia' },
  { name: 'Mubadala Liquidity Node', country: 'United Arab Emirates', flag: '🇦🇪', city: 'Abu Dhabi ADGM', region: 'Middle East' },
  { name: 'Dubai Future Capital Syndicate', country: 'United Arab Emirates', flag: '🇦🇪', city: 'DIFC Tower 1', region: 'Middle East' },
  { name: 'Al-Rajhi Wealth Custody', country: 'Saudi Arabia', flag: '🇸🇦', city: 'Riyadh KAFD', region: 'Middle East' },
  { name: 'Nomura Digital Assets Group', country: 'Japan', flag: '🇯🇵', city: 'Tokyo Nihonbashi', region: 'Asia' },
  { name: 'Mirae Horizon Fund', country: 'South Korea', flag: '🇰🇷', city: 'Seoul Gangnam', region: 'Asia' },
  { name: 'Macquarie Prime Liquid Trust', country: 'Australia', flag: '🇦🇺', city: 'Sydney Barangaroo', region: 'Oceania' },
  { name: 'Nordic Sovereign Alpha Node', country: 'Norway', flag: '🇳🇴', city: 'Oslo Sentrum', region: 'Europe' },
  { name: 'Luxembourg Multi-Strategy SICAV', country: 'Luxembourg', flag: '🇱🇺', city: 'Kirchberg Plateau', region: 'Europe' },
  { name: 'Amsterdam Quant Trading Desk', country: 'Netherlands', flag: '🇳🇱', city: 'Zuidas Financial', region: 'Europe' },
  { name: 'Hong Kong Cyberport Digital Fund', country: 'Hong Kong', flag: '🇭🇰', city: 'Cyberport 3', region: 'Asia' },
  { name: 'São Paulo Institutional Macro Vault', country: 'Brazil', flag: '🇧🇷', city: 'Faria Lima', region: 'Americas' },
  { name: 'Bavarian High-Yield Staking Pool', country: 'Germany', flag: '🇩🇪', city: 'Munich Brienner', region: 'Europe' },
];

export function getRandomGlobalIdentity(): GlobalIdentity {
  const index = Math.floor(Math.random() * GLOBAL_IDENTITIES.length);
  return GLOBAL_IDENTITIES[index];
}

export const ONCHAIN_CHANNELS = [
  'Bitcoin (BTC Native SegWit)',
  'USDT (TRC-20 Instant)',
  'Ethereum (ERC-20 Mainnet)',
  'Solana (SOL Fast Block)',
  'BNB Chain (BEP-20)',
  'Bank Wire (SWIFT / Fedwire)',
  '0xGuard Multi-Sig Settlement',
  'VIP Executive Yield Staking',
  'Polygon (POL PoS)',
  'Arbitrum One (L2 Gateway)',
  'Avalanche (C-Chain)',
  'Direct 3D Card Checkout',
  'Gift Card Liquidity Vault',
];

export function generateRandomHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

// Generate an amount strictly between $1,200 and $34,850 (never exceeding $35,000)
export function getRandomCappedAmount(type: 'withdrawal' | 'deposit' | 'investment' | 'staking_reward'): number {
  if (type === 'withdrawal') {
    // Range $1,800 to $32,500
    const raw = Math.floor(Math.random() * 30700) + 1800;
    // Round nicely to 50s or 100s for realism
    return Math.min(34900, Math.round(raw / 50) * 50);
  } else if (type === 'deposit') {
    // Range $2,400 to $34,800
    const raw = Math.floor(Math.random() * 32400) + 2400;
    return Math.min(34900, Math.round(raw / 100) * 100);
  } else if (type === 'investment') {
    // Range $3,500 to $34,500
    const raw = Math.floor(Math.random() * 31000) + 3500;
    return Math.min(34900, Math.round(raw / 100) * 100);
  } else {
    // Staking reward: Range $450 to $4,900
    const raw = Math.floor(Math.random() * 4450) + 450;
    return Math.round(raw / 10) * 10;
  }
}

export function createDynamicLiveActivity(timeAgoSeconds = 1): import('../types').LiveActivity {
  const identity = getRandomGlobalIdentity();
  const channel = ONCHAIN_CHANNELS[Math.floor(Math.random() * ONCHAIN_CHANNELS.length)];
  
  const types: Array<'withdrawal' | 'deposit' | 'investment' | 'staking_reward'> = [
    'withdrawal',
    'deposit',
    'withdrawal',
    'investment',
    'deposit',
    'withdrawal',
    'staking_reward',
  ];
  const type = types[Math.floor(Math.random() * types.length)];
  const amount = getRandomCappedAmount(type);

  return {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type,
    name: identity.name,
    country: identity.country,
    city: identity.city,
    flag: identity.flag,
    amount,
    channel,
    timeAgoSeconds,
    txHash: generateRandomHash(),
  };
}

// Fisher-Yates shuffle helper
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Generate an expansive catalog of 220+ distinct initial transactions globally distributed
export function generateInitial200LiveActivities(): import('../types').LiveActivity[] {
  const list: import('../types').LiveActivity[] = [];
  // Shuffle all 450+ identities so names and countries are thoroughly varied from index 0
  const shuffledIdentities = shuffleArray(GLOBAL_IDENTITIES);
  const total = Math.min(250, shuffledIdentities.length);

  for (let i = 0; i < total; i++) {
    const identity = shuffledIdentities[i];
    const channel = ONCHAIN_CHANNELS[i % ONCHAIN_CHANNELS.length];
    
    const typeCycle: Array<'withdrawal' | 'deposit' | 'investment' | 'staking_reward'> = [
      'withdrawal',
      'deposit',
      'withdrawal',
      'investment',
      'deposit',
      'withdrawal',
      'staking_reward',
      'deposit',
    ];
    const type = typeCycle[i % typeCycle.length];

    // Amounts strictly capped under $35,000
    let amount = 0;
    if (type === 'withdrawal') {
      amount = Math.min(33500, ((i * 387 + 2200) % 29000) + 2100);
    } else if (type === 'deposit') {
      amount = Math.min(34800, ((i * 541 + 3100) % 31000) + 2800);
    } else if (type === 'investment') {
      amount = Math.min(34500, ((i * 473 + 4500) % 29000) + 3800);
    } else {
      amount = ((i * 83 + 450) % 3800) + 550;
    }

    // Stagger time offsets from 2s to ~90m ago
    const timeAgoSeconds = (i * 18) + ((i % 7) * 5) + 2;

    list.push({
      id: `act-init-${i + 1}-${identity.country.replace(/[^a-zA-Z]/g, '').toLowerCase()}`,
      type,
      name: identity.name,
      country: identity.country,
      city: identity.city,
      flag: identity.flag,
      amount,
      channel,
      timeAgoSeconds,
      txHash: generateRandomHash(),
    });
  }

  return list;
}

export const INITIAL_200_LIVE_ACTIVITIES = generateInitial200LiveActivities();


