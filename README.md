# TS Compiler API Talk

To run this app, install dependencies with `pnpm`.

```
pnpm install
```

Then, build the scripts.

```
pnpm build:scripts
```

Scrpts can be run either by installing this app globally

```
npm i -g .
```

Or by simply running the scripts through `pnpm`.

```
pnpm <script-name>
```

## Scripts

- `analyze` - Analyze source code contained within the project and print out a response.
- `convert` - Run the transforms on the source code

### Convert options

```
Usage: convert [options]

Material UI to Tailwind CSS converter framework

Options:
  -r, --project-root <path>  path to project root
  -g, --glob <path>          glob pattern to match
  -d, --dry-run              do not write to files
  -o --organize-imports      organize imports
  -h, --help                 display help for command
```

## Running the web app.

The web app (vite + react) can be run with `pnpm start`.
