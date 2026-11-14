import React, { createContext, useContext, useEffect, useState } from 'react';
import { getMe, login as loginMember, logout as logoutMember } from '../api/endpoints';
import { SESSION_EXPIRED_EVENT, TOKEN_KEY } from './session';
const AuthContext = createContext();
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(''),
    [restoreToken, setRestoreToken] = useState(() => localStorage.getItem(TOKEN_KEY)),
    [restoreAttempt, setRestoreAttempt] = useState(0);
  async function refresh() {
    const token = localStorage.getItem(TOKEN_KEY);
    const data = await getMe();
    if (localStorage.getItem(TOKEN_KEY) === token) {
      setUser(data);
      setError('');
    }
    return data;
  }
  useEffect(() => {
    function expired() {
      setUser(null);
      setRestoreToken(null);
      setLoading(false);
      setError('Session หมดอายุหรือถูกยกเลิก กรุณาเข้าสู่ระบบใหม่');
    }
    function storageChanged(event) {
      if (event.storageArea && event.storageArea !== localStorage) return;
      if (event.key !== TOKEN_KEY && event.key !== null) return;
      const token = localStorage.getItem(TOKEN_KEY);
      setUser(null);
      setError('');
      setLoading(Boolean(token));
      setRestoreToken(token);
      setRestoreAttempt((n) => n + 1);
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, expired);
    window.addEventListener('storage', storageChanged);
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, expired);
      window.removeEventListener('storage', storageChanged);
    };
  }, []);
  useEffect(() => {
    let active = true;
    if (!restoreToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    getMe()
      .then((u) => {
        if (active && localStorage.getItem(TOKEN_KEY) === restoreToken) setUser(u);
      })
      .catch((e) => {
        if (!active || localStorage.getItem(TOKEN_KEY) !== restoreToken) return;
        if (e.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          setRestoreToken(null);
          setUser(null);
        }
        setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [restoreToken, restoreAttempt]);
  function retrySession() {
    setRestoreToken(localStorage.getItem(TOKEN_KEY));
    setRestoreAttempt((n) => n + 1);
  }
  async function login(identity, password) {
    const previousToken = localStorage.getItem(TOKEN_KEY);
    const d = await loginMember(identity, password);
    if (localStorage.getItem(TOKEN_KEY) !== previousToken) {
      throw new Error('มีการเปลี่ยนบัญชีระหว่างเข้าสู่ระบบ กรุณาลองใหม่');
    }
    localStorage.setItem(TOKEN_KEY, d.token);
    setRestoreToken(null);
    setUser(d.user);
    setLoading(false);
    setError('');
  }
  async function logout() {
    const token = localStorage.getItem(TOKEN_KEY);
    try {
      await logoutMember();
    } finally {
      if (localStorage.getItem(TOKEN_KEY) === token || !localStorage.getItem(TOKEN_KEY)) {
        localStorage.removeItem(TOKEN_KEY);
        setRestoreToken(null);
        setUser(null);
        setLoading(false);
        setError('');
      }
    }
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        refresh,
        retrySession,
        canRetrySession: Boolean(restoreToken),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
