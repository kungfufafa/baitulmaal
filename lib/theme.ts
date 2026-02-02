import * as React from 'react';

export const TextClassContext = React.createContext<string | undefined>(undefined);

export const NAV_THEME = {
  light: {
    background: 'hsl(164 86% 16%)',
    border: 'hsl(164 86% 20%)',
    card: 'hsl(164 86% 16%)',
    notification: 'hsl(0 84% 60%)',
    primary: 'hsl(45 93% 47%)',
    text: 'hsl(0 0% 100%)',
  },
  dark: {
    background: 'hsl(164 86% 16%)',
    border: 'hsl(164 86% 20%)',
    card: 'hsl(164 86% 16%)',
    notification: 'hsl(0 62.8% 30.6%)',
    primary: 'hsl(45 93% 47%)',
    text: 'hsl(0 0% 100%)',
  },
};
