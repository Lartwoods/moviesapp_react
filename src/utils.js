import MovieService from './services/MovieService';

export const handleInputChange = async (
  searchText,
  setMovies,
  setTotal,
  setPage
) => {
  try {
    const movieService = new MovieService();
    const result = await movieService.getSearchResultMovies(searchText);
    const { total_pages, page, results } = result;
    setMovies(results);
    setTotal(total_pages);
    setPage(page);
  } catch (error) {
    console.error('Error handling input change:', error);
  }
};
