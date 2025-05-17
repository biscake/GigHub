import { type CheckBoxProp } from "../../types/checkBoxProps";

const Sidebar = () => {
  return (
    <aside className="w-24 h-100 bg-blue-400 text-black text-[0.5rem] px-1 py-2 shadow">
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
      <input type="checkbox" className="accent-pink-300 cursor-pointer scale-50 align-middle" />
      <span className="text-[0.4rem] py-1 align-middle">{title}</span>
    </label>
  )
}

export default Sidebar;