import React, { useState } from 'react';
import './styles.css';

function App() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);

  const searchMovies = async () => {
    try {
      // 1. Try exact match with `t=`
      const exactRes = await fetch(`https://www.omdbapi.com/?t=${query}&apikey=e76f4147`);
      const exactData = await exactRes.json();

      if (exactData.Response === 'True' && exactData.Poster !== 'N/A') {
        setMovies([exactData]); // wrap single result in an array
        return;
      }

      // 2. Try general search with `s=`
      const res = await fetch(`https://www.omdbapi.com/?s=${query}&apikey=e76f4147`);
      const data = await res.json();

      if (data.Response === 'True') {
        const validMovies = data.Search.filter(movie => movie.Poster && movie.Poster !== 'N/A');
        setMovies(validMovies);
      } else {
        setMovies([]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setMovies([]);
    }
  };
  const handleDownload = async (url, title) => {
  try {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${title}.jpg`;
    link.click();
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    alert('Download failed. Image might be protected by the server.');
  }
};


  return (
    <div className='app-container'>
      <div className='app-content'>
        <h1 className='app-title'>🎬 Movie Search</h1>
        <div className='search-bar'>
          <input
            type='text'
            placeholder='Search for a movie or series'
            className='search-input'
            onChange={(e) => setQuery(e.target.value)}
            value={query}
          />
          <button className='search-button' onClick={searchMovies}>Search</button>
        </div>

        <div className='movie-grid'>
          {movies.map((movie) => (
            <div key={movie.imdbID || movie.Title} className='poster'>
              <img src={movie.Poster} alt={movie.Title} height="250px" />
              <p>{movie.Title}</p>
              
                <button
                  className="download-button"
                  onClick={() => handleDownload(movie.Poster, movie.Title)}
                >
                  Download Poster
                </button>

              

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
