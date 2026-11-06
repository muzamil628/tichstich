import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Product } from '../types';
import {
  RotateCw,
  Layers,
  Box,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  X,
  Palette,
  Sun,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface ThreeDViewerProps {
  product: Product;
  onClose: () => void;
  onAddToCart?: (size: string, color: { name: string; hex: string }) => void;
}

export const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ product, onClose, onAddToCart }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || { name: 'Chalk White', hex: '#F4F4F5' });
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'Standard');
  const [isWireframe, setIsWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showMannequin, setShowMannequin] = useState(true);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);

  // Background color customization (solves: all colors of accessories visible to human eye)
  const bgPresets = [
    { name: 'Studio Mist', hex: '#F4F4F6', textDark: true },
    { name: 'Pure White', hex: '#FFFFFF', textDark: true },
    { name: 'Travertine Sand', hex: '#ECE7DF', textDark: true },
    { name: 'Concrete Grey', hex: '#94A3B8', textDark: true },
    { name: 'Deep Charcoal', hex: '#181A1E', textDark: false },
  ];
  const [bgChoice, setBgChoice] = useState(bgPresets[0]);

  // Stand / Mannequin finish customization (solves: stand contrast with accessories)
  const standFinishes = [
    { name: 'Birch Wood', hex: 0xC8AD8D, roughness: 0.65, metalness: 0.05 },
    { name: 'Brushed Chrome', hex: 0xCBD5E1, roughness: 0.25, metalness: 0.9 },
    { name: 'Matte Charcoal', hex: 0x27272A, roughness: 0.45, metalness: 0.2 },
    { name: 'Alabaster Stone', hex: 0xF3F3F5, roughness: 0.6, metalness: 0.05 },
  ];
  const [standChoice, setStandChoice] = useState(standFinishes[2]); // default charcoal

  // Three.js dynamic object references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const garmentMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const standMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const mannequinGroupRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Smooth High-Performance WebGLRenderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(bgChoice.hex);
    sceneRef.current = scene;

    // Procedural Studio Environment Reflection Map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Perspective Camera with Smooth Framing
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.25, 3.4);

    // Smooth Orbit Controls (buttery damping)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08; // smooth buttery damping
    controls.minDistance = 1.2;
    controls.maxDistance = 5.5;
    controls.maxPolarAngle = Math.PI / 2 + 0.15;
    controls.target.set(0, 0.95, 0);
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.2;
    controlsRef.current = controls;

    // Lighting Rig
    const keyLight = new THREE.DirectionalLight(0xFFFFFF, 2.4);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0xFFFFFF, 0xE2E8F0, 1.3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xF8FAFC, 1.5);
    rimLight.position.set(-3, 3, -3);
    scene.add(rimLight);

    // Contact Ground Shadow
    const shadowGeo = new THREE.PlaneGeometry(3.5, 3.5);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const ctx = shadowCanvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 60);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.28)');
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.10)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    shadowTex.colorSpace = THREE.SRGBColorSpace;
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.005;
    scene.add(shadowMesh);

    garmentMaterialsRef.current = [];
    standMaterialsRef.current = [];

    // Helper: Fabric Material
    const createFabricMaterial = (initialColorHex: string, roughness = 0.85, metalness = 0.04) => {
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(initialColorHex),
        roughness: roughness,
        metalness: metalness,
        wireframe: isWireframe,
      });
      garmentMaterialsRef.current.push(mat);
      return mat;
    };

    const primaryMat = createFabricMaterial(selectedColor.hex, 0.88, 0.04);
    const ribMat = createFabricMaterial(selectedColor.hex, 0.95, 0.02);
    const metallicHardwareMat = new THREE.MeshStandardMaterial({
      color: 0xD4D4D8,
      roughness: 0.2,
      metalness: 0.9,
      wireframe: false,
    });

    // 1. Mannequin / Display Stand
    const mannequinGroup = new THREE.Group();
    const standMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(standChoice.hex),
      roughness: standChoice.roughness,
      metalness: standChoice.metalness,
    });
    standMaterialsRef.current.push(standMat);

    const standPoleGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.45, 24);
    const standBaseGeo = new THREE.CylinderGeometry(0.35, 0.38, 0.03, 32);
    const standPole = new THREE.Mesh(standPoleGeo, standMat);
    standPole.position.y = 0.72;
    const standBase = new THREE.Mesh(standBaseGeo, standMat);
    standBase.position.y = 0.015;
    mannequinGroup.add(standPole, standBase);

    // Torso mannequin form
    const mannequinTorsoGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.85, 32);
    mannequinTorsoGeo.scale(1.25, 1, 0.85);
    const mannequinTorso = new THREE.Mesh(mannequinTorsoGeo, standMat);
    mannequinTorso.position.y = 1.05;
    mannequinGroup.add(mannequinTorso);

    // Neck topper
    const neckTopperGeo = new THREE.SphereGeometry(0.08, 24, 16);
    const neckTopper = new THREE.Mesh(neckTopperGeo, metallicHardwareMat);
    neckTopper.position.y = 1.55;
    mannequinGroup.add(neckTopper);

    scene.add(mannequinGroup);
    mannequinGroupRef.current = mannequinGroup;
    mannequinGroup.visible = showMannequin;

    // 2. Procedural Apparel Construction
    const productRootGroup = new THREE.Group();
    const itemType = product.model3dType;

    if (itemType === 'hoodie') {
      const hoodieGroup = new THREE.Group();

      // Torso Main Body
      const torsoGeo = new THREE.CylinderGeometry(0.32, 0.30, 0.78, 36);
      torsoGeo.scale(1.3, 1, 0.95);
      const torsoMesh = new THREE.Mesh(torsoGeo, primaryMat);
      torsoMesh.position.y = 1.02;
      torsoMesh.castShadow = true;
      hoodieGroup.add(torsoMesh);

      // Ribbed bottom hem
      const hemGeo = new THREE.CylinderGeometry(0.30, 0.29, 0.09, 36);
      hemGeo.scale(1.3, 1, 0.95);
      const hemMesh = new THREE.Mesh(hemGeo, ribMat);
      hemMesh.position.y = 0.6;
      hoodieGroup.add(hemMesh);

      // Sleeves
      const sleeveGeoL = new THREE.CylinderGeometry(0.12, 0.09, 0.68, 24);
      const sleeveMeshL = new THREE.Mesh(sleeveGeoL, primaryMat);
      sleeveMeshL.position.set(-0.48, 1.02, 0.02);
      sleeveMeshL.rotation.z = Math.PI / 8;
      sleeveMeshL.rotation.y = -0.1;
      sleeveMeshL.castShadow = true;
      hoodieGroup.add(sleeveMeshL);

      const cuffMeshL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.085, 0.08, 24), ribMat);
      cuffMeshL.position.set(-0.62, 0.71, 0.02);
      cuffMeshL.rotation.z = Math.PI / 8;
      hoodieGroup.add(cuffMeshL);

      const sleeveMeshR = new THREE.Mesh(sleeveGeoL, primaryMat);
      sleeveMeshR.position.set(0.48, 1.02, 0.02);
      sleeveMeshR.rotation.z = -Math.PI / 8;
      sleeveMeshR.rotation.y = 0.1;
      sleeveMeshR.castShadow = true;
      hoodieGroup.add(sleeveMeshR);

      const cuffMeshR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.085, 0.08, 24), ribMat);
      cuffMeshR.position.set(0.62, 0.71, 0.02);
      cuffMeshR.rotation.z = -Math.PI / 8;
      hoodieGroup.add(cuffMeshR);

      // 3D Hood
      const hoodGeo = new THREE.SphereGeometry(0.24, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.75);
      hoodGeo.scale(1.15, 1.25, 1.1);
      const hoodMesh = new THREE.Mesh(hoodGeo, primaryMat);
      hoodMesh.position.set(0, 1.48, -0.06);
      hoodMesh.rotation.x = 0.25;
      hoodMesh.castShadow = true;
      hoodieGroup.add(hoodMesh);

      // Kangaroo Pocket
      const pocketShape = new THREE.Shape();
      pocketShape.moveTo(-0.22, -0.12);
      pocketShape.lineTo(0.22, -0.12);
      pocketShape.lineTo(0.16, 0.12);
      pocketShape.lineTo(-0.16, 0.12);
      pocketShape.closePath();
      const pocketExtrude = new THREE.ExtrudeGeometry(pocketShape, {
        depth: 0.035,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.015,
        bevelThickness: 0.01,
      });
      const pocketMesh = new THREE.Mesh(pocketExtrude, primaryMat);
      pocketMesh.position.set(0, 0.85, 0.26);
      hoodieGroup.add(pocketMesh);

      // Drawstrings with Metallic Aglets (crisply visible)
      const stringCurveL = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.06, 1.38, 0.22),
        new THREE.Vector3(-0.08, 1.25, 0.27),
        new THREE.Vector3(-0.07, 1.10, 0.29),
      ]);
      const stringMeshL = new THREE.Mesh(new THREE.TubeGeometry(stringCurveL, 20, 0.007, 8, false), ribMat);
      const agletMeshL = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.045, 16), metallicHardwareMat);
      agletMeshL.position.set(-0.07, 1.08, 0.29);
      hoodieGroup.add(stringMeshL, agletMeshL);

      const stringCurveR = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.06, 1.38, 0.22),
        new THREE.Vector3(0.08, 1.25, 0.27),
        new THREE.Vector3(0.07, 1.09, 0.29),
      ]);
      const stringMeshR = new THREE.Mesh(new THREE.TubeGeometry(stringCurveR, 20, 0.007, 8, false), ribMat);
      const agletMeshR = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.045, 16), metallicHardwareMat);
      agletMeshR.position.set(0.07, 1.07, 0.29);
      hoodieGroup.add(stringMeshR, agletMeshR);

      productRootGroup.add(hoodieGroup);
    } else if (itemType === 'shawl') {
      // Flowing Cashmere Sahwal & 3pc Draped Wrap
      const shawlGroup = new THREE.Group();

      const loopGeo = new THREE.TorusGeometry(0.24, 0.12, 24, 48);
      loopGeo.scale(1.2, 1, 0.9);
      const loopMesh = new THREE.Mesh(loopGeo, primaryMat);
      loopMesh.position.set(0, 1.38, 0);
      loopMesh.rotation.x = Math.PI / 2.3;
      shawlGroup.add(loopMesh);

      const cascadeGeoL = new THREE.CylinderGeometry(0.18, 0.26, 0.85, 32, 1, true, 0, Math.PI * 1.4);
      cascadeGeoL.scale(1, 1, 0.6);
      const cascadeMeshL = new THREE.Mesh(cascadeGeoL, primaryMat);
      cascadeMeshL.position.set(-0.16, 0.92, 0.12);
      cascadeMeshL.rotation.y = 0.3;
      cascadeMeshL.rotation.z = 0.1;
      cascadeMeshL.castShadow = true;
      shawlGroup.add(cascadeMeshL);

      const cascadeGeoR = new THREE.CylinderGeometry(0.19, 0.29, 0.95, 32, 1, true, 0, Math.PI * 1.3);
      cascadeGeoR.scale(1, 1, 0.6);
      const cascadeMeshR = new THREE.Mesh(cascadeGeoR, primaryMat);
      cascadeMeshR.position.set(0.14, 0.86, 0.16);
      cascadeMeshR.rotation.y = -0.4;
      cascadeMeshR.rotation.z = -0.08;
      cascadeMeshR.castShadow = true;
      shawlGroup.add(cascadeMeshR);

      const backDrapeGeo = new THREE.CylinderGeometry(0.26, 0.34, 0.9, 32, 1, true, Math.PI, Math.PI);
      const backDrapeMesh = new THREE.Mesh(backDrapeGeo, primaryMat);
      backDrapeMesh.position.set(0, 0.9, -0.08);
      shawlGroup.add(backDrapeMesh);

      // Fringed selvedge
      for (let i = -7; i <= 7; i++) {
        const fringeGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.09, 6);
        const fringeMesh = new THREE.Mesh(fringeGeo, ribMat);
        fringeMesh.position.set(i * 0.035, 0.39, 0.22 + (i % 2) * 0.01);
        shawlGroup.add(fringeMesh);
      }

      productRootGroup.add(shawlGroup);
    } else if (itemType === 'bag') {
      const bagGroup = new THREE.Group();
      if (mannequinGroupRef.current) mannequinGroupRef.current.visible = false;

      const bodyShape = new THREE.Shape();
      const w = 0.52, h = 0.44, r = 0.04;
      bodyShape.moveTo(-w/2 + r, -h/2);
      bodyShape.lineTo(w/2 - r, -h/2);
      bodyShape.quadraticCurveTo(w/2, -h/2, w/2, -h/2 + r);
      bodyShape.lineTo(w/2, h/2 - r);
      bodyShape.quadraticCurveTo(w/2, h/2, w/2 - r, h/2);
      bodyShape.lineTo(-w/2 + r, h/2);
      bodyShape.quadraticCurveTo(-w/2, h/2, -w/2, h/2 - r);
      bodyShape.lineTo(-w/2, -h/2 + r);
      bodyShape.quadraticCurveTo(-w/2, -h/2, -w/2 + r, -h/2);

      const bodyExtrude = new THREE.ExtrudeGeometry(bodyShape, {
        depth: 0.26,
        bevelEnabled: true,
        bevelSegments: 4,
        steps: 1,
        bevelSize: 0.02,
        bevelThickness: 0.02,
      });
      const bagMesh = new THREE.Mesh(bodyExtrude, primaryMat);
      bagMesh.position.set(0, 0.8, -0.13);
      bagMesh.castShadow = true;
      bagGroup.add(bagMesh);

      // Twin Arched Handles
      const createHandle = (zPos: number) => {
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.16, 1.0, zPos),
          new THREE.Vector3(-0.16, 1.35, zPos),
          new THREE.Vector3(0.0, 1.48, zPos),
          new THREE.Vector3(0.16, 1.35, zPos),
          new THREE.Vector3(0.16, 1.0, zPos),
        ]);
        const handleMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.016, 12, false), primaryMat);
        handleMesh.castShadow = true;

        const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.05, 0.035), metallicHardwareMat);
        b1.position.set(-0.16, 1.01, zPos);
        const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.05, 0.035), metallicHardwareMat);
        b2.position.set(0.16, 1.01, zPos);

        const group = new THREE.Group();
        group.add(handleMesh, b1, b2);
        return group;
      };

      bagGroup.add(createHandle(0.135));
      bagGroup.add(createHandle(-0.135));

      // Metallic protective studs
      const studPositions = [
        [-0.22, 0.58, 0.10],
        [0.22, 0.58, 0.10],
        [-0.22, 0.58, -0.10],
        [0.22, 0.58, -0.10],
      ];
      studPositions.forEach(([x, y, z]) => {
        const stud = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.018, 0.018, 16), metallicHardwareMat);
        stud.position.set(x, y, z);
        bagGroup.add(stud);
      });

      productRootGroup.add(bagGroup);
    } else if (itemType === 'cap') {
      const capGroup = new THREE.Group();
      if (mannequinGroupRef.current) mannequinGroupRef.current.visible = false;

      const crownGeo = new THREE.SphereGeometry(0.24, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.52);
      crownGeo.scale(1.0, 0.88, 1.15);
      const crownMesh = new THREE.Mesh(crownGeo, primaryMat);
      crownMesh.position.set(0, 0.95, 0);
      crownMesh.castShadow = true;
      capGroup.add(crownMesh);

      const visorShape = new THREE.Shape();
      visorShape.moveTo(-0.19, 0);
      visorShape.quadraticCurveTo(0, -0.26, 0.19, 0);
      visorShape.quadraticCurveTo(0, -0.06, -0.19, 0);

      const visorExtrude = new THREE.ExtrudeGeometry(visorShape, {
        depth: 0.012,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize: 0.005,
        bevelThickness: 0.005,
      });
      const visorMesh = new THREE.Mesh(visorExtrude, primaryMat);
      visorMesh.rotation.x = Math.PI / 2 + 0.15;
      visorMesh.position.set(0, 0.94, 0.18);
      visorMesh.castShadow = true;
      capGroup.add(visorMesh);

      const buttonGeo = new THREE.SphereGeometry(0.024, 16, 12);
      buttonGeo.scale(1, 0.5, 1);
      const buttonMesh = new THREE.Mesh(buttonGeo, ribMat);
      buttonMesh.position.set(0, 1.16, 0);
      capGroup.add(buttonMesh);

      const strapGeo = new THREE.CylinderGeometry(0.235, 0.235, 0.03, 32, 1, true, Math.PI * 0.75, Math.PI * 0.5);
      const strapMesh = new THREE.Mesh(strapGeo, new THREE.MeshStandardMaterial({ color: 0x18181B, roughness: 0.5 }));
      strapMesh.position.set(0, 0.93, 0);
      const strapBuckle = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.025, 0.016), metallicHardwareMat);
      strapBuckle.position.set(0, 0.93, -0.245);
      capGroup.add(strapMesh, strapBuckle);

      productRootGroup.add(capGroup);
    } else {
      // Relaxed Tunic / Tee / 2pc Top
      const teeGroup = new THREE.Group();

      const bodyGeo = new THREE.CylinderGeometry(0.30, 0.28, 0.72, 36);
      bodyGeo.scale(1.28, 1, 0.9);
      const bodyMesh = new THREE.Mesh(bodyGeo, primaryMat);
      bodyMesh.position.y = 1.04;
      bodyMesh.castShadow = true;
      teeGroup.add(bodyMesh);

      const collarGeo = new THREE.TorusGeometry(0.14, 0.022, 16, 32);
      const collarMesh = new THREE.Mesh(collarGeo, ribMat);
      collarMesh.position.set(0, 1.40, 0);
      collarMesh.rotation.x = Math.PI / 2;
      teeGroup.add(collarMesh);

      const sleeveL = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.13, 0.35, 24), primaryMat);
      sleeveL.position.set(-0.46, 1.18, 0);
      sleeveL.rotation.z = Math.PI / 5;
      sleeveL.castShadow = true;

      const sleeveR = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.13, 0.35, 24), primaryMat);
      sleeveR.position.set(0.46, 1.18, 0);
      sleeveR.rotation.z = -Math.PI / 5;
      sleeveR.castShadow = true;

      teeGroup.add(sleeveL, sleeveR);
      productRootGroup.add(teeGroup);
    }

    scene.add(productRootGroup);

    // Highly Optimized Buttery Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [product.model3dType]);

  // Live update background color
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(bgChoice.hex);
    }
  }, [bgChoice]);

  // Live update stand finish & color
  useEffect(() => {
    standMaterialsRef.current.forEach((mat) => {
      mat.color.set(standChoice.hex);
      mat.roughness = standChoice.roughness;
      mat.metalness = standChoice.metalness;
    });
  }, [standChoice]);

  // Live update garment color
  useEffect(() => {
    garmentMaterialsRef.current.forEach((mat) => {
      mat.color.set(selectedColor.hex);
    });
  }, [selectedColor]);

  // Live update wireframe
  useEffect(() => {
    garmentMaterialsRef.current.forEach((mat) => {
      mat.wireframe = isWireframe;
    });
  }, [isWireframe]);

  // Live update auto-rotate
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Live update mannequin visibility
  useEffect(() => {
    if (mannequinGroupRef.current) {
      mannequinGroupRef.current.visible = showMannequin;
    }
  }, [showMannequin]);

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.target.set(0, 0.95, 0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-5 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl h-[92vh] rounded-2xl border border-neutral-300 overflow-hidden flex flex-col shadow-2xl transition-colors duration-300"
        style={{ backgroundColor: bgChoice.hex }}
      >
        {/* Top Minimal Bar */}
        <div
          className={`absolute top-0 inset-x-0 z-20 flex items-center justify-between px-6 py-4 border-b transition-colors duration-200 ${
            bgChoice.textDark
              ? 'bg-white/80 border-neutral-200/80 text-neutral-900'
              : 'bg-neutral-900/80 border-neutral-800 text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-bold tracking-wider opacity-60">
              TICHSTICH 3D STUDIO · 360° Realtime
            </span>
            <span className="hidden sm:inline text-xs opacity-40">·</span>
            <span className="hidden sm:inline text-xs font-semibold">
              {product.name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold tabular-nums">
              ${product.price}
            </span>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors ${
                bgChoice.textDark
                  ? 'hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900'
                  : 'hover:bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
              aria-label="Close 3D viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Central 3D Canvas Mount (100% Unobstructed) */}
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Quick Contrast Controls Bar (Top Left Float) */}
        <div className="absolute top-16 left-5 z-20 flex flex-col gap-2">
          
          {/* Background Contrast Presets */}
          <div className="bg-white/90 backdrop-blur-xs p-2 rounded-xl border border-neutral-200 shadow-md flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mr-1 flex items-center gap-1">
              <Palette className="w-3 h-3" /> BG
            </span>
            {bgPresets.map((b) => (
              <button
                key={b.name}
                onClick={() => setBgChoice(b)}
                title={`Change 3D Background: ${b.name}`}
                className={`w-5 h-5 rounded-full border transition-all ${
                  bgChoice.name === b.name
                    ? 'ring-2 ring-neutral-900 ring-offset-1 scale-110 border-transparent'
                    : 'border-neutral-300 hover:scale-105'
                }`}
                style={{ backgroundColor: b.hex }}
              />
            ))}
          </div>

          {/* Stand / Mannequin Contrast Presets */}
          {showMannequin && (
            <div className="bg-white/90 backdrop-blur-xs p-2 rounded-xl border border-neutral-200 shadow-md flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mr-1 flex items-center gap-1">
                <Box className="w-3 h-3" /> Stand
              </span>
              {standFinishes.map((s) => (
                <button
                  key={s.name}
                  onClick={() => setStandChoice(s)}
                  title={`Stand Finish: ${s.name} (Enhanced accessory contrast)`}
                  className={`w-5 h-5 rounded-full border transition-all ${
                    standChoice.name === s.name
                      ? 'ring-2 ring-neutral-900 ring-offset-1 scale-110 border-transparent'
                      : 'border-neutral-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: `#${s.hex.toString(16).padStart(6, '0')}` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Collapsible Unified Bottom Control Dock */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-3xl transition-transform duration-300">
          
          {/* Dock Collapse Toggle */}
          <div className="flex justify-center mb-1.5">
            <button
              onClick={() => setIsDockCollapsed(!isDockCollapsed)}
              className="px-3.5 py-1 bg-white border border-neutral-200 rounded-full text-xs font-semibold text-neutral-700 hover:text-neutral-900 shadow-md flex items-center gap-1.5 transition-colors"
            >
              {isDockCollapsed ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Show 3D & Contrast Controls</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Minimal View</span>
                </>
              )}
            </button>
          </div>

          {!isDockCollapsed && (
            <div className="bg-white/95 border border-neutral-200 rounded-2xl p-3.5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Garment Color Swatches */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Garment</span>
                <div className="flex items-center gap-1.5">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c)}
                      title={c.name}
                      className={`w-6 h-6 rounded-full border transition-all ${
                        selectedColor.name === c.name
                          ? 'ring-2 ring-neutral-900 ring-offset-2 scale-110 border-transparent'
                          : 'border-neutral-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    autoRotate ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>360° Spin</span>
                </button>

                <button
                  onClick={() => setIsWireframe(!isWireframe)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    isWireframe ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Wireframe</span>
                </button>

                <button
                  onClick={() => setShowMannequin(!showMannequin)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    showMannequin ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>Stand</span>
                </button>

                <button
                  onClick={handleResetCamera}
                  title="Reset 3D Camera"
                  className="p-2 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 rounded-lg text-xs transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Bag CTA */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => {
                    if (onAddToCart) {
                      onAddToCart(selectedSize, selectedColor);
                      onClose();
                    }
                  }}
                  className="w-full md:w-auto px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shadow-sm"
                >
                  Add to Bag · ${product.price}
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
