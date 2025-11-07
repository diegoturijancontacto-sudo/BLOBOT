// BLOBOT - 3D Robot Programming Environment
// Uses Babylon.js for 3D rendering

import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';

class RobotController {
    constructor(scene) {
        this.scene = scene;
        this.robot = null;
        this.initialPosition = new BABYLON.Vector3(0, 0.5, 0);
        this.initialRotation = 0;
        this.isAnimating = false;
        this.commandQueue = [];
    }

    async createRobot() {
        // Create a simple robot using basic shapes (royalty-free approach)
        // Body
        const body = BABYLON.MeshBuilder.CreateBox("body", {
            height: 1,
            width: 0.8,
            depth: 0.6
        }, this.scene);
        body.position.y = 0.5;
        
        // Head
        const head = BABYLON.MeshBuilder.CreateSphere("head", {
            diameter: 0.5
        }, this.scene);
        head.position.y = 1.25;
        head.parent = body;
        
        // Eyes
        const leftEye = BABYLON.MeshBuilder.CreateSphere("leftEye", {
            diameter: 0.1
        }, this.scene);
        leftEye.position = new BABYLON.Vector3(-0.15, 0.1, 0.2);
        leftEye.parent = head;
        
        const rightEye = BABYLON.MeshBuilder.CreateSphere("rightEye", {
            diameter: 0.1
        }, this.scene);
        rightEye.position = new BABYLON.Vector3(0.15, 0.1, 0.2);
        rightEye.parent = head;
        
        // Arms
        const leftArm = BABYLON.MeshBuilder.CreateCylinder("leftArm", {
            height: 0.8,
            diameter: 0.2
        }, this.scene);
        leftArm.position = new BABYLON.Vector3(-0.6, 0, 0);
        leftArm.parent = body;
        
        const rightArm = BABYLON.MeshBuilder.CreateCylinder("rightArm", {
            height: 0.8,
            diameter: 0.2
        }, this.scene);
        rightArm.position = new BABYLON.Vector3(0.6, 0, 0);
        rightArm.parent = body;
        
        // Legs
        const leftLeg = BABYLON.MeshBuilder.CreateCylinder("leftLeg", {
            height: 0.6,
            diameter: 0.2
        }, this.scene);
        leftLeg.position = new BABYLON.Vector3(-0.25, -0.8, 0);
        leftLeg.parent = body;
        
        const rightLeg = BABYLON.MeshBuilder.CreateCylinder("rightLeg", {
            height: 0.6,
            diameter: 0.2
        }, this.scene);
        rightLeg.position = new BABYLON.Vector3(0.25, -0.8, 0);
        rightLeg.parent = body;
        
        // Materials
        const bodyMaterial = new BABYLON.StandardMaterial("bodyMat", this.scene);
        bodyMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.6, 0.9);
        bodyMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        body.material = bodyMaterial;
        
        const headMaterial = new BABYLON.StandardMaterial("headMat", this.scene);
        headMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.7, 1);
        headMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        head.material = headMaterial;
        
        const eyeMaterial = new BABYLON.StandardMaterial("eyeMat", this.scene);
        eyeMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        eyeMaterial.emissiveColor = new BABYLON.Color3(0, 1, 0);
        leftEye.material = eyeMaterial;
        rightEye.material = eyeMaterial;
        
        const limbMaterial = new BABYLON.StandardMaterial("limbMat", this.scene);
        limbMaterial.diffuseColor = new BABYLON.Color3(0.25, 0.65, 0.95);
        leftArm.material = limbMaterial;
        rightArm.material = limbMaterial;
        leftLeg.material = limbMaterial;
        rightLeg.material = limbMaterial;
        
        this.robot = body;
        this.robot.position = this.initialPosition.clone();
    }

    async moveForward(distance) {
        if (this.isAnimating) {
            this.commandQueue.push({ type: 'forward', value: distance });
            return;
        }
        
        this.isAnimating = true;
        const startPos = this.robot.position.clone();
        const direction = this.robot.forward;
        const endPos = startPos.add(direction.scale(distance));
        
        await this.animateMovement(startPos, endPos, 500);
        this.isAnimating = false;
        this.processQueue();
    }

    async moveBackward(distance) {
        if (this.isAnimating) {
            this.commandQueue.push({ type: 'backward', value: distance });
            return;
        }
        
        this.isAnimating = true;
        const startPos = this.robot.position.clone();
        const direction = this.robot.forward;
        const endPos = startPos.subtract(direction.scale(distance));
        
        await this.animateMovement(startPos, endPos, 500);
        this.isAnimating = false;
        this.processQueue();
    }

    async turnLeft(degrees) {
        if (this.isAnimating) {
            this.commandQueue.push({ type: 'turnLeft', value: degrees });
            return;
        }
        
        this.isAnimating = true;
        const startRotation = this.robot.rotation.y;
        const endRotation = startRotation + (degrees * Math.PI / 180);
        
        await this.animateRotation(startRotation, endRotation, 500);
        this.isAnimating = false;
        this.processQueue();
    }

    async turnRight(degrees) {
        if (this.isAnimating) {
            this.commandQueue.push({ type: 'turnRight', value: degrees });
            return;
        }
        
        this.isAnimating = true;
        const startRotation = this.robot.rotation.y;
        const endRotation = startRotation - (degrees * Math.PI / 180);
        
        await this.animateRotation(startRotation, endRotation, 500);
        this.isAnimating = false;
        this.processQueue();
    }

    async processQueue() {
        if (this.commandQueue.length > 0) {
            const command = this.commandQueue.shift();
            switch (command.type) {
                case 'forward':
                    await this.moveForward(command.value);
                    break;
                case 'backward':
                    await this.moveBackward(command.value);
                    break;
                case 'turnLeft':
                    await this.turnLeft(command.value);
                    break;
                case 'turnRight':
                    await this.turnRight(command.value);
                    break;
            }
        }
    }

    animateMovement(startPos, endPos, duration) {
        return new Promise(resolve => {
            const startTime = Date.now();
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease in-out function
                const eased = progress < 0.5 
                    ? 2 * progress * progress 
                    : -1 + (4 - 2 * progress) * progress;
                
                this.robot.position = BABYLON.Vector3.Lerp(startPos, endPos, eased);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            animate();
        });
    }

    animateRotation(startRot, endRot, duration) {
        return new Promise(resolve => {
            const startTime = Date.now();
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease in-out function
                const eased = progress < 0.5 
                    ? 2 * progress * progress 
                    : -1 + (4 - 2 * progress) * progress;
                
                this.robot.rotation.y = startRot + (endRot - startRot) * eased;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            animate();
        });
    }

    reset() {
        this.robot.position = this.initialPosition.clone();
        this.robot.rotation.y = this.initialRotation;
        this.commandQueue = [];
        this.isAnimating = false;
    }
}

