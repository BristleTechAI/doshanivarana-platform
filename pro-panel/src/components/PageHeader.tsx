import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface HeaderContextType {
  title: string;
  backTo: string | -1 | null;
  setHeader: (title: string, backTo: string | -1 | null) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('');
  const [backTo, setBackTo] = useState<string | -1 | null>(null);

  const setHeader = (newTitle: string, newBackTo: string | -1 | null) => {
    setTitle(newTitle);
    setBackTo(newBackTo);
  };

  return (
    <HeaderContext.Provider value={{ title, backTo, setHeader }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeaderContext() {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeaderContext must be used within a HeaderProvider');
  }
  return context;
}

interface PageHeaderProps {
  title: string;
  backTo?: string | -1 | null;
}

export function PageHeader({ title, backTo = null }: PageHeaderProps) {
  const { setHeader } = useHeaderContext();

  useEffect(() => {
    setHeader(title, backTo);
  }, [title, backTo, setHeader]);

  return null;
}
