import React, { useState, useEffect, useCallback } from 'react';
import { Alert, Space, Pagination, Spin, Tabs } from 'antd';
import './App.css';
import MoviesList from './components/MoviesList/MoviesList.jsx';
import { GenresProvider } from './contexts/GenreContext.jsx';
import MovieService from './services/MovieService.jsx';
import RatedMovies from './components/RatedMovies/RatedMovies.jsx';
import { debounce } from 'lodash';
import { handleInputChange } from './utils';

function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [postPerPage] = useState(20);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [activeTabKey, setActiveTabKey] = useState('tab1');

  const fetchMovies = useCallback(async () => {
    try {
      if (!navigator.onLine) {
        throw new Error('No internet connection');
      }
      const movieService = new MovieService();
      movieService.getAllMovies().then((res) => {
        setMovies(res);
        setLoading(false);
        setTotal(res.length);
      });
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  }, []);

  const delayedFetchMovies = debounce(fetchMovies, 700);

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    delayedFetchMovies.flush();
    delayedFetchMovies();
    setLoading(true);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    const initializeGuestSession = async () => {
      try {
        const movieService = new MovieService();
        const { guest_session_id } = await movieService.getGuestSession();
        movieService.setSessionToken(guest_session_id);
      } catch (error) {
        console.error('Error initializing guest session:', error);
      }
    };

    initializeGuestSession();
  }, []);

  const items = [
    {
      key: 'tab1',
      label: `Search`,
      children: (
        <>
          {error ? (
            <Space
              className="custom-space"
              direction="vertical"
              style={{
                width: '100%',
              }}
            >
              <Alert message={errorMessage(error)} type="error" />
            </Space>
          ) : (
            <>
              <MoviesList
                loading={loading}
                onInputChange={(text) =>
                  handleInputChange(text, setMovies, setTotal, setPage)
                }
                movies={movies}
                page={page}
                setMovies={setMovies}
                activeTabKey={activeTabKey}
                setSearchText={setSearchText}
                postPerPage={postPerPage}
              />
              <Pagination
                className="custom-pagination"
                onChange={(value) =>
                  handleInputChange(searchText, setMovies, setTotal, setPage)
                }
                total={total}
                current={page}
                pageSize={postPerPage}
                hideOnSinglePage
              />
              {loading && <Spin />}
            </>
          )}
        </>
      ),
    },
    {
      key: 'tab2',
      label: `Rated`,
      children: (
        <>
          <RatedMovies />
        </>
      ),
    },
  ];

  return (
    <GenresProvider>
      <div className="App">
        <Tabs centered className="tabs" defaultActiveKey="tab1" items={items} />
      </div>
    </GenresProvider>
  );
}

function errorMessage(error) {
  if (error.message === 'No internet connection') {
    return 'No internet connection. Please check your network settings and try again.';
  } else {
    return "Well, this is awkward! Something's not quite right. Try to reload the page.";
  }
}

export default App;
