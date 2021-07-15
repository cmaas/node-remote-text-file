export const SQL_001_INIT_UP = `
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "files" (
	"key"	    TEXT NOT NULL,
	"data"	    TEXT,
	"created"	INTEGER,
	"updated"	INTEGER,
	"readKey"	TEXT NOT NULL,
    "appendKey"	TEXT NOT NULL,
	PRIMARY KEY("key")
);
CREATE INDEX IF NOT EXISTS "idx_files_readKey" ON "files" (
	"readKey"	ASC
);
CREATE INDEX IF NOT EXISTS "idx_files_appendKey" ON "files" (
	"appendKey"	ASC
);
COMMIT;
`;

export const SQL_001_INIT_DOWN = `
BEGIN TRANSACTION;
DROP TABLE IF EXISTS "files";
COMMIT;
`;