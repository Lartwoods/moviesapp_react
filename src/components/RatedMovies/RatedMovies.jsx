import React, { useRef, useEffect } from 'react';
import { Flex, Spin } from 'antd';
import RatedCardMovie from '../RatedCardMovie/RatedCardMovie.jsx';
import './RatedMovies.css';

export default function RatedMovies({ loading, genres, ratedMoviesMy }) {
  const inputRef = useRef(null);

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
          <div className="movies-list">
            {ratedMoviesMy && ratedMoviesMy.length > 0
              ? ratedMoviesMy.map((movie, index) => (
                  <RatedCardMovie
                    key={movie.id}
                    movie={movie}
                    genres={genres}
                  />
                ))
              : null}
          </div>
        </>
      )}
    </>
  );
}
