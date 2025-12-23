import * as THREE from 'three';
import gsap from 'gsap';

export class HeroObject {
    mesh: THREE.Mesh;
    geometry: THREE.IcosahedronGeometry;
    material: THREE.ShaderMaterial;
    uniforms: { [uniform: string]: THREE.IUniform };

    constructor() {
        this.geometry = new THREE.IcosahedronGeometry(1, 64); // High detail for displacement

        this.uniforms = {
            uTime: { value: 0 },
            uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uScroll: { value: 0 },
            uColorA: { value: new THREE.Color('#ff206e') },
            uColorB: { value: new THREE.Color('#41ead4') },
        };

        this.material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: this.uniforms,
            // wireframe: true, // Debug
            side: THREE.DoubleSide,
            transparent: true,
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }

    update(time: number) {
        this.uniforms.uTime.value = time;

        // Gentle rotation
        this.mesh.rotation.y = time * 0.1;
        this.mesh.rotation.x = time * 0.05;
    }

    onMouseMove(event: MouseEvent) {
        // Normalize mouse coordinates -1 to 1
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = -(event.clientY / window.innerHeight) * 2 + 1;

        gsap.to(this.uniforms.uMouse.value, {
            x: x,
            y: y,
            duration: 1,
            ease: 'power2.out'
        });
    }

    onResize(width: number, height: number) {
        this.uniforms.uResolution.value.set(width, height);
    }

    onScroll(scrollY: number) {
        // Map scroll to some effect intensity or rotation
        const normalizedScroll = scrollY / (document.body.scrollHeight - window.innerHeight);
        this.uniforms.uScroll.value = normalizedScroll;
    }

    dispose() {
        this.geometry.dispose();
        this.material.dispose();
    }
}

// -----------------------------------------------------------------------------
// SHADERS
// -----------------------------------------------------------------------------

const vertexShader = `
uniform float uTime;
uniform vec2 uMouse;
uniform float uScroll;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vDisplacement;

// Classic Perlin 3D Noise 
// (Source: https://github.com/stegu/webgl-noise/blob/master/src/classicnoise3D.glsl)
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) { 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod289(i); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}

void main() {
    vUv = uv;
    vNormal = normal;

    // Noise parameters
    float noiseFreq = 2.0;
    float noiseAmp = 0.3;
    vec3 noisePos = position * noiseFreq + uTime * 0.5;
    
    // Add mouse influence
    noisePos.x += uMouse.x * 2.0;
    noisePos.y += uMouse.y * 2.0;

    float noise = snoise(noisePos);
    
    // Displacement along normal
    vec3 newPosition = position + normal * noise * noiseAmp;
    
    // Pass to fragment
    vDisplacement = noise;
    vPosition = newPosition;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vDisplacement;

void main() {
    // Normalizing displacement for color mixing
    float mixStrength = (vDisplacement + 0.5) * 1.5;
    
    // Mix two colors based on displacement
    vec3 color = mix(uColorA, uColorB, mixStrength);
    
    // Simple Fresnel effect for glow on edges
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = dot(viewDirection, vNormal);
    fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
    fresnel = pow(fresnel, 3.0);

    // Add fresnel to color
    color += vec3(1.0) * fresnel * 0.8;

    gl_FragColor = vec4(color, 1.0);
    
    // Basic tone mapping fix if needed
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
`;
