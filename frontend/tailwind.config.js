/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],

  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: '#f8f7f5',   // Main light background
          light: '#ffffff',     // Cards / navbar
          lighter: '#f1efec'    // Secondary light sections
        },

        coral: {
          DEFAULT: '#ff6f4f',
          soft: '#ff9a7d',
          deep: '#e85d3f'
        },

        cream: '#2b2930',       // Dark text instead of cream
        muted: '#6f6b78',       // Secondary text

        success: '#269b61',
        warning: '#d88b18',
        danger: '#dc4038'
      },

      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif']
      },

      backgroundImage: {
        'coral-gradient':
          'linear-gradient(135deg, #ff9a7d 0%, #ff6f4f 55%, #e85d3f 100%)',

        'radial-fade':
          'radial-gradient(circle at 30% 20%, rgba(255,111,79,0.10), transparent 60%)'
      },

      boxShadow: {
        glow: '0 0 40px rgba(255,111,79,0.15)',
        card: '0 4px 24px rgba(30,25,25,0.08)'
      },

      borderRadius: {
        xl2: '1.25rem'
      }
    }
  },

  plugins: []
};
