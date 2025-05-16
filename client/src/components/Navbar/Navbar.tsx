import styles from './Navbar.module.css';

const Navbar = () => {
  return (
    <nav className={styles['grid-container']}>
      <div className={styles['grid-item']}>
        <a href='/'>GigHub</a>
      </div>
      <p className={styles['grid-item']}>
        Dashboard
      </p>
      <p className={styles['grid-item']}>
      </p>
      <p className={styles['grid-item']}>
        SearchBar
      </p>
      <p className={styles['grid-item']}>
        User
      </p>
  </nav>
  );
}

export default Navbar;