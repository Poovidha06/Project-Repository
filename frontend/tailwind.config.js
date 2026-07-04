/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: '#141319',
          light: '#1c1b23',
          lighter: '#26242e'
        },
        coral: {
          DEFAULT: '#ff7a5c',
          soft: '#ffab91',
          deep: '#e85d3f'
        },
        cream: '#f4efe9',
        muted: '#9b98a8',
        success: '#3ac07a',
        warning: '#f2a93b',
        danger: '#f2564a'
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif']
      },
      backgroundImage: {
        'coral-gradient': 'linear-gradient(135deg, #ffab91 0%, #ff7a5c 55%, #e85d3f 100%)',
        'radial-fade': 'radial-gradient(circle at 30% 20%, rgba(255,122,92,0.18), transparent 60%)'
      },
      boxShadow: {
        glow: '0 0 40px rgba(255,122,92,0.25)',
        card: '0 4px 24px rgba(0,0,0,0.35)'
      },
      borderRadius: {
        xl2: '1.25rem'
      }
    }
  },
  plugins: []
};
