// customTheme.js
import { extendTheme } from '@chakra-ui/react';

const customTheme = extendTheme({
  styles: {
    global: {
      body: {
        bg: '#F5FFE4'
      }
    }
  },
  fonts: {
    heading: "KyivType Titling",
    p: "KyivType Titling",
    body: 'Lexend',
  },
  
});

export default customTheme;
