import * as THREE from "three";
import { Suspense, useState, useEffect, useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { OBJLoader, GLTFLoader, DRACOLoader, OBJExporter, ConvexGeometry } from "three-stdlib";
import { useGLTF, Clone } from "@react-three/drei";
import { useCompoundBody, CompoundBodyProps } from "@react-three/cannon";
import { QuickHull } from "../src/QuickHull";

// import { useVHACD } from "../src/hooks/useVHACD";
import { getCollisionHulls } from "../src/getCollisionHulls";

// import collisionHulls from '../public/models/spaceship-decomp.json'

export function PhysicalModel(props) {
  const { path, debug, maxConvexHulls, ignoreCache, position, rotation } = props;
  // const path = "/models/spaceship.obj";
  // const path = "/models/spaceship.gltf";
  console.log("PhysicalModel", path);

  /*
  const gltf = useGLTF(path);
  const obj = gltf.scene;
  // const obj = useLoader(OBJLoader, path)
  const { vertices, faces } = getVerticesAndFaces(obj);
  const { hulls: collisionHulls } = useVHACD({ vertices, faces });
  const collisionShapes = useHullShapes({ hulls: collisionHulls });
  */
  const { obj, collisionShapes, collisionHulls } = usePhysicsLoader({ path, maxConvexHulls, ignoreCache });
  // console.log('PhysicalModel gltf', gltf, collisionHulls)
  console.log("PhysicalModel obj", obj, collisionShapes);

  const [box3] = useState(() => new THREE.Box3());
  const [size] = useState(() => new THREE.Vector3());
  const [center] = useState(() => new THREE.Vector3());

  const defaultShapes = useMemo(() => {
    box3.makeEmpty();
    box3.expandByObject(obj);
    box3.getSize(size);
    box3.getCenter(center);
    return [
      {
        type: "Box",
        args: size.toArray(),
        position: center.toArray(),
      },
    ];
  }, [obj]);

  // const shapes = [
  //   {
  //     type: 'Box',
  //     // args: [1, 1, 1],
  //     args: size.toArray(),
  //     position: center.toArray(),
  //   },
  // ];
  const shapes = collisionShapes ?? defaultShapes;

  console.log("shapes", shapes);

  const [ref] = useCompoundBody(
    () => ({
      mass: 1,
      position: position || [0, 0, 0],
      rotation: rotation || [0, 0, 0],
      // ...props,
      shapes,
    }),
    undefined,
    [shapes, position, rotation]
  );

  return (
    <group ref={ref} {...props}>
      {/* <box3Helper args={[box3, "red"]} /> */}
      <Suspense fallback={null}>
        {/* <primitive object={gltf.scene} /> */}
        {/* <primitive object={obj} /> */}
        {!(debug && collisionHulls) && (<Clone receiveShadow castShadow object={obj} />)}
      </Suspense>
      {(debug && collisionHulls) && (
        <DebugHulls hulls={collisionHulls} />
      )}
    </group>
  );
}

function getVerticesAndFaces(object) {
  return useMemo(() => {
    console.log('getVerticesAndFaces');
    const exporter = new OBJExporter();
    const contents = exporter.parse(object);

    const rows = contents
      .split("\n")
      .filter(Boolean)
      .map((line) => line.split(" "));
    const vertices = rows
      .filter((row) => row[0] === "v")
      .map((row) => row.slice(1).map(parseFloat));
    const faces = rows
      .filter((row) => row[0] === "f")
      .map((row) => row.slice(1))
      .map((row) => row.map((cell) => parseInt(cell.split("/")[0], 10) - 1));
    // console.log(contents);
    console.log(vertices.length, faces.length);

    return {
      vertices,
      faces,
    };
  }, [object]);
}

function useHullShapes({ hulls }) {
  const shapes = useMemo(() => {
    if (!hulls) {
      return null;
    }
    console.log('useHullShapes', hulls);
    return hulls.map((shapePoints) => {
      const vertices = shapePoints.map((p) => new THREE.Vector3().fromArray(p));
      const faces = QuickHull.createHull(vertices);
      // console.log('hull', { vertices, faces })
      return {
        type: "ConvexPolyhedron",
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        // args: [vertices, faces]
        args: [shapePoints, faces],
      };
    });
  }, [hulls]);
  return shapes;
}

function usePhysicsLoader(options) {
  console.log('usePhysicsLoader', options);
  const { path, maxConvexHulls, ignoreCache } = options;
  let obj;
  if (path.endsWith(".gltf")) {
    const gltf = useGLTF(path);
    obj = gltf.scene;
  } else {
    obj = useLoader(OBJLoader, path)
  }
  const { vertices, faces } = getVerticesAndFaces(obj);
  // const { hulls: collisionHulls } = useVHACD({ vertices, faces });
  const key = JSON.stringify({
    path, maxConvexHulls
  });
  const collisionHulls = useLocalStorageCache(key, () => {
    console.log('getCollisionHulls', key);
    return getCollisionHulls({ vertices, faces, maxConvexHulls });
  }, [vertices, faces, maxConvexHulls], null, ignoreCache);
  console.log('hulls', collisionHulls);
  const collisionShapes = useHullShapes({ hulls: collisionHulls });
  return {
    obj,
    collisionHulls,
    collisionShapes,
  };
}

function useLocalStorageCache(key, callback, deps, defaultValue = null, ignoreCache = false) {
  const load = (key) => {
    try {
      const value = localStorage.getItem(key);
      if (value) {
        console.log('useLocalStorageCache', key, 'from localStorage');
        return JSON.parse(value);
      }
    } catch (e) {
      console.warn(e);
    }
    return defaultValue;
  };

  const [value, setValue] = useState(null);
  useEffect(() => {
    setValue(null);
  }, [key])

  const cachedValue = useMemo(() => {
    return load(key);
  }, [key]);

  useEffect(() => {
    if (!ignoreCache && cachedValue) {
      return;
    }
    console.log('Start update with callback', key);
    const value = callback();
    const update = (newValue) => {
      console.log('Finish updating', newValue);
      if (!newValue) {
        return;
      }
      localStorage.setItem(key, JSON.stringify(newValue));
      setValue(newValue);
    }
    if (value instanceof Promise) {
      value.then(update).catch(console.error);
    }
    else {
      update(value);
    }
    return () => {
      console.log('Cleanup', key, value);
      if ('cancel' in value) {
        value.cancel();
        console.log('Done cleanup');
      }
    }
  }, [key, ...deps, callback, ignoreCache]);

  // return value;
  return value || cachedValue;
}

function DebugHulls(props) {
  const { hulls } = props;
  const convexGeometries = useMemo(() => {
    return hulls.map((shapePoints) => {
      const points = shapePoints.map((p) => new THREE.Vector3().fromArray(p))
      const geometry = new ConvexGeometry(points)
      return geometry
    })
  }, [hulls])
  const colors = useMemo(() => {
    return hulls.map(hull => {
      const color = new THREE.Color( 0xffffff );
      color.setHex( Math.random() * 0xffffff );
      return color;
    })
  }, [hulls.length])
  return (
    <group>
      {convexGeometries.map((geo, index) => (
        <mesh key={index} receiveShadow castShadow geometry={geo}>
          {/* <meshNormalMaterial /> */}
          <meshStandardMaterial color={colors[index]} />
        </mesh>
      ))}
    </group>
  )
}