'use client';

import React, {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {PointerLockControls} from 'three/examples/jsm/controls/PointerLockControls.js';
import {useActStateCheck} from "@/hooks";
import {ActionState, Phase} from "@/types";
import {getJsonCookie, setJsonCookie} from "@/lib/client/utils/chapters";
import {cookies, routes} from "@/lib/saveData";
import {useRouter} from "next/navigation";
import Cookies from "js-cookie";
import {whiteRoom} from "@/lib/client/data/chapters/IV";


export default function WhiteRoomPage() {
    const router = useRouter();
    const mountRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [phase, setPhase] = useState<Phase>('explore');
    const [instructions, setInstructions] = useState(whiteRoom.text.initialInstruction);

    // Check if bonus content is locked - redirect if so
    useEffect(() => {
        if (!Cookies.get(cookies.end)) router.replace(routes.bonus.locked);
    }, [router]);

    // Check if chapter is not yet released - redirect if so
    const isNotReleased = useActStateCheck("iv", ActionState.NotReleased, routes.bonus.notYet);


    // Scene references
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controlsRef = useRef<PointerLockControls | null>(null);

    // Player state
    const playerRef = useRef({
        velocity: new THREE.Vector3(),
        direction: new THREE.Vector3(),
        moveForward: false,
        moveBackward: false,
        moveLeft: false,
        moveRight: false,
        canJump: false,
        position: new THREE.Vector3(0, 1.6, 0)
    });

    // Atmosphere references
    const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
    const turningRef = useRef(false);
    const currentRotationRef = useRef(0);
    const timeRef = useRef(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    const droneOscillatorRef = useRef<OscillatorNode | null>(null);
    const droneGainRef = useRef<GainNode | null>(null);
    const figuresRef = useRef<THREE.Group[]>([]);
    const breathingLightsRef = useRef<THREE.PointLight[]>([]);
    const eyesRef = useRef<THREE.Mesh[]>([]);
    const controlsLockedRef = useRef(false);
    const darknessStartTimeRef = useRef(0);
    const playerStringsRef = useRef<THREE.Line[]>([]);
    const phaseRef = useRef(phase);
    const walkingTimeRef = useRef(0); // Track time spent walking
    const isWalkingRef = useRef(false);

    // Sync phase ref with phase state
    useEffect(() => {
        phaseRef.current = phase;
    }, [phase]);

    useEffect(() => {
        if (!mountRef.current || isNotReleased === null) return;

        // Initialize creepy ambient drone
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = audioContext;

            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(55, audioContext.currentTime); // Low frequency drone
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.start();

            droneOscillatorRef.current = oscillator;
            droneGainRef.current = gainNode;
        } catch (e) {
            console.warn(whiteRoom.text.audioWarning);
        }

        // Scene setup
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(whiteRoom.whiteHex, 0.015); // Exponential fog for depth
        sceneRef.current = scene;

        // Camera with uncanny FOV
        const camera = new THREE.PerspectiveCamera(
            85, // Slightly wider FOV for disorientation
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.copy(playerRef.current.position);
        cameraRef.current = camera;

        // Renderer with better quality
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(whiteRoom.whiteHex);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Lighting - sterile and uncomfortable
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
        ambientLightRef.current = ambientLight;

        const mainLight = new THREE.DirectionalLight(0xffffff, 0.6);
        mainLight.position.set(10, 20, 5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.far = 100;
        scene.add(mainLight);

        // Breathing point lights (subtle, uncanny)
        for (let i = 0; i < 4; i++) {
            const light = new THREE.PointLight(0xfafafa, 0.3, 30);
            const angle = (i / 4) * Math.PI * 2;
            light.position.set(Math.cos(angle) * 15, 3, Math.sin(angle) * 15);
            scene.add(light);
            breathingLightsRef.current.push(light);
        }

        // Ground - endless, sterile plane
        const groundGeometry = new THREE.PlaneGeometry(500, 500, 50, 50);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: whiteRoom.whiteHex,
            roughness: 0.9,
            metalness: 0.1,
            fog: true
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Add subtle texture variation to ground
        const vertices = groundGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i + 2] += (Math.random() - 0.5) * 0.05; // Tiny height variation
        }
        groundGeometry.attributes.position.needsUpdate = true;
        groundGeometry.computeVertexNormals();

        // Realistic white trees - slightly uncanny proportions
        const createTree = (x: number, z: number, scale: number = 1) => {
            const treeGroup = new THREE.Group();
            const treeMaterial = new THREE.MeshStandardMaterial({
                color: 0xe8e8e8,
                roughness: 0.7,
                metalness: 0.05
            });

            // Trunk - realistic bark-like cylinder
            const trunkGeometry = new THREE.CylinderGeometry(0.2 * scale, 0.3 * scale, 4 * scale, 8);
            const trunk = new THREE.Mesh(trunkGeometry, treeMaterial);
            trunk.position.y = 2 * scale;
            trunk.castShadow = true;
            treeGroup.add(trunk);

            // Main branches - more organic
            const branchCount = 8;
            for (let i = 0; i < branchCount; i++) {
                const angle = (i / branchCount) * Math.PI * 2;
                const branchY = 2.5 * scale + (Math.random() * scale);
                const branchLength = (0.8 + Math.random() * 0.6) * scale;

                const branchGeometry = new THREE.CylinderGeometry(0.05 * scale, 0.1 * scale, branchLength, 6);
                const branch = new THREE.Mesh(branchGeometry, treeMaterial);

                branch.position.y = branchY;
                branch.position.x = Math.cos(angle) * 0.15 * scale;
                branch.position.z = Math.sin(angle) * 0.15 * scale;
                branch.rotation.z = Math.cos(angle) * 0.6;
                branch.rotation.x = Math.sin(angle) * 0.6;
                branch.castShadow = true;
                treeGroup.add(branch);

                // Foliage clusters
                const foliageGeometry = new THREE.SphereGeometry(0.4 * scale, 6, 6);
                const foliageMaterial = new THREE.MeshStandardMaterial({
                    color: 0xf0f0f0,
                    roughness: 0.9,
                    fog: true
                });
                const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
                foliage.position.copy(branch.position);
                foliage.position.y += branchLength * 0.4;
                foliage.position.x += Math.cos(angle) * branchLength * 0.3;
                foliage.position.z += Math.sin(angle) * branchLength * 0.3;
                foliage.castShadow = true;
                treeGroup.add(foliage);
            }

            // Top foliage
            const topFoliageGeometry = new THREE.SphereGeometry(0.6 * scale, 6, 6);
            const topFoliageMaterial = new THREE.MeshStandardMaterial({
                color: 0xf5f5f5,
                roughness: 0.9
            });
            const topFoliage = new THREE.Mesh(topFoliageGeometry, topFoliageMaterial);
            topFoliage.position.y = 4 * scale;
            topFoliage.castShadow = true;
            treeGroup.add(topFoliage);

            treeGroup.position.set(x, 0, z);
            return treeGroup;
        };

        // Place multiple trees
        scene.add(createTree(-12, -20, 1.2));
        scene.add(createTree(-8, -35, 0.9));
        scene.add(createTree(-15, -50, 1.1));
        scene.add(createTree(10, -25, 1.0));
        scene.add(createTree(12, -45, 0.95));

        // Graveyard elements - tombstones
        const tombstoneMaterial = new THREE.MeshStandardMaterial({
            color: 0xd5d5d5,
            roughness: 0.9,
            metalness: 0.0
        });

        const tombstonePositions = [
            {x: -5, z: -15, rotation: 0.1},
            {x: -3, z: -18, rotation: -0.15},
            {x: 5, z: -17, rotation: 0.2},
            {x: 7, z: -22, rotation: -0.1},
            {x: -6, z: -25, rotation: 0.05},
            {x: 4, z: -28, rotation: -0.2},
            {x: -4, z: -32, rotation: 0.15}
        ];

        tombstonePositions.forEach(({x, z, rotation}) => {
            const tombstoneGroup = new THREE.Group();

            // Main stone
            const stoneGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.15);
            const stone = new THREE.Mesh(stoneGeometry, tombstoneMaterial);
            stone.position.y = 0.6;
            stone.castShadow = true;
            tombstoneGroup.add(stone);

            // Top rounded part
            const topGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.15, 8);
            const top = new THREE.Mesh(topGeometry, tombstoneMaterial);
            top.rotation.z = Math.PI / 2;
            top.position.y = 1.2;
            top.castShadow = true;
            tombstoneGroup.add(top);

            tombstoneGroup.position.set(x, 0, z);
            tombstoneGroup.rotation.y = rotation;
            scene.add(tombstoneGroup);
        });

        // Scattered flowers - small white flowers
        const flowerMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.6,
            emissive: 0xfafafa,
            emissiveIntensity: 0.1
        });

        for (let i = 0; i < 30; i++) {
            const flowerGroup = new THREE.Group();

            // Flower petals (5 small spheres in a circle)
            for (let p = 0; p < 5; p++) {
                const angle = (p / 5) * Math.PI * 2;
                const petalGeometry = new THREE.SphereGeometry(0.08, 4, 4);
                const petal = new THREE.Mesh(petalGeometry, flowerMaterial);
                petal.position.x = Math.cos(angle) * 0.12;
                petal.position.z = Math.sin(angle) * 0.12;
                petal.position.y = 0.1;
                petal.scale.y = 0.5;
                flowerGroup.add(petal);
            }

            // Center
            const centerGeometry = new THREE.SphereGeometry(0.06, 4, 4);
            const centerMaterial = new THREE.MeshStandardMaterial({
                color: 0xf5f5dc,
                roughness: 0.8
            });
            const center = new THREE.Mesh(centerGeometry, centerMaterial);
            center.position.y = 0.1;
            flowerGroup.add(center);

            // Position flowers around the scene
            const flowerX = (Math.random() - 0.5) * 30;
            const flowerZ = -10 + Math.random() * -50;
            flowerGroup.position.set(flowerX, 0, flowerZ);
            flowerGroup.rotation.y = Math.random() * Math.PI * 2;
            scene.add(flowerGroup);
        }

        // Clear path forward - darker, more defined
        const roadGeometry = new THREE.PlaneGeometry(6, 200);
        const roadMaterial = new THREE.MeshStandardMaterial({
            color: 0xb0b0b0,
            roughness: 0.95,
            fog: true
        });
        const road = new THREE.Mesh(roadGeometry, roadMaterial);
        road.rotation.x = -Math.PI / 2;
        road.position.set(0, -0.01, -100);
        road.receiveShadow = true;
        scene.add(road);

        // Road edge markers - subtle guides
        const markerMaterial = new THREE.MeshStandardMaterial({
            color: 0xc8c8c8,
            roughness: 0.9
        });

        for (let i = 0; i < 20; i++) {
            const zPos = -10 - (i * 10);

            // Left marker
            const leftMarker = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 0.5, 0.3),
                markerMaterial
            );
            leftMarker.position.set(-3.2, 0.25, zPos);
            leftMarker.castShadow = true;
            scene.add(leftMarker);

            // Right marker
            const rightMarker = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 0.5, 0.3),
                markerMaterial
            );
            rightMarker.position.set(3.2, 0.25, zPos);
            rightMarker.castShadow = true;
            scene.add(rightMarker);
        }

        // Hanging strings - thin, almost invisible, uncanny
        const stringMaterial = new THREE.LineBasicMaterial({
            color: 0xe0e0e0,
            transparent: true,
            opacity: 0.4
        });

        for (let i = 0; i < 40; i++) {
            const points = [];
            const x = (Math.random() - 0.5) * 60;
            const z = (Math.random() - 0.5) * 60;
            const height = 12 + Math.random() * 8;

            points.push(new THREE.Vector3(x, height, z));
            points.push(new THREE.Vector3(
                x + (Math.random() - 0.5) * 0.5,
                0,
                z + (Math.random() - 0.5) * 0.5
            ));

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, stringMaterial);
            scene.add(line);
        }

        // Strings attached to player - hanging from sky
        const playerStringMaterial = new THREE.LineBasicMaterial({
            color: 0xdddddd,
            transparent: true,
            opacity: 0.5
        });

        // Create 6 strings around the player
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const distance = 0.4 + Math.random() * 0.3;
            const offsetX = Math.cos(angle) * distance;
            const offsetZ = Math.sin(angle) * distance;
            const height = 15 + Math.random() * 5;

            const points = [
                new THREE.Vector3(offsetX, height, offsetZ),
                new THREE.Vector3(offsetX, 0, offsetZ)
            ];

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, playerStringMaterial);
            scene.add(line);
            playerStringsRef.current.push(line);
        }

        // Distant figures - humanoid but wrong
        const figureGeometry = new THREE.CapsuleGeometry(0.3, 1.4, 4, 8);
        const figureMaterial = new THREE.MeshStandardMaterial({
            color: 0xdcdcdc,
            roughness: 0.8,
            fog: true
        });

        const figurePositions = [
            {x: 20, z: -30, scale: 1.2},
            {x: -25, z: -45, scale: 0.9},
            {x: 15, z: -60, scale: 1.1},
            {x: -18, z: -55, scale: 1.0},
            {x: 30, z: -70, scale: 1.15}
        ];

        figurePositions.forEach(({x, z, scale}) => {
            const figureGroup = new THREE.Group();

            // Body
            const body = new THREE.Mesh(figureGeometry, figureMaterial);
            body.castShadow = true;
            figureGroup.add(body);

            // Head - slightly too large
            const headGeometry = new THREE.SphereGeometry(0.35 * scale, 8, 8);
            const head = new THREE.Mesh(headGeometry, figureMaterial);
            head.position.y = 1.1;
            head.castShadow = true;
            figureGroup.add(head);

            figureGroup.position.set(x, 0.9, z);
            figureGroup.scale.set(scale, scale, scale);
            figureGroup.rotation.y = Math.atan2(x, z); // Face toward center

            scene.add(figureGroup);
            figuresRef.current.push(figureGroup);
        });

        // Controls
        const controls = new PointerLockControls(camera, renderer.domElement);
        controlsRef.current = controls;

        controls.addEventListener('lock', () => {
            setInstructions('');
            setLoading(false);
        });

        controls.addEventListener('unlock', () => {
            const currentPhase = phaseRef.current;
            if (currentPhase === 'explore' || currentPhase === 'watching') {
                setInstructions(whiteRoom.text.clickToContinue);
            }
            // Don't show any instruction during darkening, eyes, or complete phases
        });

        const handleClick = () => {
            const currentPhase = phaseRef.current;
            // Only allow locking during explore, watching, and early darkening (before controls are locked)
            if ((currentPhase === 'explore' || currentPhase === 'watching' || (currentPhase === 'darkening' && !controlsLockedRef.current)) && !turningRef.current) {
                controls.lock();
                setInstructions(''); // Clear instructions on lock
            }
        };

        renderer.domElement.addEventListener('click', handleClick);

        // Keyboard controls
        type MoveKey = 'moveForward' | 'moveBackward' | 'moveLeft' | 'moveRight';
        const keyMap: Record<string, MoveKey> = {
            'KeyW': 'moveForward',
            'KeyS': 'moveBackward',
            'KeyA': 'moveLeft',
            'KeyD': 'moveRight'
        };

        const onKeyDown = (event: KeyboardEvent) => {
            const key = keyMap[event.code];
            if (key) {
                playerRef.current[key] = true;
            }
        };

        const onKeyUp = (event: KeyboardEvent) => {
            const key = keyMap[event.code];
            if (key) {
                playerRef.current[key] = false;
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);

        // Animation loop
        const clock = new THREE.Clock();
        let frameCount = 0;

        // Helper function to update player movement (DRY)
        const updatePlayerMovement = (delta: number) => {
            const player = playerRef.current;

            player.velocity.x -= player.velocity.x * 10.0 * delta;
            player.velocity.z -= player.velocity.z * 10.0 * delta;

            player.direction.z = Number(player.moveForward) - Number(player.moveBackward);
            player.direction.x = Number(player.moveRight) - Number(player.moveLeft);
            player.direction.normalize();

            if (player.moveForward || player.moveBackward) {
                player.velocity.z -= player.direction.z * 40.0 * delta;
            }
            if (player.moveLeft || player.moveRight) {
                player.velocity.x -= player.direction.x * 40.0 * delta;
            }

            controls.moveRight(-player.velocity.x * delta);
            controls.moveForward(-player.velocity.z * delta);

            return player.moveForward || player.moveBackward || player.moveLeft || player.moveRight;
        };

        const animate = () => {
            requestAnimationFrame(animate);

            const delta = clock.getDelta();
            timeRef.current += delta;
            frameCount++;

            // Breathing lights effect (subtle, unsettling)
            breathingLightsRef.current.forEach((light, index) => {
                const offset = index * Math.PI * 0.5;
                light.intensity = Math.sin(timeRef.current * whiteRoom.ambientDroneFreq + offset) * 0.15 + 0.3;
            });

            // Subtle figure sway (barely perceptible)
            figuresRef.current.forEach((figure, index) => {
                const offset = index * 0.7;
                figure.rotation.y = Math.atan2(figure.position.x, figure.position.z) +
                    Math.sin(timeRef.current * 0.3 + offset) * 0.05;
            });

            // Update player strings to follow camera
            playerStringsRef.current.forEach((line, index) => {
                const angle = (index / playerStringsRef.current.length) * Math.PI * 2;
                const distance = 0.4 + (index % 3) * 0.1;
                const offsetX = Math.cos(angle) * distance;
                const offsetZ = Math.sin(angle) * distance;

                const positions = line.geometry.attributes.position.array as Float32Array;
                // Top point stays at fixed height above player
                positions[0] = camera.position.x + offsetX;
                positions[1] = 15 + (index % 3) * 2;
                positions[2] = camera.position.z + offsetZ;
                // Bottom point follows player at head height
                positions[3] = camera.position.x + offsetX;
                positions[4] = camera.position.y + 0.3;
                positions[5] = camera.position.z + offsetZ;
                line.geometry.attributes.position.needsUpdate = true;
            });

            const currentPhase = phaseRef.current; // Get current phase from ref

            if (currentPhase === 'explore' && controls.isLocked) {
                // Update player movement and track walking
                const isCurrentlyWalking = updatePlayerMovement(delta);
                if (isCurrentlyWalking) {
                    walkingTimeRef.current += delta;
                    isWalkingRef.current = true;
                } else {
                    isWalkingRef.current = false;
                }

                // Debug logging
                if (frameCount % 60 === 0) { // Log once per second
                    console.log(`${whiteRoom.text.walkingTimeLog}`, walkingTimeRef.current.toFixed(2), `${whiteRoom.text.secondsLog}`, currentPhase);
                }

                // Gradually fade in ambient drone after 2 seconds
                if (droneGainRef.current && walkingTimeRef.current > 2) {
                    const targetVolume = Math.min((walkingTimeRef.current - 2) / 5, 0.15);
                    droneGainRef.current.gain.setValueAtTime(
                        targetVolume,
                        audioContextRef.current?.currentTime || 0
                    );
                }

                // Watching phase - figures subtly turn toward player after 5 seconds
                if (walkingTimeRef.current > 5 && currentPhase === 'explore') {
                    console.log(`${whiteRoom.text.enteringWatchingLog}`, walkingTimeRef.current.toFixed(2), `${whiteRoom.text.secondsLog}`);
                    setPhase('watching');
                    setInstructions('');
                }
            } else if (currentPhase === 'watching') {
                // Allow player to continue moving in watching phase
                if (controls.isLocked) {
                    // Update player movement and track walking
                    const isCurrentlyWalking = updatePlayerMovement(delta);
                    if (isCurrentlyWalking) {
                        walkingTimeRef.current += delta;
                    }

                    // Debug logging
                    if (frameCount % 60 === 0) {
                        console.log(`${whiteRoom.text.watchingWalkingLog}`, walkingTimeRef.current.toFixed(2), `${whiteRoom.text.secondsLog}`);
                    }
                }

                // Figures slowly orient toward player
                figuresRef.current.forEach((figure) => {
                    const targetRotation = Math.atan2(
                        camera.position.x - figure.position.x,
                        camera.position.z - figure.position.z
                    );
                    figure.rotation.y += (targetRotation - figure.rotation.y) * delta * 0.5;
                });

                // Continue darkening trigger - after 10 seconds of walking
                if (walkingTimeRef.current > 10 && currentPhase === 'watching') {
                    console.log(`${whiteRoom.text.enteringDarkeningLog}`, walkingTimeRef.current.toFixed(2), `${whiteRoom.text.secondsLog}`);
                    setPhase('darkening');
                    darknessStartTimeRef.current = timeRef.current;
                    setInstructions('');
                }
            } else if (currentPhase === 'darkening') {
                // Allow player to continue moving during darkness buildup
                if (controls.isLocked && !controlsLockedRef.current) {
                    updatePlayerMovement(delta);
                }

                // Gradual, unsettling transition to darkness over 8 seconds
                const darknessDuration = 8.0;
                const darknessProgress = Math.min((timeRef.current - darknessStartTimeRef.current) / darknessDuration, 1);

                // Debug logging
                if (frameCount % 30 === 0) {
                    console.log(`${whiteRoom.text.darkeningProgressLog}`, (darknessProgress * 100).toFixed(1) + '%');
                }

                if (ambientLightRef.current) {
                    ambientLightRef.current.intensity = 0.7 * (1 - darknessProgress);

                    // Transition fog color gradually
                    const fogColor = new THREE.Color(whiteRoom.whiteHex).lerp(
                        new THREE.Color(whiteRoom.blackHex),
                        darknessProgress
                    );
                    scene.fog = new THREE.FogExp2(fogColor.getHex(), 0.025 + darknessProgress * 0.08);
                    renderer.setClearColor(fogColor);

                    // Increase drone intensity
                    if (droneGainRef.current) {
                        droneGainRef.current.gain.setValueAtTime(
                            0.3 * darknessProgress,
                            audioContextRef.current?.currentTime || 0
                        );
                    }
                }

                // At 70% darkness, start removing control dynamically
                if (darknessProgress > 0.7 && !controlsLockedRef.current) {
                    controlsLockedRef.current = true;
                    console.log(whiteRoom.text.controlsLockedLog);
                    // Keep pointer lock active but stop processing input
                    // This prevents the "Click to continue" message from appearing
                }

                // At 95% darkness, begin the turn
                if (darknessProgress > 0.95) {
                    console.log(whiteRoom.text.enteringEyesLog);
                    setPhase('eyes');
                    turningRef.current = true;
                    // Only unlock if still locked
                    if (controls.isLocked) {
                        controls.unlock();
                    }
                    setInstructions(''); // Make sure instructions are cleared
                }
            } else if (currentPhase === 'eyes' && turningRef.current) {
                // Slow, forced 180-degree turn
                const turnSpeed = 0.5;
                currentRotationRef.current += turnSpeed * delta;
                camera.rotation.y = currentRotationRef.current;
                camera.rotation.x = 0;

                // Subtle head bob during turn
                camera.position.y = 1.6 + Math.sin(currentRotationRef.current * 3) * 0.03;

                // Create black eyes when turn is about 90 degrees (halfway)
                if (currentRotationRef.current > Math.PI / 2 && eyesRef.current.length === 0) {
                    // Create multiple pairs of glowing black eyes in the darkness
                    const eyeMaterial = new THREE.MeshBasicMaterial({
                        color: 0x000000
                    });

                    const eyeGlowMaterial = new THREE.MeshBasicMaterial({
                        color: 0x111111,
                        transparent: true,
                        opacity: 0.8
                    });

                    const eyePositions = [
                        {x: -2, y: 1.8, z: 5, spacing: 0.3},
                        {x: 1, y: 1.6, z: 4, spacing: 0.25},
                        {x: -4, y: 2.0, z: 6, spacing: 0.35},
                        {x: 3, y: 1.5, z: 5.5, spacing: 0.28},
                        {x: 0, y: 1.7, z: 3.5, spacing: 0.32},
                        {x: -1.5, y: 1.9, z: 7, spacing: 0.3},
                        {x: 2.5, y: 1.4, z: 6.5, spacing: 0.27},
                        {x: -3.5, y: 1.6, z: 4.5, spacing: 0.29}
                    ];

                    // Helper function to create a single eye with glow
                    const createEye = (xPos: number, yPos: number, zPos: number) => {
                        const eyeGroup = new THREE.Group();
                        const eye = new THREE.Mesh(
                            new THREE.SphereGeometry(0.08, 8, 8),
                            eyeMaterial
                        );
                        eyeGroup.add(eye);

                        const glow = new THREE.Mesh(
                            new THREE.SphereGeometry(0.12, 8, 8),
                            eyeGlowMaterial
                        );
                        eyeGroup.add(glow);

                        eyeGroup.position.set(xPos, yPos, zPos);
                        scene.add(eyeGroup);
                        eyesRef.current.push(eye);
                    };

                    eyePositions.forEach(({x, y, z, spacing}) => {
                        createEye(x - spacing / 2, y, z); // Left eye
                        createEye(x + spacing / 2, y, z); // Right eye
                    });

                    // Add point lights near eyes for eerie effect
                    eyePositions.slice(0, 4).forEach(({x, y, z}) => {
                        const eyeLight = new THREE.PointLight(0x0a0a0a, 0.5, 3);
                        eyeLight.position.set(x, y, z);
                        scene.add(eyeLight);
                    });
                }

                // Eyes slowly fade in visibility
                if (eyesRef.current.length > 0) {
                    const eyesFadeProgress = Math.min((currentRotationRef.current - Math.PI / 2) / (Math.PI / 2), 1);
                    eyesRef.current.forEach((eye) => {
                        if (eye.material instanceof THREE.MeshBasicMaterial) {
                            eye.material.opacity = eyesFadeProgress * 0.9;
                            eye.material.transparent = true;
                        }
                    });
                }

                if (currentRotationRef.current >= Math.PI) {
                    // Turn complete - BOOM close tab
                    setPhase('complete');
                    turningRef.current = false;

                    // Save completion
                    try {
                        const cur = getJsonCookie(cookies.chIV_progress) || {};
                        cur['WhiteRoom'] = 2;
                        setJsonCookie(cookies.chIV_progress, cur, 365);
                    } catch (e) {
                        console.warn(whiteRoom.text.progressSaveWarning);
                    }

                    // Immediate close - no message
                    setTimeout(() => {
                        window.close();
                        setTimeout(() => {
                            window.location.href = 'about:blank';
                        }, 500);
                    }, 200);
                }
            }

            renderer.render(scene, camera);
        };

        animate();

        // Window resize
        const handleResize = () => {
            if (!camera || !renderer) return;
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('resize', handleResize);

            // Clean up audio
            if (droneOscillatorRef.current) {
                droneOscillatorRef.current.stop();
                droneOscillatorRef.current.disconnect();
            }
            if (droneGainRef.current) {
                droneGainRef.current.disconnect();
            }
            if (audioContextRef.current) {
                audioContextRef.current.close().catch(console.error);
            }

            // Clean up Three.js
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }

            scene.traverse((object) => {
                if (object.type === 'Mesh') {
                    const mesh = object as THREE.Mesh;
                    mesh.geometry.dispose();
                    if (Array.isArray(mesh.material)) {
                        mesh.material.forEach(material => material.dispose());
                    } else {
                        mesh.material.dispose();
                    }
                }
            });

            renderer.dispose();
        };
    }, [isNotReleased]);

    return (
        <div style={{width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', background: '#000'}}>
            {isNotReleased === null ? (
                <div style={{
                    height: '100vh',
                    background: whiteRoom.blackStr,
                    color: whiteRoom.greenStr,
                    fontFamily: 'monospace',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>{whiteRoom.text.bootingMessage}</div>
            ) : (
                <>
                    <div ref={mountRef} style={{width: '100%', height: '100%'}}/>

                    {instructions && (
                        <div style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            color: phase === 'explore' ? '#000' : '#fff',
                            fontSize: '24px',
                            fontFamily: 'monospace',
                            textAlign: 'center',
                            pointerEvents: 'none',
                            zIndex: 1000,
                            textShadow: phase === 'explore' ? '2px 2px 4px rgba(255,255,255,0.8)' : '2px 2px 4px rgba(0,0,0,0.8)'
                        }}>
                            {instructions}
                            {phase === 'explore' && !loading && (
                                <div style={{marginTop: '20px', fontSize: '16px'}}>
                                    {whiteRoom.text.controlsHint}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

