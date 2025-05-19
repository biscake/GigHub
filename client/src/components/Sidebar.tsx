import { type CheckBoxProp } from "../types/checkBoxProps";

const Sidebar = () => {
  return (
    <aside className="w-fit h-[100vh] bg-blue-400 text-black text-[1.5rem] px-4 py-6 shadow">
      <p className="px-2">Filter By:</p>
      <ul>
        <li><Checkbox title="Genre 1"/></li>
        <li><Checkbox title="Genre 2"/></li>
        <li><Checkbox title="Genre 3"/></li>
      </ul>
  </aside>
  );
}

const Checkbox = ({ title }: CheckBoxProp) => {
  // TODO logic
  return (
    <label>
      <input type="checkbox" className="accent-pink-300 cursor-pointer align-middle" />
      <span className="text-[1rem] py-1 align-middle">{title}</span>
    </label>
  )
}

export default Sidebar;