import React, { useState, useEffect, useMemo } from 'react'
import { Physics, Debug, usePlane, useCompoundBody, useSphere, CompoundBodyProps } from '@react-three/cannon'
import { ConvexGeometry, mergeVertices, ConvexHull } from 'three-stdlib'
import * as THREE from 'three'
import { useControls } from 'leva';

// import { OrbitControls, Box, Stats } from '@react-three/drei'
import { QuickHull } from '../src/QuickHull'
// import { Mite } from './Mite'
// import { Umbrella } from './Umbrella'

// import gearCollisionPoints from './gear-collision.json'
import gearCollisionPoints from '../../cube-hulls.json'
// import gearCollisionPoints from '../public/models/cube/decomp-2.json'

import { PhysicalModel } from './PhysicalModel';
import { Rain } from './Rain';

function Gear(props) {
  // console.log('gearCollisionPoints', gearCollisionPoints)

  const convexGeometries = useMemo(() => {
    return gearCollisionPoints.map((shapePoints) => {
      const points = shapePoints.map((p) => new THREE.Vector3().fromArray(p))
      // console.log('points', points)
      const geometry = new ConvexGeometry(points)

      // geometry.mergeVertices()
      // geometry.computeBoundingSphere()
      // geometry.computeFaceNormals()
      // const geometry = new THREE.Geometry() // create geometry
      //   .fromBufferGeometry(buffGeometry) // from buffer

      // return mergeVertices(geometry)
      //if using import statement
      //geometry = BufferGeometryUtils.mergeVertices(geometry);
      return geometry
    })
  }, [])

  // console.log('convexGeometries', convexGeometries)

  // const hullShapes = useMemo(
  //   () =>
  //     gearCollisionPoints.map((shapePoints) => ({
  //       type: ShapeType.HULL,
  //       points: shapePoints.map((p) => {
  //         return [p[0] + 0, p[1] + 0, p[2] + 0.125]
  //       })
  //     })),
  //   [gearCollisionPoints]
  // )

  // const shapes = useMemo(() => {
  //   return convexGeometries.map((geometry) => {
  //     let position = geometry.attributes.position.array
  //     // let geomFaces = geometry.index.array
  //     const geomFaces = geometry.attributes.normal.array

  //     const vertices = []
  //     const faces = []

  //     for (let i = 0; i < position.length; i += 3) {
  //       // points.push(new CANNON.Vec3(position[i], position[i+1], position[i+2]));
  //       vertices.push([position[i], position[i + 1], position[i + 2]])
  //     }

  //     for (let i = 0; i < geomFaces.length; i += 3) {
  //       faces.push([geomFaces[i], geomFaces[i + 1], geomFaces[i + 2]])
  //     }

  //     // const vertices = geometry.vertices.map(function (v) {
  //     //   return new CANNON.Vec3(v.x, v.y, v.z)
  //     //   // return [v.x, v.y, v.z];
  //     // })

  //     // const faces = geometry.faces.map(function (f) {
  //     //   return [f.a, f.b, f.c]
  //     // })

  //     return {
  //       type: 'ConvexPolyhedron',
  //       args: [vertices, faces]
  //     }
  //   })
  // }, [convexGeometries])

  // const shapes = useMemo(() => {
  //   return gearCollisionPoints.map((shapePoints) => {
  //     const points = shapePoints.map((p) => new THREE.Vector3().fromArray(p))
  //     const convexHull = new ConvexHull().setFromPoints(points)
  //     // const { vertices, faces } = convexHull
  //     console.log('convexHull', convexHull)

  //     // const vertices = convexHull.vertices.map(function (v) {
  //     //   // return new CANNON.Vec3(v.x, v.y, v.z)
  //     //   return [v.x, v.y, v.z]
  //     // })
  //     // const faces = convexHull.faces.map(function (f) {
  //     //   return [f.a, f.b, f.c]
  //     // })

  //     const hullFaces = convexHull.faces
  //     const vertices = []
  //     const faces = []
  //     for (let i = 0; i < hullFaces.length; i++) {
  //       const hullFace = hullFaces[i]
  //       const face = []
  //       faces.push(face)

  //       let edge = hullFace.edge
  //       do {
  //         const point = edge.head().point
  //         // vertices.push( new Vec3(point.x, point.y, point.z) );
  //         vertices.push([point.x, point.y, point.z])
  //         face.push(vertices.length - 1)
  //         edge = edge.next
  //       } while (edge !== hullFace.edge)
  //     }

  //     return {
  //       type: 'ConvexPolyhedron',
  //       args: [vertices, faces]
  //     }
  //   })
  // }, [])

  const shapes = useMemo(() => {
    return gearCollisionPoints.map((shapePoints) => {
      const vertices = shapePoints.map((p) => new THREE.Vector3().fromArray(p))
      // const convexHull = new ConvexHull().setFromPoints(vertices)
      // const { vertices, faces } = convexHull
      // console.log('convexHull', convexHull)

      const faces = QuickHull.createHull(vertices)

      console.log('hull', { vertices, faces })
      return {
        type: 'ConvexPolyhedron',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        // args: [vertices, faces]
        args: [shapePoints, faces]
      }
    })
  }, [])

  // console.log('shapes', shapes)

  const [ref] = useCompoundBody(
    () => ({
      mass: 1,
      ...props,
      shapes
      // shapes: [
      //   { type: 'Box', position: [0, 0, 0], rotation: [0, 0, 0], args: [1, 1, 1] },
      //   { type: 'Sphere', position: [1, 0, 0], rotation: [0, 0, 0], args: [0.65] }
      // ]
    }),
    undefined,
    [shapes]
  )

  return (
    <group ref={ref}>
      {convexGeometries.map((geo, index) => (
        <mesh key={index} receiveShadow castShadow geometry={geo}>
          <meshNormalMaterial />
        </mesh>
      ))}
    </group>
  )
}

