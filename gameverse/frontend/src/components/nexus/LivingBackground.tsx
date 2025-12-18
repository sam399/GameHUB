import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '../../contexts/ThemeContext';

interface HexGridProps {
  mousePosition: { x: number; y: number };
  scrollProgress: number;
}

const HexagonalGrid: React.FC<HexGridProps> = ({ mousePosition, scrollProgress }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { viewport } = useThree();
  
  const hexagons = useMemo(() => {
    const temp = [];
    const hexRadius = 0.5;
    const cols = 30;
    const rows = 30;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * hexRadius * 1.5 - (cols * hexRadius * 1.5) / 2;
        const y = row * hexRadius * Math.sqrt(3) - (rows * hexRadius * Math.sqrt(3)) / 2;
        const offsetX = row % 2 === 0 ? 0 : hexRadius * 0.75;
        
        temp.push({
          position: [x + offsetX, y, -5],
          scale: 0.4,
          id: `${row}-${col}`
        });
      }
    }
    return temp;
  }, []);

  useFrame(({ clock, mouse }) => {
    if (!meshRef.current) return;

    const time = clock.getElapsedTime();
    const dummy = new THREE.Object3D();

    hexagons.forEach((hex, i) => {
      const [x, y, z] = hex.position;
      
      // Distance from mouse (normalized)
      const distanceFromMouse = Math.sqrt(
        Math.pow(x - mouse.x * 10, 2) + 
        Math.pow(y - mouse.y * 10, 2)
      );
      
      // Ripple effect based on mouse proximity
      const rippleEffect = Math.max(0, 1 - distanceFromMouse / 5);
      const waveHeight = Math.sin(time * 2 + distanceFromMouse * 0.5) * 0.2 * rippleEffect;
      
      // Scroll effect - move forward
      const scrollOffset = scrollProgress * 10;
      
      dummy.position.set(
        x + rippleEffect * Math.cos(time) * 0.1,
        y + rippleEffect * Math.sin(time) * 0.1,
        z + waveHeight + scrollOffset
      );
      
      dummy.rotation.z = time * 0.1 + rippleEffect * 0.5;
      dummy.scale.set(
        hex.scale + rippleEffect * 0.2,
        hex.scale + rippleEffect * 0.2,
        hex.scale + waveHeight * 2
      );
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  const hexagonGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const radius = 0.5;
    
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      
      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }
    shape.closePath();
    
    return new THREE.ShapeGeometry(shape);
  }, []);

  return (
    <instancedMesh ref={meshRef} args={[hexagonGeometry, undefined, hexagons.length]}>
      <meshBasicMaterial 
        color="#00f7ff"
        transparent
        opacity={0.15}
        side={THREE.DoubleSide}
        wireframe
      />
    </instancedMesh>
  );
};

const ParticleField: React.FC = () => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const count = 500;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 10;
    }
    
    return positions;
  }, []);

  useFrame(({ clock }) => {
    if (!particlesRef.current) return;
    
    const time = clock.getElapsedTime();
    particlesRef.current.rotation.y = time * 0.05;
    
    // Animate particles
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 2] += 0.01;
      if (positions[i + 2] > 10) {
        positions[i + 2] = -10;
      }
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#00f7ff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

export const LivingBackground: React.FC = () => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const { theme } = useTheme();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      });
    };

    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrolled / maxScroll);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="living-background">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      >
        <color attach="background" args={[theme === 'dark' ? '#050508' : '#ffffff']} />
        <fog attach="fog" args={[theme === 'dark' ? '#050508' : '#ffffff', 10, 30]} />
        
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#00f7ff" />
        <pointLight position={[-10, -10, 5]} intensity={0.3} color="#ff00e5" />
        
        <HexagonalGrid mousePosition={mousePosition} scrollProgress={scrollProgress} />
        <ParticleField />
      </Canvas>
    </div>
  );
};
