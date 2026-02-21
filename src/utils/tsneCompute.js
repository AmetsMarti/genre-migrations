/**
 * Utility function to compute t-SNE directly in the main thread.
 * Optimized for performance with efficient preprocessing and iteration control.
 */
import tsnejs from 'tsne';

const { tSNE } = tsnejs;

// Cache for parsed topics
const topicCache = new Map();

function parseTopics(temasString) {
    if (!temasString) return [];
    
    if (topicCache.has(temasString)) {
        return topicCache.get(temasString);
    }
    
    const topics = temasString
        .split('|')
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0);
    
    topicCache.set(temasString, topics);
    return topics;
}

export function computeTSNEDirect(books) {
    if (!books || books.length < 3) {
        return {};
    }

    try {
        // --- 1. Extract topics efficiently with caching ---
        const topicCounts = new Map();
        const bookTopics = [];
        
        for (let i = 0; i < books.length; i++) {
            const topics = parseTopics(books[i].Temas);
            bookTopics.push(topics);
            
            for (const topic of topics) {
                topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
            }
        }

        // Use the most frequent topics (top N) to keep vectors manageable
        const MAX_TOPICS = 60;
        const sortedTopics = Array.from(topicCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, MAX_TOPICS)
            .map(([topic]) => topic);

        const topicIndex = new Map(sortedTopics.map((t, i) => [t, i]));
        const numTopics = sortedTopics.length;

        // --- 2. Build binary vectors efficiently ---
        const dataVectors = new Array(books.length);
        for (let i = 0; i < books.length; i++) {
            const vec = new Uint8Array(numTopics);
            const topics = bookTopics[i];
            for (const topic of topics) {
                const idx = topicIndex.get(topic);
                if (idx !== undefined) {
                    vec[idx] = 1;
                }
            }
            dataVectors[i] = Array.from(vec);
        }

        // --- 3. Run t-SNE with optimized parameters ---
        const n = books.length;
        const perplexity = Math.min(20, Math.max(5, Math.floor(n / 5)));
        
        // Adaptive iteration count: fewer for large datasets, more for small ones
        let nIter;
        if (n < 10) {
            nIter = 150;
        } else if (n < 50) {
            nIter = 200;
        } else if (n < 200) {
            nIter = 250;
        } else {
            nIter = Math.min(300, Math.max(200, Math.floor(400000 / n)));
        }

        const model = new tSNE({
            dim: 2,
            perplexity: perplexity,
            epsilon: 10,
        });

        model.initDataRaw(dataVectors);

        // Run iterations
        for (let i = 0; i < nIter; i++) {
            model.step();
        }

        const solution = model.getSolution();

        // --- 4. Normalize efficiently in single pass ---
        let minX = Number.MAX_VALUE, maxX = -Number.MAX_VALUE;
        let minY = Number.MAX_VALUE, maxY = -Number.MAX_VALUE;

        for (let i = 0; i < solution.length; i++) {
            const x = solution[i][0];
            const y = solution[i][1];
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }

        const rangeX = maxX - minX || 1;
        const rangeY = maxY - minY || 1;

        const tsneCoords = {};
        for (let i = 0; i < books.length; i++) {
            const [x, y] = solution[i];
            tsneCoords[books[i].id] = [
                ((x - minX) / rangeX) * 90 + 5,
                ((y - minY) / rangeY) * 90 + 5,
            ];
        }

        return tsneCoords;
    } catch (err) {
        console.error('Direct t-SNE computation error:', err);
        return {};
    }
}