function Plane(props) {
  const [ref] = usePlane(() => ({ type: 'Static', ...props }))
  return (
    <mesh receiveShadow ref={ref}>
      <planeGeometry args={[8, 8]} />
      <meshStandardMaterial color="#ffb385" />
    </mesh>
  )
}

function Ball(props) {
  const [ref] = useSphere(() => ({ type: 'Dynamic', ...props }))
  return (
    <mesh receiveShadow castShadow ref={ref}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="#ffb385" />
    </mesh>
  );
}

export const Scene = () => {
  const { model, debug, maxConvexHulls, ignoreCache, position } = useControls({
    model: {
      label: 'Model',
      value: 'https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/suzanne-low-poly/model.gltf',
      // value: 'https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/bunny/model.gltf',
      // value: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/low-poly-spaceship/model.gltf',
      // value: 'https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/boat-large/model.gltf',
      // value: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/zombie-car/model.gltf',
      // value: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/cromlech/model.gltf',
      // value: 'https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/bench/model.gltf',
      // value: 'https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/bed/model.gltf',
      // value: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/cybertruck/model.gltf',
      options: {
        'Suzanne': 'https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/suzanne-low-poly/model.gltf',
        // 'Bunny': 'https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/bunny/model.gltf',
        'Boat': 'https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/boat-large/model.gltf',
        'Spaceship': 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/low-poly-spaceship/model.gltf',
        // 'Zombie Car': 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/zombie-car/model.gltf',
        // 'Cromlech': 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/cromlech/model.gltf',
        'Bench': 'https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/bench/model.gltf',
        // 'Bed': 'https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/bed/model.gltf',
        'Cybertruck': 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/cybertruck/model.gltf',
      }
    },
    debug: {
      label: 'Debug',
      value: false,
    },
    ignoreCache: {
      label: 'Ignore Cache',
      value: false,
    },
    maxConvexHulls: {
      label: 'Max Convex Hulls',
      value: 32,
      min: 1,
      step: 1,
    },
    position: {
      label: 'Position',
      value: [0, 1, 0],
    }
  })

  return (
    <>
      <Rain />

      <PhysicalModel path={model} debug={debug} maxConvexHulls={maxConvexHulls} ignoreCache={ignoreCache} position={position} />

      {/* <Ball position={[0, 0, 0]} /> */}
      {/* <Gear position={[0, 1, 0]} /> */}
      {/* <Gear position={[0.5, 3, 0]} />
      <Gear position={[1.5, 1, 0]} /> */}
      {/* <Mite position={[0, 1, 0]} /> */}
      {/* <Umbrella /> */}
      {/* <PhysicalModel path="/models/spaceship.gltf" position={[0, 1, 0]} /> */}
      {/* <PhysicalModel path="https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/suzanne-low-poly/model.gltf" position={[0, 1, 0]} /> */}
      {/* <PhysicalModel path="https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/bunny/model.gltf" position={[0, 1, 0]} /> */}
      {/* <PhysicalModel path="https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/boat-large/model.gltf" position={[0, 1, 0]} /> */}
      {/* <PhysicalModel path="https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/low-poly-spaceship/model.gltf" position={[0, 1, 0]} /> */}

      {/* <PhysicalModel path="https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/broken-wall/model.gltf" position={[0, 1, 0]} /> */}
      {/* <PhysicalModel path="/models/table.gltf" position={[0, 1, 0]} /> */}
      {/* <PhysicalModel path="/models/cube.obj" position={[0, 1, 0]} /> */}

      {/* <PhysicalModel path="https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/zombie-car/model.gltf" position={[0, 1, 0]} /> */}
      {/* <PhysicalModel path="https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/cromlech/model.gltf" position={[0, 1, 0]} /> */}
      {/* <PhysicalModel path="https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/stairs/model.gltf" position={[0, 3, 0]} /> */}
      {/* <PhysicalModel path="https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/ruby/model.gltf" position={[0, 1, 0]} /> */}
      {/* <PhysicalModel path="https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/ruby/model.gltf" position={[0, 1, 3]} /> */}
      {/* <PhysicalModel path="https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/ruby/model.gltf" position={[3, 1, 0]} /> */}
      {/* <PhysicalModel path="https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/styrofoam/model.gltf" position={[1, 2, 0]} /> */}
      <Plane rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} />
    </>
  )
}
