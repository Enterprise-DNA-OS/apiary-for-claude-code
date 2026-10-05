import path from 'node:path';
import {getDb,REPO_ROOT,loadEnv} from './lib/db.mjs';
import {migrate} from './migrate.mjs';
import {seed} from './seed.mjs';
import {run,print} from './apiary.mjs';
loadEnv();if(process.env.DATABASE_URL)throw Error('Demo refuses DATABASE_URL');
process.env.DATA_DIR=path.join(REPO_ROOT,'.data/demo');
const db=await getDb();try{await migrate(db);await seed(db);for(const c of ['visit-round','treatment-watch','harvest-trace'])console.log(c+'\n'+print(await run(db,[c])));}finally{await db.close();}
