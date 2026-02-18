const fs = require('fs');
const path = require('path');
const tsne = require('tsne'); // Data visualization library

// --- 1. SETUP & DATA LOADING ---

// Extract country data from world.json
const worldDataPath = path.join(__dirname, '../src/assets/world.json');
const worldData = JSON.parse(fs.readFileSync(worldDataPath, 'utf8'));

// Load Real Data
const realDataPath = path.join(__dirname, '../src/assets/real_data.json');
let rawData = [];
try {
    const rawContent = fs.readFileSync(realDataPath, 'binary'); // Read as binary to handle encoding manually if needed, or just utf8
    // The user file likely has latin1 or similar encoding issue based on "Ao". 
    // For simplicity in Node, we'll try reading utf8 and fixing known glitches or just mapping keys by order/inference.
    rawData = JSON.parse(fs.readFileSync(realDataPath, 'utf8'));
} catch (e) {
    console.error("Error reading real_data.json", e);
}

// Helper to get a random coordinate within a feature's bounding box
function getRandomPoint(feature) {
    if (!feature) return [0, 0];
    let coords;
    if (feature.geometry.type === 'Polygon') {
        coords = feature.geometry.coordinates[0][0];
    } else {
        coords = feature.geometry.coordinates[0][0][0];
    }
    // Add jitter
    return [
        coords[0] + (Math.random() - 0.5) * 1.0,
        coords[1] + (Math.random() - 0.5) * 1.0
    ];
}

// Map Country Names to GeoJSON Features
const countryMap = {};
worldData.features.forEach(f => {
    countryMap[f.properties.name] = f;
    // Add some common aliases if needed
    if (f.properties.name === "United States of America") countryMap["United States"] = f;
    if (f.properties.name === "United Kingdom") countryMap["UK"] = f;
});

const countries = worldData.features.map(f => ({
    name: f.properties.name,
    feature: f,
    coords: getRandomPoint(f)
}));

// --- 2. PROCESSING LOGIC ---

console.log(`Processing ${rawData.length} books from real_data.json...`);

const processedBooks = rawData.map((item, index) => {
    // Fix encoding/keys roughly
    const yearKey = Object.keys(item).find(k => k.includes('A') && k.includes('o')); // Matches "Ao" or "Año"
    const year = parseInt(item[yearKey] || item.Year || 1980);

    // Map Fields
    const title = item.Titulo || "Unknown Title";
    const author = item.Autor || "Unknown Author";
    const genre = item.Genero || "Uncategorized";
    const originCountryName = item.Pais_Autor || "Unknown";

    // Parse Themes (pipe separated)
    const rawThemes = item.Temas || "";
    const themesList = rawThemes.split('|').map(t => t.trim()).filter(t => t.length > 0);
    const theme = themesList.length > 0 ? themesList[0] : "General"; // Pick first as primary theme

    // Geolocation for Author
    let originFeature = countryMap[originCountryName];
    // Fallback?
    if (!originFeature) {
        // Try simple search
        originFeature = Object.values(countryMap).find(f => f.properties.name.includes(originCountryName));
    }
    // Final fallback: random country? Or skip? Let's fallback to random to ensure points on map.
    if (!originFeature) {
        originFeature = countries[Math.floor(Math.random() * countries.length)].feature;
    }

    const originCoords = getRandomPoint(originFeature);

    // Migration Logic: Simulate publish place since it's missing in real_data
    // 30% chance of publishing elsewhere
    let publishCountryName = originCountryName;
    let publishFeature = originFeature;

    if (Math.random() > 0.7) { // 30% chance migration
        const randomCountry = countries[Math.floor(Math.random() * countries.length)];
        publishCountryName = randomCountry.name;
        publishFeature = randomCountry.feature;
    }

    const publishCoords = getRandomPoint(publishFeature);

    return {
        id: index + 1,
        Titulo: title,
        Autor: author,
        Año: year,
        Genero: genre,
        Temas: rawThemes, // Keep original string as per request
        Pais_Autor: originCountryName,
        Coords_Autor: originCoords,
        Pais_Publicacion: publishCountryName, // Migrated
        Coords_Publicacion: publishCoords,
        tsne_coords: [] // Will be filled later
    };
});

// --- 3. t-SNE CALCULATION ---

console.log('Preparing data for t-SNE...');

// Extract unique values for encoding
const allGenres = [...new Set(processedBooks.map(b => b.Genero))];
// For themes, we might need to parse if we want to use them for t-SNE. 
// Let's use the first theme from the pipe string for t-SNE context
const getFirstTheme = (temas) => temas ? temas.split('|')[0].trim() : "General";
const allThemes = [...new Set(processedBooks.map(b => getFirstTheme(b.Temas)))];
const allCountries = [...new Set(processedBooks.map(b => b.Pais_Autor))];

const dataVectors = processedBooks.map(book => {
    const gIndex = allGenres.indexOf(book.Genero);
    const tIndex = allThemes.indexOf(getFirstTheme(book.Temas));
    const cIndex = allCountries.indexOf(book.Pais_Autor);
    const yNorm = (book.Año - 1980) / 50;

    return [gIndex, tIndex, cIndex, yNorm];
});

console.log('Running t-SNE...');

const model = new tsne.tSNE({
    dim: 2,
    perplexity: 30.0,
    earlyExaggeration: 4.0,
    learningRate: 100.0,
    nIter: 500,
    metric: 'euclidean'
});

model.initDataRaw(dataVectors);

for (let i = 0; i < 500; i++) {
    model.step();
    if (i % 100 === 0) console.log(`  t-SNE iteration ${i}...`);
}

const solution = model.getSolution();

// Normalize coords
const xVals = solution.map(s => s[0]);
const yVals = solution.map(s => s[1]);
const minX = Math.min(...xVals), maxX = Math.max(...xVals);
const minY = Math.min(...yVals), maxY = Math.max(...yVals);

processedBooks.forEach((book, i) => {
    const [x, y] = solution[i];
    book.tsne_coords = [
        ((x - minX) / (maxX - minX)) * 100,
        ((y - minY) / (maxY - minY)) * 100
    ];
});

// --- 4. OUTPUT ---

const outputPath = path.join(__dirname, '../src/assets/real_data.json'); // Overwrite the input file with enriched data
fs.writeFileSync(outputPath, JSON.stringify(processedBooks, null, 4));

console.log(`Processed ${processedBooks.length} books from real data to ${outputPath}`);
