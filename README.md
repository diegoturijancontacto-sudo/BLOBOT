# BLOBOT

A 3D Robot Programming Environment built with Babylon.js. This interactive web application allows users to program a virtual robot in a 3D environment and watch it execute commands in real-time.

## Features

- **3D Visualization**: Interactive 3D environment powered by Babylon.js
- **Robot Model**: Custom-built robot using geometric shapes (100% royalty-free)
- **Manual Controls**: Control the robot manually with intuitive buttons
  - Move Forward/Backward
  - Turn Left/Right
  - Reset position
- **Code Editor**: Built-in code editor with syntax highlighting (CodeMirror 6)
- **Programmable Robot**: Write JavaScript code to program robot movements
- **Available Functions**:
  - `moveForward(distance)` - Move robot forward
  - `moveBackward(distance)` - Move robot backward
  - `turnLeft(degrees)` - Turn robot left
  - `turnRight(degrees)` - Turn robot right
  - `wait(milliseconds)` - Wait before next command

## Technologies Used

- [Babylon.js](https://www.babylonjs.com/) - 3D rendering engine
- [CodeMirror 6](https://codemirror.net/) - Code editor
- [Vite](https://vitejs.dev/) - Build tool and dev server
- [Material Icons](https://fonts.google.com/icons) - UI icons (royalty-free)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/diegoturijancontacto-sudo/BLOBOT.git
cd BLOBOT
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

### Manual Control

Use the control buttons to move the robot:
- **Forward**: Move 1 unit forward
- **Backward**: Move 1 unit backward
- **Turn Left**: Rotate 45° left
- **Turn Right**: Rotate 45° right
- **Reset**: Return robot to starting position

### Programming the Robot

1. Write your code in the code editor panel
2. Use the available functions to create movement sequences
3. Click the **Execute** button to run your program

Example program:
```javascript
async function main() {
    moveForward(2);
    await wait(500);
    turnRight(90);
    await wait(500);
    moveForward(2);
}

main();
```

## License

MIT

## Acknowledgments

- Robot model created using Babylon.js geometric primitives (royalty-free)
- Icons from Material Icons (royalty-free)
- 3D rendering powered by Babylon.js (Apache 2.0 license)
