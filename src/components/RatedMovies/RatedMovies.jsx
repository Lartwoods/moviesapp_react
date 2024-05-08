import React, { useRef, useEffect, useState } from 'react';
import { Flex, Spin } from 'antd';
import MovieService from '../../services/MovieService.jsx';
import RatedCardMovie from '../RatedCardMovie/RatedCardMovie.jsx';
import './RatedMovies.css';

export default function RatedMovies({ loading, genres, movies }) {
  const [ratedMoviesMy, setRatedMoviesMy] = useState([]);
  const [movieRatings, setMovieRatings] = useState({});
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  });
  const rateMovie = async (movieId, rating) => {
    try {
      const movieService = new MovieService();
      const token = movieService.getToken();
      if (!token) {
        throw new Error('Guest session token not available');
      }
      await movieService.postMovieRating(movieId, rating);
      setMovieRatings((prevRatings) => ({
        ...prevRatings,
        [movieId]: rating,
      }));
    } catch (error) {
      console.error('Error rating movie:', error);
    }
  
  };

  function updateRatedFromStore() {
    const initStore = JSON.parse(localStorage.getItem('movies'));
    setRatedMoviesMy(initStore);
  }
  useEffect(() => {
    updateRatedFromStore();
  }, [movies]);
  return (
    <>
      {loading ? (
        <Flex justify="center" align="center" style={{ minHeight: '100vh' }}>
          <Spin size="large" />
        </Flex>
      ) : (
        <>
          <div className="movies-list">
            {ratedMoviesMy && ratedMoviesMy.length > 0
              ? ratedMoviesMy.map((movie, index) => (
                  <RatedCardMovie
                    key={movie.id}
                    movie={movie}
                   
                  />
                ))
              : null}
          </div>
        </>
      )}
    </>
  );
}
