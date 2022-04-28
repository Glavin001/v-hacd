import { Physics, useBox, usePlane, useSphere } from '@react-three/cannon'
import { Canvas, useFrame } from '@react-three/fiber'
// import niceColors from 'nice-color-palettes'
import { useMemo, useRef, useState } from 'react'
import { Color } from 'three'

const rainDiameter = 1.5;

const Spheres = ({ colors, number, size }) => {
  const [ref, { at }] = useSphere(
    () => ({
      args: [size],
      mass: 0.001,
      position: [Math.random() - 0.5, Math.random() * 2 + 3, Math.random() - 0.5],
    }),
    useRef(null),
  )
//   useFrame(() => at(Math.floor(Math.random() * number)).position.set(0, Math.random() * 2, 0))
useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    // if (Math.floor(t) % 1 !== 0) {
    //     return;
    // }
    at(Math.floor(Math.random() * number)).position.set(Math.random() * rainDiameter - rainDiameter/2, Math.random() * 0.1 + 1, Math.random() * rainDiameter - rainDiameter/2)
})
return (
    <instancedMesh receiveShadow castShadow ref={ref} args={[undefined, undefined, number]}>
      <sphereBufferGeometry args={[size, 48]}>
        <instancedBufferAttribute attach="attributes-color" args={[colors, 3]} />
      </sphereBufferGeometry>
      <meshLambertMaterial vertexColors />
    </instancedMesh>
  )
}

const Boxes = ({ colors, number, size }) => {
  const args = [size, size, size]
  const [ref, { at }] = useBox(
    () => ({
      args,
      mass: 1,
      position: [Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5],
    }),
    useRef(null),
  )
  useFrame(() => at(Math.floor(Math.random() * number)).position.set(0, Math.random() * 2, 0))
  return (
    <instancedMesh receiveShadow castShadow ref={ref} args={[undefined, undefined, number]}>
      <boxBufferGeometry args={args}>
        <instancedBufferAttribute attach="attributes-color" args={[colors, 3]} />
      </boxBufferGeometry>
      <meshLambertMaterial vertexColors />
    </instancedMesh>
  )
}

const instancedGeometry = {
  box: Boxes,
  sphere: Spheres,
}

export const Rain = () => {
  const [geometry, setGeometry] = useState('sphere')
  const [number] = useState(200)
  const [size] = useState(0.05)

  const colors = useMemo(() => {
    const array = new Float32Array(number * 3)
    const color = new Color()
    for (let i = 0; i < number; i++)
      color
        // .set(niceColors[17][Math.floor(Math.random() * 5)])
        .set('red')
        .convertSRGBToLinear()
        .toArray(array, i * 3)
    return array
  }, [number])

  const InstancedGeometry = instancedGeometry[geometry]

  return (
    <InstancedGeometry {...{ colors, number, size }} />
  )
}
