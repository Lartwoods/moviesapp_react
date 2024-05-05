import React, { useState, useEffect, useCallback, createContext } from 'react';
import { Alert, Space, Pagination, Spin, Tabs } from 'antd';
import './App.css';
import MoviesList from './components/MoviesList/MoviesList.jsx';
import MovieService from './services/MovieService.jsx';
import RatedMovies from './components/RatedMovies/RatedMovies.jsx';
import { debounce } from 'lodash';

export const { Provider, Consumer } = React.createContext();

export const GenresContext = createContext([]);

function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [postPerPage] = useState(20);
  const [searchText, setSearchText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [genres, setGenres] = useState([]);
  const [movieRatings, setMovieRatings] = useState({});
  const [rateMovies, setRatedMovies] = useState([]);
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

  const [storage, setStorage] = useState([]);

  useEffect(() => {
    const isStorage = JSON.parse(localStorage.getItem('movies'));
    if (!isStorage) {
      localStorage.setItem('movies', JSON.stringify([]));
    }
  }, []);

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

  const handleInputChange = async (searchText, searchPage = '') => {
    const movieService = new MovieService();
    const result = await movieService.getSearchResultMovies(
      searchText,
      searchPage
    );
    const { total_pages, total_results, page, results } = result;
    setMovies(results);
    setTotal(total_pages);
    setPage(page);
  };

  const filteredMovies = movies.filter((movie) =>
    movie?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastPage = page * postPerPage;
  const indexOfFirstPage = indexOfLastPage - postPerPage;
  const currentFilteredPosts = filteredMovies.slice(
    indexOfFirstPage,
    indexOfLastPage
  );

  const [ratedMoviesMy, setRatedMoviesMy] = useState([]);
  function updateRatedFromStore() {
    const initStore = JSON.parse(localStorage.getItem('movies'));
    setRatedMoviesMy(initStore);
  }
  useEffect(() => {
    updateRatedFromStore();
  }, [movies]);

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
                onInputChange={handleInputChange}
                searchTerm={searchTerm}
                movies={movies}
                currentFilteredPosts={currentFilteredPosts}
                genres={genres}
                rateMovie={rateMovie}
                setMovies={setMovies}
                setRatedMovies={setRatedMovies}
                activeTabKey={activeTabKey}
                setStorage={setStorage}
                setSearchText={setSearchText}
              />
              <Pagination
                className="custom-pagination"
                onChange={(value) => {
                  handleInputChange(searchText, value);
                }}
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
          <RatedMovies genres={genres} ratedMoviesMy={ratedMoviesMy} />
        </>
      ),
    },
  ];

  return (
    <div className="App">
      <Tabs centered className="tabs" defaultActiveKey="tab1" items={items} />
    </div>
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
