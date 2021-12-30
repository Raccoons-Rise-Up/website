# Contributing
## Setup
1. Clone `https://github.com/Raccoons-Rise-Up/website`
2. Download and install `LTS` [Node.js](https://nodejs.org/en/)
3. Navigate to `src/` and install all dependencies with `npm i`
4. Create `private.key` and `public.key` in `src/`, populate them with https://travistidwell.com/jsencrypt/demo/
5. Start `run.cmd` in root

Server can be found at `localhost:4000/index.html`

## Notes
If changing any of the opcode enums make sure to update the corresponding opcodes in the following areas:
- Website Client
- Website Server
- Godot Client
- Launcher Client
