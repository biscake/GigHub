import styles from '../styles/Navbar.module.css';

function Navbar() {
  return (
    <nav className={styles['grid-container']}>
      <a className={styles['grid-item']} href='#'>
        GigHub
      </a>
      <p className={styles['grid-item']}>
        SearchBar
      </p>
      <p className={styles['grid-item']}>
        All Gigs(link)
      </p>
      <p className={styles['grid-item']}>
      </p>
      <p className={styles['grid-item']}>
        User(with Notif button)
      </p>
  </nav>
  );
}

export default Navbar;