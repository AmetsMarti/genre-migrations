import genreDefinitions from './genres';

function fetchTimeSpanGenres(startYear, endYear = startYear + 100) {
  const baseurl = "/api/openlibrary/search.json";
  const limit = 10;
  const sort = "editions";

  const fields = "title,first_publish_year,subject,publish_place,author_name";

  const query = `first_publish_year:[${startYear} TO ${endYear}]`;
  const url = `${baseurl}?q=${encodeURIComponent(query)}&limit=${limit}&sort=${sort}&fields=${fields}`;

  return fetch(url)
    .then(response => response.json())
    .then(data => {

      const uniqueGenres = new Set();
      data.docs.forEach(book => {
        if (book.subject) {
          book.subject.forEach(subject => {
            const lowerSubject = subject.toLowerCase();

            const matchedGenre = genreDefinitions.find(genre =>
              genre.keywords.some(keyword => lowerSubject.includes(keyword.toLowerCase()))
            );

            if (matchedGenre) {
              uniqueGenres.add(matchedGenre.name);
            }
          });
        }
      });
      console.log(uniqueGenres);
      console.log(data.docs.map(book => book.title));
      return uniqueGenres;
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      return [];
    });
}

export default fetchTimeSpanGenres;
