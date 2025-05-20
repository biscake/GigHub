import { Checkbox } from "./Checkbox";

const Sidebar = () => {
  return (
    <aside className="w-fit h-[100vh] bg-blue-400 text-black text-[1.5rem] px-4 py-6 shadow">
      <p className="px-2">Filter By:</p>
      <ul>
        <li><Checkbox text="Genre 1"/></li>
        <li><Checkbox text="Genre 2"/></li>
        <li><Checkbox text="Genre 3"/></li>
      </ul>
  </aside>
  );
}

export default Sidebar;