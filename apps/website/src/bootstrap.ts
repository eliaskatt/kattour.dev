import './styles.css';
import { renderHomepage } from './homepage';

const root = document.getElementById('app');

if (!root) {
  throw new Error('Missing #app root');
}

root.innerHTML = renderHomepage();
