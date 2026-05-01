CREATE TABLE IF NOT EXISTS processos_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eixo TEXT NOT NULL,
  area_responsavel TEXT NOT NULL,
  indicador_vinculado TEXT NOT NULL,
  processo TEXT NOT NULL,
  prazo_legal TEXT NOT NULL,
  penalidade TEXT NOT NULL,
  observacoes TEXT
);

CREATE TABLE IF NOT EXISTS volumes_planejados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  localidade TEXT NOT NULL,
  ponto TEXT NOT NULL,
  ano1 TEXT,
  ano2 TEXT,
  ano3 TEXT,
  ano4 TEXT,
  ano5 TEXT,
  ano6 TEXT,
  ano7 TEXT,
  ano8 TEXT,
  ano9 TEXT,
  ano10 TEXT,
  ano11 TEXT,
  ano12 TEXT,
  ano13 TEXT,
  ano14 TEXT,
  ano15 TEXT,
  ano16 TEXT,
  ano17 TEXT,
  ano18 TEXT,
  ano19 TEXT,
  ano20 TEXT,
  ano21 TEXT,
  ano22 TEXT,
  ano23 TEXT,
  ano24 TEXT,
  ano25 TEXT,
  ano26 TEXT,
  ano27 TEXT,
  ano28 TEXT,
  ano29 TEXT,
  ano30 TEXT,
  ano31 TEXT,
  ano32 TEXT,
  ano33 TEXT,
  ano34 TEXT,
  ano35 TEXT
);

CREATE TABLE IF NOT EXISTS comunicacao_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento TEXT NOT NULL,
  fund TEXT NOT NULL,
  destino TEXT NOT NULL,
  prazo TEXT NOT NULL,
  cont TEXT NOT NULL
);

-- RLS setup
ALTER TABLE processos_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE volumes_planejados ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunicacao_eventos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read processos_compliance" ON processos_compliance;
DROP POLICY IF EXISTS "Public read volumes_planejados" ON volumes_planejados;
DROP POLICY IF EXISTS "Public read comunicacao_eventos" ON comunicacao_eventos;
DROP POLICY IF EXISTS "Admin modify processos_compliance" ON processos_compliance;
DROP POLICY IF EXISTS "Admin modify volumes_planejados" ON volumes_planejados;
DROP POLICY IF EXISTS "Admin modify comunicacao_eventos" ON comunicacao_eventos;

-- Allow public read access
CREATE POLICY "Public read processos_compliance" ON processos_compliance FOR SELECT USING (true);
CREATE POLICY "Public read volumes_planejados" ON volumes_planejados FOR SELECT USING (true);
CREATE POLICY "Public read comunicacao_eventos" ON comunicacao_eventos FOR SELECT USING (true);

-- Allow only authenticated to modify
CREATE POLICY "Admin modify processos_compliance" ON processos_compliance USING (auth.role() = 'authenticated');
CREATE POLICY "Admin modify volumes_planejados" ON volumes_planejados USING (auth.role() = 'authenticated');
CREATE POLICY "Admin modify comunicacao_eventos" ON comunicacao_eventos USING (auth.role() = 'authenticated');
