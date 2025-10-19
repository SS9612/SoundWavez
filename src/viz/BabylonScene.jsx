import React, { useEffect, useRef } from 'react'
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, MeshBuilder, Color3 } from '@babylonjs/core'

export default function BabylonScene() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true })
    const scene = new Scene(engine)

    const camera = new ArcRotateCamera('cam', Math.PI/4, Math.PI/3, 6, new Vector3(0,0,0), scene)
    camera.attachControl(canvas, true)
    new HemisphericLight('light', new Vector3(0,1,0), scene)

    const sphere = MeshBuilder.CreateSphere('s', { diameter: 2 }, scene)

    engine.runRenderLoop(() => {
      sphere.rotation.y += 0.01
      scene.render()
    })
    const onResize = () => engine.resize()
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('resize', onResize); engine.dispose() }
  }, [])

  return <canvas ref={ref} className="w-full h-[480px] block rounded-xl overflow-hidden ring-1 ring-white/10" />
}
