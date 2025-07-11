import React, { useState, useEffect, useRef } from 'react';
import './styles.css';

function App() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [posterErrors, setPosterErrors] = useState({});
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef();

  // 🔍 Fetch suggestions while typing
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 3) {
        setSuggestions([]);
        setActiveIndex(-1);
        return;
      }
      try {
        const res = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=e76f4147`);
        const data = await res.json();
        if (data.Response === 'True') {
          setSuggestions(data.Search.map((movie) => movie.Title));
        } else {
          setSuggestions([]);
        }
      } catch {
        setSuggestions([]);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // ✅ Clear movies and errors if input is cleared
  useEffect(() => {
    if (query.trim() === '') {
      setMovies([]);
      setErrorMessage('');
    }
  }, [query]);

  // 🔍 Search movies when Search is clicked or suggestion is selected
  const searchMovies = async (title = query) => {
    setErrorMessage('');
    setMovies([]);
    setPosterErrors({});
    setSuggestions([]);
    setActiveIndex(-1);

    try {
      const exactRes = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=e76f4147`);
      const exactData = await exactRes.json();

      if (exactData.Response === 'True') {
        setMovies([exactData]);
        return;
      }

      const listRes = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(title)}&apikey=e76f4147`);
      const listData = await listRes.json();

      if (listData.Response === 'True') {
        setMovies(listData.Search);
      } else {
        setErrorMessage('No results found. Please try another title.');
      }
    } catch (err) {
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  const handleDownload = async (url, title) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${title}.jpg`;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      alert('Download failed.');
    }
  };

  const handleImageError = (title) => {
    setPosterErrors((prev) => ({ ...prev, [title]: true }));
  };

  const handleSuggestionClick = (title) => {
    setQuery(title);
    searchMovies(title);
    setSuggestions([]);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        const selected = suggestions[activeIndex];
        setQuery(selected);
        searchMovies(selected);
        setSuggestions([]);
        setActiveIndex(-1);
      } else {
        searchMovies();
      }
    }
  };

  return (
    <div className="app-container">
      <h1 className="app-title">🎬 Movie Search</h1>

      <div className="search-bar-wrapper">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for a movie or series"
            className="search-input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            ref={inputRef}
          />
          <button className="search-button" onClick={() => searchMovies()}>
            Search
          </button>
        </div>

        {suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((title, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(title)}
                className={index === activeIndex ? 'active' : ''}
              >
                {title}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 🎉 Welcome message when input is empty */}
      {query.trim() === '' && movies.length === 0 && !errorMessage && (
        <p className="welcome-message">🎉 Welcome! Download your favourite movie poster 🎥</p>
      )}

      {errorMessage && <p className="error">{errorMessage}</p>}

      <div className="movie-grid">
        {movies.map((movie) => (
          <div key={movie.imdbID || movie.Title} className="poster">
            {!posterErrors[movie.Title] && movie.Poster !== 'N/A' ? (
              <>
                <img
                  src={movie.Poster}
                  alt={movie.Title}
                  height="250px"
                  onError={() => handleImageError(movie.Title)}
                />
                <p>{movie.Title}</p>
                <button
                  className="download-button"
                  onClick={() => handleDownload(movie.Poster, movie.Title)}
                >
                  Download Poster
                </button>
              </>
            ) : (
              <>
                <p>{movie.Title}</p>
                <p className="no-poster-message">Poster not available for this title.</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
