const fs = require('fs');
const path = require('path');

// Extract country data from world.json
const worldDataPath = path.join(__dirname, '../src/assets/world.json');
const worldData = JSON.parse(fs.readFileSync(worldDataPath, 'utf8'));

// Helper to get a random coordinate within a feature's bounding box
// (Simple approximation: center or random point in bbox)
function getRandomPoint(feature) {
    // For simplicity, we use the first coordinate of the first polygon/multipolygon
    // A better way would be centroid or random sampling in bbox, but this ensures it's "in" the country's geometry definition.
    let coords;
    if (feature.geometry.type === 'Polygon') {
        coords = feature.geometry.coordinates[0][0];
    } else {
        coords = feature.geometry.coordinates[0][0][0];
    }
    // Add a tiny bit of jitter so not all books from a country overlap exactly
    return [
        coords[0] + (Math.random() - 0.5) * 0.5,
        coords[1] + (Math.random() - 0.5) * 0.5
    ];
}

const countries = worldData.features.map(f => ({
    name: f.properties.name,
    coords: getRandomPoint(f)
}));

const genres = ['Fiction', 'Science', 'History', 'Biography', 'Mystery', 'Fantasy', 'Non-fiction', 'Poetry'];
const authors = [
    'Elena Ferrante', 'Haruki Murakami', 'Isabel Allende', 'Gabriel García Márquez',
    'Chimamanda Ngozi Adichie', 'Zadie Smith', 'Arundhati Roy', 'Kazuo Ishiguro',
    'Margaret Atwood', 'Toni Morrison', 'Salman Rushdie', 'Orhan Pamuk',
    'Milan Kundera', 'Alice Munro', 'Philip Roth', 'Don DeLillo',
    'Thomas Pynchon', 'Joyce Carol Oates', 'Cormac McCarthy', 'Ursula K. Le Guin'
];

const bookPrefixes = ['The Art of', 'History of', 'Memories of', 'Journey to', 'Silence of', 'Secrets of', 'Echoes of', 'Shadow over'];
const bookSubjects = ['Time', 'Stardust', 'Solitude', 'Empire', 'Identity', 'Ocean', 'Forest', 'City', 'Mind', 'Spirit'];

function generateBook(id) {
    const genre = genres[Math.floor(Math.random() * genres.length)];
    const author = authors[Math.floor(Math.random() * authors.length)];
    const countryData = countries[Math.floor(Math.random() * countries.length)];
    const year = Math.floor(Math.random() * 41) + 1980; // 1980 to 2020
    const title = `${bookPrefixes[Math.floor(Math.random() * bookPrefixes.length)]} ${bookSubjects[Math.floor(Math.random() * bookSubjects.length)]} ${id}`;

    return {
        id: id,
        title: title,
        author: author,
        year: year,
        genre: genre,
        author_birthplace: `City ${id}, ${countryData.name}`,
        coords: countryData.coords // Real coordinates within country
    };
}

const numBooks = 8000;
const books = [];
for (let i = 1; i <= numBooks; i++) {
    books.push(generateBook(i));
}

const outputPath = path.join(__dirname, '../src/assets/books_simulation.json');
fs.writeFileSync(outputPath, JSON.stringify(books, null, 4));

console.log(`Generated ${numBooks} books with coordinates in ${outputPath}`);
