import styles from './Sidebar.module.css';

const Sidebar = () => {
  return (
    <aside className={styles['sidebar']}>
      <p>Filter By:</p>
      <ul className={styles['genre-list']}>
        <li className={styles['genre']}><Checkbox />genre 1</li>
        <li className={styles['genre']}><Checkbox />genre 2</li>
        <li className={styles['genre']}><Checkbox />genre 3</li>
      </ul>
  </aside>
  );
}

const Checkbox = () => {
  // TODO logic
  return (
    <label>
      <input className={styles['checkbox']} type="checkbox"></input>
    </label>
  )
}

export default Sidebar;