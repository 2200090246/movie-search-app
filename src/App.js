import React from 'react';
import { useState } from 'react';
import './styles.css'
function App() {
   const [query,setQuery] = useState('')
   const [movies,setMovies] = useState([])
   
    const searchMovies = async()=>{
      try{
        const res=await fetch(`https://www.omdbapi.com/?s=${query}&apikey=e76f4147`);
        const data = await res.json()
        setMovies(data.Search)
      }catch(err){
        setMovies([])
      }
    }
  return (
    <div className='app-container'>
      <div className='app-content'>
        <h1 className='app-title'>🎬 Movie Search</h1>
          <div className='search-bar'>
            <input
            type='text'
            placeholder='search for a movie'
            className='search-input'
            onChange={(e =>setQuery(e.target.value))}
            value = {query}
            />
            <button className='search-button' onClick={searchMovies}>search</button>
          </div>
          {
            movies.map((movie)=>{
              return <div key={movie.imdbID} className='poster'>
                <img src={movie.Poster} alt='hello' />
              </div>
            })
          }
      </div>
     
    </div>
  )
}

export default App
