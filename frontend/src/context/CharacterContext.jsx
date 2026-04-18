import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchCharacter } from '../api';

const CharacterContext = createContext(null);

export const CharacterProvider = ({ children }) => {
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCharacter = async () => {
      try {
        const data = await fetchCharacter();
        setCharacter(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadCharacter();
  }, []);

  return (
    <CharacterContext.Provider value={{ character, loading, error, setCharacter }}>
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => useContext(CharacterContext);
