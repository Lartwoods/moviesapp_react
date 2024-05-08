import React, { useRef, useEffect } from 'react';
import { Flex, Spin, Alert } from 'antd';
import CardMovie from '../CardMovie/CardMovie.jsx';
import './MoviesList.css';
import { debounce } from 'lodash';

export default function MoviesList({
  loading,
  onInputChange,
  rateMovie,
  ratedMovies,
  setMovies,
  setRatedMovies,
  activeTabKey,
  movies,
  setSearchText,
}) {
  const inputRef = useRef(null);

  const updateSearchText = (e) => {
    onInputChange(e.target.value);
    setSearchText(e.target.value);
  };
  const debouncedSearchText = debounce(updateSearchText, 500);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  });

  return (
    <>
      {loading ? (
        <Flex justify="center" align="center" style={{ minHeight: '100vh' }}>
          <Spin size="large" />
        </Flex>
      ) : (
        <>
          {activeTabKey === 'tab1' && (
            <div className="search-bar">
              <input
                className="search-bar-input"
                ref={inputRef}
                type="text"
                placeholder="Type to search..."
                onInput={debouncedSearchText}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateSearchText(e);
                  }
                }}
              />
            </div>
          )}
          <div className="movies-list">
            {movies && movies.length > 0
              ? movies.map((movie, index) => (
                  <CardMovie
                    key={movie.id}
                    movie={movie}
                    rateMovie={rateMovie}
                    setMovies={setMovies}
                  />
                ))
              : activeTabKey === 'tab1' && (
                  <Alert message="I'm sorry :( No results found." type="info" />
                )}
          </div>
          <div className="movies-list">
            {ratedMovies && ratedMovies.length > 0
              ? ratedMovies.map((movie, index) => (
                  <CardMovie
                    key={movie.id}
                    movie={movie}
                    genres={genres}
                    rateMovie={rateMovie}
                    setMovies={setMovies}
                    setRatedMovies={setRatedMovies}
                  />
                ))
              : null}
          </div>
        </>
      )}
    </>
  );
}
