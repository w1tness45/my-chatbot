import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const DB_PATH = path.join(__dirname, 'db', 'chatbot.db');
const INIT_SQL = path.join(__dirname, 'db', 'init.sql');
const SEED_FAQS = path.join(__dirname, 'db', 'seed_faqs.json');

let db;
async function getDb(){ if(!db){ db = await open({ filename: DB_PATH, driver: sqlite3.Database }); } return db; }

async function initDb(){
  const database = await getDb();
  const initSql = fs.readFileSync(INIT_SQL, 'utf8');
  await database.exec(initSql);
  const faqs = JSON.parse(fs.readFileSync(SEED_FAQS, 'utf8'));
  const stmt = await database.prepare('INSERT INTO faqs (question, answer) VALUES (?, ?)');
  for(const f of faqs){ await stmt.run(f.question, f.answer); }
  await stmt.finalize();
  console.log('Database initialized with seed FAQs.');
}

app.get('/api/faq', async (req,res)=>{
  const q = (req.query.q||'').toString().trim();
  if(!q) return res.json({answer:''});
  const database = await getDb();
  const row = await database.get('SELECT answer FROM faqs WHERE question LIKE ? LIMIT 1', `%${q}%`);
  res.json({answer: row ? row.answer : ''});
});

app.post('/api/lead', async (req,res)=>{
  const { name, phone, email, message, payload } = req.body || {};
  const database = await getDb();
  await database.run('INSERT INTO leads (name, phone, email, message, raw_payload) VALUES (?,?,?,?,?)',
    name||null, phone||null, email||null, message||null, payload||null);
  res.json({ok:true});
});

const PORT = process.env.PORT || 3000;
if(process.argv.includes('--initdb')){
  (async()=>{ await initDb(); process.exit(0); })();
}else{
  (async()=>{ await getDb(); app.listen(PORT, ()=>console.log('Server running on http://localhost:'+PORT)); })();
}
