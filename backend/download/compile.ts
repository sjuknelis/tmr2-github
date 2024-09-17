import { readFile, writeFile } from "fs/promises";

(async () => {
    let data: any[] = [];
    for ( const name of process.argv.slice(2) ) data = data.concat(JSON.parse((await readFile(name)).toString()));
    await writeFile("out.json", JSON.stringify(data, null, 4));
})();