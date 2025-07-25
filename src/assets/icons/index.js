// src/assets/icons/index.js
// This file is the central repository for importing all your local SVG icon assets.
//
// When you download your SVG files (e.g., react.svg, python.svg, etc.):
// 1. Place them directly in the `src/assets/icons/` directory.
// 2. Add an import statement for each SVG, like:
//    import ReactSvg from './react.svg';
//    import PythonSvg from './python.svg';
//    import NodeJsSvg from './nodejs.svg';
//    etc.
//
// Then, add the imported SVG component to the `iconMap` below,
// using a normalized key (lowercase, no spaces) that matches your tech names.

import { Settings2 } from 'lucide-react'; // Generic fallback icon from Lucide React

// Placeholder for your actual SVG imports.
// Example:
// import ReactSvg from './react.svg';
// import PythonSvg from './python.svg';
// import JavascriptSvg from './javascript.svg';
// import Html5Svg from './html5.svg';
// import Css3Svg from './css3.svg';
// import TailwindCssSvg from './tailwindcss.svg';
// import GitSvg from './git.svg';
// import GithubSvg from './github.svg';
// import DockerSvg from './docker.svg';
// import AwsSvg from './aws.svg';
// import PostgresqlSvg from './postgresql.svg';
// import NodeJsSvg from './nodejs.svg';
// import ExpressJsSvg from './expressjs.svg';
// import SqlSvg from './sql.svg'; // If you have a generic SQL icon
// import CppSvg from './cpp.svg';
// import CSvg from './c.svg';
// import LinuxSvg from './linux.svg';


// This map will contain your imported SVG components.
// The keys should be normalized (lowercase, no spaces) to match the tech names.
export const iconAssets = {
  // Replace `Settings2` with your actual imported SVG component (e.g., `ReactSvg`)
  // and add more entries as you import your icons.

  // // Example structure (replace `Settings2` with your actual SVG component):
  // react: <Settings2 />, // Placeholder for React SVG
  // python: <Settings2 />, // Placeholder for Python SVG
  // javascript: <Settings2 />, // Placeholder for JavaScript SVG
  // html5: <Settings2 />, // Placeholder for HTML5 SVG
  // css3: <Settings2 />, // Placeholder for CSS3 SVG
  // tailwindcss: <Settings2 />, // Placeholder for Tailwind CSS SVG
  // git: <Settings2 />, // Placeholder for Git SVG
  // github: <Settings2 />, // Placeholder for GitHub SVG
  // docker: <Settings2 />, // Placeholder for Docker SVG
  // aws: <Settings2 />, // Placeholder for AWS SVG
  // postgresql: <Settings2 />, // Placeholder for PostgreSQL SVG
  // nodejs: <Settings2 />, // Placeholder for Node.js SVG
  // expressjs: <Settings2 />, // Placeholder for Express.js SVG
  // sql: <Settings2 />, // Placeholder for SQL SVG
  // cpp: <Settings2 />, // Placeholder for C++ SVG
  // c: <Settings2 />, // Placeholder for C SVG
  // linux: <Settings2 />, // Placeholder for Linux SVG
  // // Add more as needed
};

// Export a generic fallback icon for when a specific icon is not found.
export const GenericTechIcon = Settings2;