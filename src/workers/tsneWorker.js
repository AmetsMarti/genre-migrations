/**
 * Web Worker for real-time t-SNE computation based on topic co-occurrence.
 * 
 * Receives filtered books, builds binary topic vectors, runs t-SNE,
 * and returns normalized coordinates mapped by book id.
 */
import tsnejs from 'tsne';

const { tSNE } = tsnejs;

self.onmessage = function (e) {
    const { books } = e.data;

    if (!books || books.length < 3) {
        // Not enough points for t-SNE
        self.postMessage({ tsneCoords: {}, done: true });
        return;
    }

    try {
        // --- 1. Extract all unique topics from this subset ---
        const topicCounts = {};
        books.forEach(book => {
            const temas = book.Temas || '';
            temas.split('|').forEach(t => {
                const topic = t.trim().toLowerCase();
                if (topic.length > 0) {
                    topicCounts[topic] = (topicCounts[topic] || 0) + 1;
                }
            });
        });

        // Use the most frequent topics (top N) to keep vectors manageable
        const MAX_TOPICS = 80;
        const sortedTopics = Object.entries(topicCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, MAX_TOPICS)
            .map(([topic]) => topic);

        const topicIndex = {};
        sortedTopics.forEach((topic, i) => { topicIndex[topic] = i; });

        // --- 2. Build binary co-occurrence vectors ---
        const dataVectors = books.map(book => {
            const vec = new Array(sortedTopics.length).fill(0);
            const temas = book.Temas || '';
            temas.split('|').forEach(t => {
                const topic = t.trim().toLowerCase();
                if (topicIndex[topic] !== undefined) {
                    vec[topicIndex[topic]] = 1;
                }
            });
            return vec;
        });

        // --- 3. Run t-SNE ---
        const perplexity = Math.min(30, Math.max(5, Math.floor(books.length / 4)));
        const nIter = Math.min(300, Math.max(100, Math.floor(500000 / books.length)));

        const model = new tSNE({
            dim: 2,
            perplexity: perplexity,
            epsilon: 10,
        });

        model.initDataRaw(dataVectors);

        for (let i = 0; i < nIter; i++) {
            model.step();
        }

        const solution = model.getSolution();

        // --- 4. Normalize to [0, 100] ---
        const xVals = solution.map(s => s[0]);
        const yVals = solution.map(s => s[1]);
        const minX = Math.min(...xVals), maxX = Math.max(...xVals);
        const minY = Math.min(...yVals), maxY = Math.max(...yVals);
        const rangeX = maxX - minX || 1;
        const rangeY = maxY - minY || 1;

        const tsneCoords = {};
        books.forEach((book, i) => {
            const [x, y] = solution[i];
            tsneCoords[book.id] = [
                ((x - minX) / rangeX) * 90 + 5,  // 5-95 range for padding
                ((y - minY) / rangeY) * 90 + 5,
            ];
        });

        self.postMessage({ tsneCoords, done: true });
    } catch (err) {
        self.postMessage({ tsneCoords: {}, done: true, error: err.message });
    }
};
