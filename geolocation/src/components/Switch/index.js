import "./Styles.css";
// import { useTheme } from "../ThemeContext";
import { useTheme } from "../../ThemeContext";

const Switch = () => {
  const { theme, toggleTheme } = useTheme();
  return (
      
      <label className="switch">
        <input
          type="checkbox"
          checked={theme === "light"}
          onChange={toggleTheme}
        />
        <span className="slider round"
          style={{
            backgroundColor: theme == "light" ? "#eee": "#000"
          }} 
        />
      </label>
  );
 };

export default Switch;
