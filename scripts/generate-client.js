import { exec } from 'child_process';
import { existsSync } from 'fs';
import { mkdir, unlink, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const execPromise = promisify(exec);
const directoryName = path.dirname(fileURLToPath(import.meta.url));
const rootDirectory = path.resolve(directoryName, '..');
const frontendDirectory = path.join(rootDirectory, 'frontend');
const generatedClientDirectory = path.join(frontendDirectory, 'src', 'generated');
const openapiSpecPath = path.join(rootDirectory, 'openapi.json');

async function generateOpenApiSpec() {
    console.log('Generating OpenAPI specification from backend code...');

    if (existsSync(openapiSpecPath)) {
        await unlink(openapiSpecPath);
        console.log('Existing OpenAPI spec deleted, regenerating...');
    }

    try {
        const { stdout, stderr } = await execPromise(
            'uv run python -m minecraft_dashboard --generate-openapi openapi.json',
            { cwd: rootDirectory }
        );

        if (stdout) console.log(stdout);
        if (stderr && !stderr.includes('warning')) console.error(stderr);

        return true;
    } catch (error) {
        console.error('Error generating OpenAPI spec:', error.message);
        console.error('Make sure uv and Python are installed');
        return false;
    }
}

async function generateClient() {
    console.log('Generating TypeScript types and client...');

    if (!existsSync(generatedClientDirectory)) {
        await mkdir(generatedClientDirectory, { recursive: true });
    }

    const typesOutputPath = path.join(generatedClientDirectory, 'types.ts');
    const command = `npx openapi-typescript "${openapiSpecPath}" -o "${typesOutputPath}"`;

    try {
        const { stdout, stderr } = await execPromise(command, {
            cwd: frontendDirectory
        });

        if (stdout) console.log(stdout);
        if (stderr && !stderr.includes('created')) console.error(stderr);

        await generateFetchClient();

        console.log('TypeScript client generated successfully!');
        return true;
    } catch (error) {
        console.error('Error generating client:', error.message);
        return false;
    }
}

async function generateFetchClient() {
    const clientCode = `import type { paths } from './types';
import createClient from 'openapi-fetch';

const client = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000'
});

export default client;
export * from './types';
`;

    const clientPath = path.join(generatedClientDirectory, 'client.ts');
    await writeFile(clientPath, clientCode);

    const indexCode = `export { default as client } from './client';
export * from './types';
`;

    const indexPath = path.join(generatedClientDirectory, 'index.ts');
    await writeFile(indexPath, indexCode);
}

async function main() {
    console.log('=== OpenAPI Client Generator ===\n');

    const specGenerated = await generateOpenApiSpec();
    if (!specGenerated) {
        process.exit(1);
    }

    const clientGenerated = await generateClient();
    if (!clientGenerated) {
        process.exit(1);
    }

    console.log('\n=== Client generation complete! ===');
}

main().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
});
