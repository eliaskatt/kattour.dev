import './styles.css';
import { mountPlayground } from './browser';

const root = document.getElementById('app');

if (!root) {
  throw new Error('Missing #app root');
}

mountPlayground(root);
