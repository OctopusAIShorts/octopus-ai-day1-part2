# Octopus AI, Day 1 Part 2: an animated 3D octopus with free tools

A small Remotion + three.js project. The octopus is rebuilt in code as a 3D character (inspired by the Octopus AI mascot, not an automatic animation of the generated image).

## Requirements
Node.js 18 or newer. All versions are pinned to what was tested.

## Run
    npm install
    npm run render      # writes out.mp4
    npm run studio      # live preview

`--gl=swangle` is the software-rendering flag that worked on a server without a GPU. On a normal computer with a GPU you can try removing it.

## Where things are
- src/Octo.tsx: the 3D octopus character (body, tentacles, eyes, blink, laptop), built from three.js shapes. No external assets.
- src/Root.tsx: registers the composition (1080x1920, 5 seconds).
- public/: put your own images here. Load them with staticFile('name.png').

## Licences
- Remotion: free for individuals and companies of up to 3 people, non-profits; larger companies need a company license. https://www.remotion.dev/docs/license/pricing
- three.js and @react-three/fiber: MIT.
