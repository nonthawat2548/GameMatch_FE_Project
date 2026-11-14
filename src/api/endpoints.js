import { api } from './backend';

const read = (path, options) => options === undefined ? api(path) : api(path, options);
export const getMe = () => api('/api/me');
export const login = (email, password) =>
  api('/api/auth/login', { method: 'POST', body: { email, password } });
export const register = (email, password, displayName) =>
  api('/api/auth/register', { method: 'POST', body: { email, password, displayName } });
export const logout = () => api('/api/auth/logout', { method: 'POST' });
export const updateProfile = (displayName) =>
  api('/api/me', { method: 'PUT', body: { displayName } });
export const changePassword = (currentPassword, newPassword) =>
  api('/api/me/password', { method: 'PUT', body: { currentPassword, newPassword } });

export const getGames = (options) => read('/api/games', options);
export const getGame = (id, options) => read(`/api/games/${id}`, options);
export const getGameMetadata = (id, options) => read(`/api/games/${id}/metadata`, options);
export const getGameTrailers = (id, options) => read(`/api/games/${id}/trailers`, options);
export const getSteamRating = (id, options) => read(`/api/games/${id}/steam-rating`, options);
export const getSimilarGames = (id, options) => read(`/api/games/${id}/similar`, options);
export const getMemberRecommendations = (options) => read('/api/me/recommendations', options);
export const recommendGames = (preference) =>
  api('/api/recommendations', { method: 'POST', body: preference });
export const getPreferences = () => api('/api/me/preferences');
export const savePreferences = (preference) =>
  api('/api/me/preferences', { method: 'PUT', body: preference });
export const getFavorites = (options) => read('/api/me/favorites', options);
export const addFavorite = (id) => api(`/api/me/favorites/${id}`, { method: 'PUT' });
export const removeFavorite = (id) => api(`/api/me/favorites/${id}`, { method: 'DELETE' });

export const getReviews = (gameId, options) => read(`/api/games/${gameId}/reviews`, options);
export const createReview = (gameId, fields) =>
  api(`/api/games/${gameId}/reviews`, { method: 'POST', body: fields });
export const updateReview = (gameId, reviewId, fields) =>
  api(`/api/games/${gameId}/reviews/${reviewId}`, { method: 'PUT', body: fields });
export const deleteReview = (gameId, reviewId) =>
  api(`/api/games/${gameId}/reviews/${reviewId}`, { method: 'DELETE' });
export const getReviewVotes = (gameId, options) => read(`/api/me/review-votes/${gameId}`, options);
export const setReviewHelpful = (gameId, reviewId, voted) =>
  api(`/api/games/${gameId}/reviews/${reviewId}/helpful`, { method: voted ? 'PUT' : 'DELETE' });

export const getAdminGames = (options) => read('/api/admin/games', options);
export const createGame = (fields) => api('/api/admin/games', { method: 'POST', body: fields });
export const updateGame = (id, fields) =>
  api(`/api/admin/games/${id}`, { method: 'PUT', body: fields });
export const deleteGame = (id) => api(`/api/admin/games/${id}`, { method: 'DELETE' });
export const getAdminStats = (options) => read('/api/admin/stats', options);
export const getAdminMembers = (options) => read('/api/admin/members', options);
export const setMemberRole = (id, role) =>
  api(`/api/admin/members/${id}/role`, { method: 'PUT', body: { role } });
export const getSteamSyncStatus = (options) => read('/api/admin/sync/status', options);
export const importSteamGames = (after = 0) =>
  api('/api/admin/sync/steam' + (after ? '?after=' + encodeURIComponent(after) : ''), { method: 'POST' });
