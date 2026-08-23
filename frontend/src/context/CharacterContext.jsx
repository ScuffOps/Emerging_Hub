import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchCharacter } from '../api';

const CharacterContext = createContext(null);

export const CharacterProvider = ({ children }) => {
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCharacter();
      setCharacter(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return (
    <CharacterContext.Provider value={{ character, loading, error, setCharacter, reload }}>
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => useContext(CharacterContext);
