import React, { createContext, useContext, useState, useEffect } from 'react';

import MovieService from '../services/MovieService.jsx';

const GenresContext = createContext([]);

export const useGenres = () => useContext(GenresContext);

export const GenresProvider = ({ children }) => {
  const [genres, setGenres] = useState([]);
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const movieService = new MovieService();
        const genresData = await movieService.getGenres();
        setGenres(genresData);
      } catch (error) {
        console.error('Error loading genres:', error);
      }
    };

    fetchGenres();
  }, []);

  return (
    <GenresContext.Provider value={[genres, setGenres]}>
      {children}
    </GenresContext.Provider>
  );
};