// Main application
let canvas, engine, scene, camera, robotController, codeEditor;

function createScene() {
    // Create scene
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.1, 0.1, 0.2);
    
    // Create camera
    camera = new BABYLON.ArcRotateCamera(
        "camera",
        -Math.PI / 2,
        Math.PI / 3,
        15,
        new BABYLON.Vector3(0, 0, 0),
        scene
    );
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 5;
    camera.upperRadiusLimit = 30;
    
    // Lights
    const light = new BABYLON.HemisphericLight(
        "light",
        new BABYLON.Vector3(0, 1, 0),
        scene
    );
    light.intensity = 0.7;
    
    const dirLight = new BABYLON.DirectionalLight(
        "dirLight",
        new BABYLON.Vector3(-1, -2, -1),
        scene
    );
    dirLight.position = new BABYLON.Vector3(5, 10, 5);
    dirLight.intensity = 0.5;
    
    // Ground
    const ground = BABYLON.MeshBuilder.CreateGround(
        "ground",
        { width: 20, height: 20 },
        scene
    );
    const groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    
    // Create grid pattern
    const gridTexture = new BABYLON.DynamicTexture("gridTexture", 512, scene);
    const ctx = gridTexture.getContext();
    ctx.fillStyle = "#333333";
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = "#555555";
    ctx.lineWidth = 2;
    for (let i = 0; i <= 512; i += 51.2) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 512);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(512, i);
        ctx.stroke();
    }
    gridTexture.update();
    groundMaterial.diffuseTexture = gridTexture;
    ground.material = groundMaterial;
    
    // Create robot controller
    robotController = new RobotController(scene);
    robotController.createRobot();
    
    return scene;
}

function initCodeEditor() {
    const defaultCode = `// Program your robot here!
// Available functions:
// - moveForward(distance) - Move robot forward
// - moveBackward(distance) - Move robot backward
// - turnLeft(degrees) - Turn robot left
// - turnRight(degrees) - Turn robot right
// - wait(milliseconds) - Wait before next command

async function main() {
    // Example program:
    moveForward(2);
    await wait(500);
    turnRight(90);
    await wait(500);
    moveForward(2);
}

main();`;

    codeEditor = new EditorView({
        doc: defaultCode,
        extensions: [
            basicSetup,
            javascript()
        ],
        parent: document.getElementById('codeEditor')
    });
}

function setupEventListeners() {
    // Manual control buttons
    document.getElementById('btnForward').addEventListener('click', () => {
        robotController.moveForward(1);
    });
    
    document.getElementById('btnBackward').addEventListener('click', () => {
        robotController.moveBackward(1);
    });
    
    document.getElementById('btnTurnLeft').addEventListener('click', () => {
        robotController.turnLeft(45);
    });
    
    document.getElementById('btnTurnRight').addEventListener('click', () => {
        robotController.turnRight(45);
    });
    
    document.getElementById('btnReset').addEventListener('click', () => {
        robotController.reset();
    });
    
    // Execute code button
    document.getElementById('btnExecute').addEventListener('click', () => {
        executeUserCode();
    });
}

function executeUserCode() {
    try {
        const code = codeEditor.state.doc.toString();
        
        // Create safe execution context with robot functions
        const moveForward = (distance) => robotController.moveForward(distance);
        const moveBackward = (distance) => robotController.moveBackward(distance);
        const turnLeft = (degrees) => robotController.turnLeft(degrees);
        const turnRight = (degrees) => robotController.turnRight(degrees);
        const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        
        // Execute user code in controlled context
        // Note: This uses AsyncFunction for educational purposes. In production,
        // consider using a proper code sandbox like vm2 or isolated-vm for security.
        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
        const userFunction = new AsyncFunction(
            'moveForward', 'moveBackward', 'turnLeft', 'turnRight', 'wait',
            code
        );
        
        userFunction(moveForward, moveBackward, turnLeft, turnRight, wait)
            .catch(error => {
                console.error('Error executing user code:', error);
                alert('Error in your code: ' + error.message);
            });
    } catch (error) {
        console.error('Error parsing user code:', error);
        alert('Error parsing your code: ' + error.message);
    }
}

// Initialize application
window.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('renderCanvas');
    engine = new BABYLON.Engine(canvas, true);
    
    createScene();
    initCodeEditor();
    setupEventListeners();
    
    // Render loop
    engine.runRenderLoop(() => {
        scene.render();
    });
    
    // Resize handler
    window.addEventListener('resize', () => {
        engine.resize();
    });
});
